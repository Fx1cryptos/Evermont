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
type ServiceItem = { label: string; subtext: string; icon: React.FC<{ className?: string }>; to?: string; gated?: boolean }

const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
      <h2 className="text-sm font-semibold text-[#101533]">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

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
      const { data, error: queryError } = await supabase.from('ledger_entries').select('id,created_at,description,category,debit,credit,amount,status').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false }).limit(6)
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
  const memberName = [profile?.firstName || user?.firstName, profile?.lastName].filter(Boolean).join(' ')

  const requestMovement = () => {
    setNotice('')
    if (gateResult.activated) {
      setNotice('Transfer and withdraw are not available yet. This prototype does not move money.')
      return
    }
    setGateOpen(true)
  }

  const services: ServiceItem[] = [
    { label: 'Transfer', subtext: 'Requires activation', icon: Send, gated: true },
    { label: 'Withdraw', subtext: 'Requires activation', icon: WalletCards, gated: true },
    { label: 'ACH', subtext: 'Requires activation', icon: Building2, gated: true },
    { label: 'Mobile Deposit', subtext: 'Requires activation', icon: Smartphone, gated: true },
    { label: 'Check Deposit', subtext: 'Requires activation', icon: FileText, gated: true },
    { label: 'Mobile Debit', subtext: 'Requires activation', icon: CreditCard, gated: true },
    { label: 'Virtual Card', subtext: 'Requires activation', icon: WalletCards, gated: true },
    { label: 'Support', subtext: 'Message the team', icon: Headphones, to: ROUTES.SUPPORT },
    { label: 'Accounts', subtext: 'Open details', icon: Landmark, to: ROUTES.ACCOUNTS },
    { label: 'Activity', subtext: 'Full history', icon: Receipt, to: ROUTES.TRANSACTIONS },
  ]

  if (authLoading || loading) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading your member portal...</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in to member banking</Link></main>

  return <PortalShell title="Overview" eyebrow={memberName || 'Member'}>
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_292px]">
      <div className="order-2 space-y-5 lg:order-1">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="bg-[#0504AA] px-5 py-5 text-white sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#C9A227]">Total relationship balance</p>
                <p className="mt-2 font-semibold tabular-nums tracking-tight text-3xl sm:text-4xl">{hidden ? '••••••' : money(total)}</p>
                <p className="mt-2 text-sm text-blue-100">{accounts.length === 1 ? '1 account' : `${accounts.length} accounts`}</p>
              </div>
              <button type="button" onClick={() => setHidden(!hidden)} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white">
                {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {hidden ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
            <Link to={ROUTES.ACCOUNTS} className="px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50">Accounts</Link>
            <Link to={ROUTES.TRANSACTIONS} className="px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50">Activity</Link>
            <button type="button" disabled={checking} onClick={requestMovement} className="px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50 disabled:opacity-60">Transfer</button>
            <button type="button" disabled={checking} onClick={requestMovement} className="px-4 py-3 text-center text-sm font-semibold text-[#0504AA] hover:bg-slate-50 disabled:opacity-60">Withdraw</button>
          </div>
          {notice && <p role="status" className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600">{notice}</p>}
        </section>

        <Panel title="Accounts" action={<Link to={ROUTES.ACCOUNTS} className="text-sm font-semibold text-[#0504AA]">View all</Link>}>
          {accounts.length ? <ul className="divide-y divide-slate-100">{accounts.map(account => (
            <li key={account.id} className="flex items-center gap-3 px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0504AA]/8 text-[#0504AA]"><Landmark className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold capitalize text-[#101533]">{account.accountType}</p>
                <p className="truncate text-xs text-slate-500">{account.accountNumber || 'Account'}</p>
              </div>
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-emerald-700 sm:inline">{account.status}</span>
              <p className="text-sm font-semibold tabular-nums text-[#101533]">{display(account.balance)}</p>
            </li>
          ))}</ul> : <p className="px-5 py-8 text-sm text-slate-500">No accounts are available for this member.</p>}
        </Panel>

        <Panel title="Recent activity" action={<Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">See all</Link>}>
          {error ? <p className="px-5 py-6 text-sm text-red-700">{error}</p> : rows.length ? <ul className="divide-y divide-slate-100">{rows.map(row => {
            const credit = Number(row.credit || 0) > 0
            return <li key={row.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{credit ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#101533]">{row.description}</p>
                <p className="text-xs text-slate-500">{new Date(row.created_at).toLocaleDateString()} · <span className="capitalize">{row.status}</span></p>
              </div>
              <p className={`shrink-0 text-sm font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-[#101533]'}`}>{credit ? '+' : '−'}{display(row.credit || row.debit || row.amount)}</p>
            </li>
          })}</ul> : <p className="px-5 py-8 text-sm text-slate-500">No recent activity is available.</p>}
        </Panel>
      </div>

      <aside className="order-1 space-y-5 lg:order-2">
        {!gateResult.activated && <section className="rounded-2xl border border-[#C9A227]/40 bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#C9A227]">Activation required</p>
          <h2 className="mt-2 text-base font-semibold leading-6 text-[#101533]">Activate your account to unlock transfers and select services.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{feeLine}</p>
          {gateResult.ratePercent != null && <p className="mt-2 text-sm text-slate-500">Calculated at {gateResult.ratePercent}% of available balance.</p>}
          <div className="mt-4 grid gap-2">
            <Link to={ROUTES.ACTIVATION} className="rounded-lg bg-[#0504AA] px-3 py-2.5 text-center text-sm font-semibold text-white">View activation details</Link>
            <Link to={ROUTES.SUPPORT} className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-[#0504AA]">Message support</Link>
          </div>
        </section>}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold">Services</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Bell className="size-3.5 text-[#0504AA]" />{unreadCount}</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {services.map(({ label, subtext, icon: Icon, to, gated }) => {
              const body = <span className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0504AA]/8 text-[#0504AA]"><Icon className="size-4" /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-[#101533]">{label}</span><span className="block text-xs text-slate-500">{subtext}</span></span>
              </span>
              return <li key={label}>{to
                ? <Link to={to} className="block hover:bg-slate-50">{body}</Link>
                : <button type="button" onClick={gated ? requestMovement : undefined} className="block w-full text-left hover:bg-slate-50">{body}</button>}</li>
            })}
          </ul>
        </section>
      </aside>
    </div>

    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden" aria-label="Mobile banking navigation">
      <div className="mx-auto grid max-w-md grid-cols-4">
        <Link to={ROUTES.DASHBOARD} className="flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-[#0504AA]"><Landmark className="size-4" />Overview</Link>
        <Link to={ROUTES.ACCOUNTS} className="flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500"><WalletCards className="size-4" />Accounts</Link>
        <button type="button" onClick={requestMovement} className="flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500"><Send className="size-4" />Transfer</button>
        <Link to={ROUTES.TRANSACTIONS} className="flex flex-col items-center gap-1 py-2 text-[11px] font-semibold text-slate-500"><Menu className="size-4" />Activity</Link>
      </div>
    </nav>
    <div className="mb-16 mt-6 flex items-center gap-2 text-xs text-slate-400 md:mb-0"><ShieldCheck className="size-3.5 text-[#0504AA]" />Member information stays in your signed-in session.</div>
    <ActivationRequiredModal open={gateOpen} fee={gateResult.fee} ratePercent={gateResult.ratePercent} onClose={() => setGateOpen(false)} />
  </PortalShell>
}

export default MemberDashboardPage
