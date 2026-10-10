import React, { useEffect, useMemo, useState } from 'react'
import { Download, Eye, EyeOff, Receipt, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { supabase } from '@/lib/supabase'
import { PortalShell } from '@/components/member/PortalShell'
import type { Account, Profile } from '@/types'

type LedgerRow = { id: string; created_at: string; description: string; category: string; debit: string | number | null; credit: string | number | null; amount: string | number; status: 'pending' | 'completed' | 'failed' | 'reversed'; balance_after: string | number }
const money = (value: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [ledger, setLedger] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const [profileData, accountData] = await Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)])
        const accountIds = accountData.map((account) => account.id)
        const result = accountIds.length ? await supabase.from('ledger_entries').select('id, created_at, description, category, debit, credit, amount, status, balance_after').eq('member_id', user.id).in('account_id', accountIds).order('created_at', { ascending: false }).limit(5) : { data: [], error: null }
        if (result.error) throw result.error
        if (active) { setProfile(profileData); setAccounts(accountData); setLedger((result.data || []) as LedgerRow[]) }
      } catch { if (active) setError('We could not load your member information. Please refresh and try again.') } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [user])

  const availableBalance = useMemo(() => accounts.reduce((total, account) => total + Number(account.balance), 0), [accounts])
  const downloadStatement = () => {
    const rows = ledger.map((entry) => `${date(entry.created_at)}\t${entry.description}\t${entry.status}\t${money(entry.amount)}\t${money(entry.balance_after)}`)
    const content = ['Evermont Credit Union — Member activity export', 'This export is derived from existing ledger records. It is not an official bank statement.', '', 'Date\tDescription\tStatus\tAmount\tBalance after', ...rows].join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'evermont-member-activity.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading your member portal...</main>
  if (!user) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Please sign in to view your member portal.</main>

  return <PortalShell title="Overview"><section className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Secure member banking</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome, {profile?.firstName || user.firstName}.</h2><p className="mt-2 text-sm text-slate-500">{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())}</p></div><div className="flex flex-wrap gap-3"><Link to={ROUTES.TRANSACTIONS} className="inline-flex items-center gap-2 rounded-xl bg-[#0504AA] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0504AA]/15"><Receipt className="size-4" />View transactions</Link><button type="button" onClick={downloadStatement} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0504AA]"><Download className="size-4" />Export activity</button></div></div>
    <div className="mt-7 rounded-2xl border border-[#eadca7] bg-[#fffaf0] p-4 text-sm text-[#5f4c00]"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p>Prototype notice: balances and ledger history are simulated. Evermont is not a licensed bank. Pending entries are not completed payments and are excluded from available balance.</p></div></div>
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="mt-8 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><section className="relative overflow-hidden rounded-2xl bg-[#0504AA] p-7 text-white shadow-xl shadow-[#0504AA]/15"><div className="absolute -right-12 -top-16 size-48 rounded-full border border-white/15" /><div className="relative"><div className="flex items-center justify-between"><p className="text-sm text-blue-100">Total available balance</p><button type="button" aria-label={showBalance ? 'Hide balance' : 'Show balance'} onClick={() => setShowBalance((visible) => !visible)} className="rounded-lg p-2 text-blue-100 hover:bg-white/10">{showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><p className="mt-4 text-4xl font-semibold tracking-tight">{showBalance ? money(availableBalance) : '••••••'}</p><div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4"><span className="text-xs text-blue-100">{accounts.length} account{accounts.length === 1 ? '' : 's'} connected</span><span className="rounded-full bg-[#C9A227] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Member funds</span></div></div></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">Portfolio</p><h3 className="mt-1 text-lg font-semibold">Your accounts</h3></div><span className="text-xs text-slate-500">{accounts.length} total</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{accounts.length ? accounts.map((account) => <div key={account.id} className="rounded-xl border border-slate-100 bg-[#f8f9ff] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold capitalize">{account.accountType.replace('_', ' ')}</p><p className="mt-1 text-xs text-slate-500">{account.accountNumber} · {account.status}</p></div><span className="size-2 rounded-full bg-emerald-500" aria-label="Active account" /></div><p className="mt-5 text-xl font-semibold">{showBalance ? money(account.balance) : '••••••'}</p></div>) : <p className="text-sm text-slate-500">No member accounts are currently available.</p>}</div></section></div>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">Latest records</p><h3 className="mt-1 text-lg font-semibold">Recent activity</h3></div><Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">View all</Link></div>{ledger.length ? <div className="mt-4 flex flex-col divide-y divide-slate-100">{ledger.map((entry) => { const credit = Boolean(entry.credit); return <div key={entry.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-medium">{entry.description}</p><p className="mt-1 text-sm text-slate-500">{date(entry.created_at)} · <span className="capitalize">{entry.category}</span> · <span className="capitalize">{entry.status}</span></p></div><p className={`font-semibold sm:text-right ${credit ? 'text-emerald-700' : 'text-[#101533]'}`}>{credit ? '+' : '-'}{money(entry.credit || entry.debit || entry.amount)}</p></div> })}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No transaction history is available for this member.</p>}</section>
  </section></PortalShell>
}

export default MemberDashboardPage
