import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Bell, Building2, CreditCard, Eye, EyeOff, FileText, Headphones, Landmark, Menu, Receipt, Send, ShieldCheck, Smartphone, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivationRequiredModal } from '@/components/member/ActivationRequiredModal'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { supabase } from '@/lib/supabase'
import { useActivationGate } from '@/hooks/useActivationGate'
import { useNotifications } from '@/hooks/useNotifications'
import type { Account, Profile } from '@/types'

type Row = { id: string; created_at: string; description: string; category: string; debit: number | string | null; credit: number | string | null; amount: number | string; status: string }
type GateResult = { activated: boolean; fee: number | null; ratePercent: number | null }

const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [hidden, setHidden] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gateOpen, setGateOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [gateResult, setGateResult] = useState<GateResult>({ activated: false, fee: null, ratePercent: null })
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts])
  const { check: checkActivation, checking } = useActivationGate(user?.id, total)
  const { unreadCount } = useNotifications(user?.id)

  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)]).then(async ([p, a]) => {
      if (!active) return
      setProfile(p)
      setAccounts(a)
      const ids = a.map(account => account.id)
      if (!ids.length) return
      const { data, error: queryError } = await supabase.from('ledger_entries').select('id,created_at,description,category,debit,credit,amount,status').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false }).limit(5)
      if (queryError) setError('We could not load recent activity.')
      else setRows((data || []) as Row[])
    }).catch(() => setError('We could not load your member information.')).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user || loading) return
    void checkActivation().then(setGateResult)
  }, [user, loading, checkActivation])

  const display = (value: unknown) => hidden ? '••••••' : money(value)
  const feeLine = gateResult.fee != null
    ? `An activation fee of ${money(gateResult.fee)} is required before transfers and certain services become available.`
    : 'An activation fee is required before transfers and certain services become available.'

  const requestMovement = () => {
    setNotice('')
    if (gateResult.activated) {
      setNotice('Transfer and withdraw are not available yet. This prototype does not move money.')
      return
    }
    setGateOpen(true)
  }

  const services: Array<{ label: string; subtext: string; icon: React.FC<{ className?: string }>; to?: string; gated?: boolean }> = [
    { label: 'Transfer', subtext: 'Requires activation', icon: Send, gated: true },
    { label: 'Withdraw', subtext: 'Requires activation', icon: WalletCards, gated: true },
    { label: 'ACH', subtext: 'Requires activation', icon: Building2, gated: true },
    { label: 'Mobile Deposit', subtext: 'Requires activation', icon: Smartphone, gated: true },
    { label: 'Check Deposit', subtext: 'Requires activation', icon: FileText, gated: true },
    { label: 'Mobile Debit', subtext: 'Requires activation', icon: CreditCard, gated: true },
    { label: 'Virtual Card', subtext: 'Requires activation', icon: WalletCards, gated: true },
    { label: 'Message Support', subtext: 'Chat with our team', icon: Headphones, to: ROUTES.SUPPORT },
    { label: 'Accounts', subtext: 'View your accounts', icon: Landmark, to: ROUTES.ACCOUNTS },
    { label: 'Transactions', subtext: 'Review activity', icon: Receipt, to: ROUTES.TRANSACTIONS },
  ]

  if (authLoading || loading) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] text-sm text-slate-500">Loading your member portal...</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in to member banking</Link></main>

  return <PortalShell title={`Welcome, ${profile?.firstName || user.firstName}.`} eyebrow="Private wealth">
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xl text-sm leading-6 text-slate-600">Your accounts, activity, and services in one private view.</p>
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <Bell className="size-4 text-[#0504AA]" />
          Notifications
          {unreadCount > 0 && <span className="rounded-full bg-[#C9A227] px-2 py-0.5 text-xs text-[#101533]">{unreadCount}</span>}
        </div>
        <button type="button" onClick={() => setHidden(!hidden)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {hidden ? 'Show balances' : 'Hide balances'}
        </button>
      </div>
    </div>

    {!gateResult.activated && <section className="mt-6 rounded-2xl border border-[#C9A227]/50 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#C9A227]">Account activation required</p>
      <h2 className="mt-2 text-xl font-semibold text-[#101533]">Activate your account to unlock transfers and select services.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{feeLine}</p>
      {gateResult.ratePercent != null && <p className="mt-1 text-sm text-slate-500">Calculated at {gateResult.ratePercent}% of available balance.</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to={ROUTES.ACTIVATION} className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">View Activation Details</Link>
        <Link to={ROUTES.SUPPORT} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0504AA] hover:border-[#C9A227]">Message Support</Link>
      </div>
    </section>}

    <section className="mt-6 overflow-hidden rounded-3xl bg-[#0504AA] text-white shadow-xl shadow-blue-950/10">
      <div className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#C9A227]">Total relationship balance</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{hidden ? '••••••' : money(total)}</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-blue-100">A clear view across your authorized Evermont accounts.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to={ROUTES.ACCOUNTS} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0504AA]">View accounts</Link>
          <Link to={ROUTES.TRANSACTIONS} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white">View activity</Link>
          <button type="button" disabled={checking} onClick={requestMovement} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Transfer</button>
          <button type="button" disabled={checking} onClick={requestMovement} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Withdraw</button>
        </div>
        {notice && <p role="status" className="mt-4 max-w-lg rounded-xl bg-white/10 p-3 text-sm text-blue-50">{notice}</p>}
      </div>
    </section>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your accounts</h2>
          <Link to={ROUTES.ACCOUNTS} className="text-sm font-semibold text-[#0504AA]">Manage accounts</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.length ? accounts.map(account => <article key={account.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[#0504AA]/8 p-2.5 text-[#0504AA]"><Landmark className="size-5" /></div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{account.status}</span>
            </div>
            <p className="mt-5 text-sm capitalize text-slate-500">{account.accountType} · {account.accountNumber || 'Account'}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{display(account.balance)}</p>
          </article>) : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No accounts are available for this member.</p>}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">See all</Link>
        </div>
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error ? <p className="p-5 text-sm text-red-700">{error}</p> : rows.length ? rows.map(row => {
            const credit = Number(row.credit || 0) > 0
            return <div key={row.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`rounded-full p-2 ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.description}</p>
                  <p className="text-xs text-slate-500">{new Date(row.created_at).toLocaleDateString()} · {row.status}</p>
                </div>
              </div>
              <p className={`shrink-0 text-sm font-semibold ${credit ? 'text-emerald-700' : 'text-slate-800'}`}>{credit ? '+' : '−'}{display(row.credit || row.debit || row.amount)}</p>
            </div>
          }) : <p className="p-5 text-sm text-slate-500">No recent activity is available.</p>}
        </div>
      </section>
    </div>

    <section className="mt-8" aria-labelledby="banking-services-title">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#C9A227]">Everyday banking</p>
      <h2 id="banking-services-title" className="mt-1 text-2xl font-semibold">Banking services</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {services.map(({ label, subtext, icon: Icon, to, gated }) => {
          const className = 'group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-md'
          const body = <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0504AA]/8 text-[#0504AA]"><Icon className="size-5" /></span>
            <span className="mt-4 block text-sm font-semibold text-[#101533]">{label}</span>
            <span className="mt-1 block text-xs text-slate-500">{subtext}</span>
          </>
          return to
            ? <Link key={label} to={to} className={className}>{body}</Link>
            : <button key={label} type="button" onClick={gated ? requestMovement : undefined} className={className}>{body}</button>
        })}
      </div>
    </section>

    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(5,4,170,0.08)] backdrop-blur md:hidden" aria-label="Mobile banking navigation">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        <Link to={ROUTES.DASHBOARD} className="flex flex-col items-center gap-1 rounded-xl bg-[#0504AA] px-2 py-2 text-[11px] font-semibold text-white"><Landmark className="size-4" />Dashboard</Link>
        <Link to={ROUTES.ACCOUNTS} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-600"><WalletCards className="size-4" />Accounts</Link>
        <button type="button" onClick={requestMovement} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-600"><Send className="size-4" />Transfer</button>
        <Link to={ROUTES.TRANSACTIONS} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-600"><Menu className="size-4" />Activity</Link>
      </div>
    </nav>
    <div className="mb-20 mt-8 flex items-center gap-2 text-xs text-slate-500 md:mb-0"><ShieldCheck className="size-4 text-[#0504AA]" />Your member information is protected by Evermont security controls.</div>
    <ActivationRequiredModal open={gateOpen} fee={gateResult.fee} ratePercent={gateResult.ratePercent} onClose={() => setGateOpen(false)} />
  </PortalShell>
}

export default MemberDashboardPage
