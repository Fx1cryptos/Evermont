import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { supabase } from '@/lib/supabase'
import type { Account, Profile } from '@/types'

type LedgerRow = {
  id: string
  created_at: string
  description: string
  category: string
  debit: string | number | null
  credit: string | number | null
  amount: string | number
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  balance_after: string | number
}

const money = (value: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [ledger, setLedger] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const [profileData, accountData] = await Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)])
        const accountIds = accountData.map((account) => account.id)
        const { data, error: ledgerError } = accountIds.length
          ? await supabase.from('ledger_entries').select('id, created_at, description, category, debit, credit, amount, status, balance_after').eq('member_id', user.id).in('account_id', accountIds).order('created_at', { ascending: false })
          : { data: [], error: null }
        if (ledgerError) throw ledgerError
        if (active) {
          setProfile(profileData)
          setAccounts(accountData)
          setLedger((data || []) as LedgerRow[])
        }
      } catch {
        if (active) setError('We could not load your member information. Please refresh and try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user])

  const availableBalance = useMemo(() => accounts.reduce((total, account) => total + Number(account.balance), 0), [accounts])
  const downloadStatement = () => {
    const rows = ledger.map((entry) => `${date(entry.created_at)}\t${entry.description}\t${entry.status}\t${money(entry.amount)}\t${money(entry.balance_after)}`)
    const content = ['Evermont Credit Union — Prototype statement data', 'Balances and history are simulated. Evermont is not a licensed bank.', '', 'Date\tDescription\tStatus\tAmount\tBalance after', ...rows].join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'evermont-prototype-statement.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-slate-600">Loading your member portal...</main>
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]"><Link className="rounded-full bg-[#0504AA] px-5 py-3 font-semibold text-white" to={ROUTES.LOGIN}>Sign in to member banking</Link></main>

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#101533]">
      <header className="border-b border-slate-200 bg-white px-5 py-4"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><Link to={ROUTES.DASHBOARD} className="flex items-center gap-3"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg" alt="Evermont Credit Union" className="size-11 rounded-xl object-cover" /><span><span className="block text-sm font-bold tracking-tight text-[#0504AA]">EVERMONT</span><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9A227]">Member portal</span></span></Link><div className="flex items-center gap-3"><a href="https://evermont.builder.cloud" className="rounded-full border border-[#0504AA] px-4 py-2 text-sm font-semibold text-[#0504AA] transition-colors hover:bg-[#0504AA] hover:text-white">Visit the Homepage</a><button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><LogOut className="size-4" />Sign out</button></div></div></header>
      <section className="mx-auto max-w-6xl px-5 py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Secure member banking</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Welcome, {profile?.firstName || user.firstName}.</h1><p className="mt-3 text-sm text-slate-600">{profile?.email || user.email}</p></div><button type="button" onClick={downloadStatement} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0504AA] px-5 py-3 text-sm font-semibold text-[#0504AA]"><Download className="size-4" />Download prototype statement</button></div>
        <div className="mt-7 rounded-2xl border border-[#eadca7] bg-[#fffaf0] p-4 text-sm text-[#5f4c00]"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p>Prototype notice: balances and history are simulated. Evermont is not a licensed bank. Pending entries are not completed payments and are excluded from available balance.</p></div></div>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]"><section className="relative overflow-hidden rounded-2xl bg-[#0504AA] p-6 text-white shadow-xl shadow-[#0504AA]/15"><div className="absolute -right-10 -top-12 size-40 rounded-full border border-white/15" /><p className="text-sm text-blue-100">Available balance</p><p className="mt-3 text-4xl font-semibold tracking-tight">{money(availableBalance)}</p><div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4"><span className="text-xs text-blue-100">Across {accounts.length} account{accounts.length === 1 ? '' : 's'}</span><span className="rounded-full bg-[#C9A227] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Member funds</span></div></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Your accounts</h2><span className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">Portfolio</span></div><div className="mt-4 flex flex-col gap-3">{accounts.length ? accounts.map((account) => <div key={account.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f8f9ff] p-4 transition-colors hover:border-[#C9A227]/50"><div><p className="font-semibold capitalize">{account.accountType.replace('_', ' ')}</p><p className="mt-1 text-sm text-slate-500">{account.accountNumber} · {account.status}</p></div><p className="font-semibold">{money(account.balance)}</p></div>) : <p className="text-sm text-slate-500">No member accounts are currently available.</p>}</div></section></div>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Recent activity</h2>{ledger.length ? <div className="mt-4 flex flex-col divide-y divide-slate-100">{ledger.map((entry) => <div key={entry.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium">{entry.description}</p><p className="text-sm text-slate-500">{date(entry.created_at)} · {entry.category}</p></div><p className={entry.credit ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-900'}>{entry.credit ? '+' : '-'}{money(entry.credit || entry.debit || entry.amount)}</p><div className="text-left sm:text-right"><p className="text-sm font-medium">{entry.status === 'pending' ? 'Pending verification — simulated test data' : entry.status}</p><p className="text-xs text-slate-500">Balance after: {money(entry.balance_after)}</p></div></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No transaction history is available for this member.</p>}</section>
      </section>
    </main>
  )
}

export default MemberDashboardPage
