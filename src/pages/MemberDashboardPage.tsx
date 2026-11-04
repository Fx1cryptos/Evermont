import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { transactionService, type LedgerActivity } from '@/services/transactionService'
import { useActivationGate } from '@/hooks/useActivationGate'
import type { Account, Profile } from '@/types'

const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <h2 className="text-sm font-semibold text-[#101533]">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

const ActivityList: React.FC<{ rows: LedgerActivity[]; empty: string }> = ({ rows, empty }) => (
  rows.length ? <ul className="divide-y divide-slate-100">{rows.map(row => (
    <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 truncate text-sm font-medium text-[#101533]">
          <span className="truncate">{row.description}</span>
          {row.isDemo && <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800">DEMO</span>}
        </p>
        <p className="text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Date not returned'} · <span className="capitalize">{row.entryType || row.status}</span></p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-[#101533]">{row.direction === 'credit' ? '+' : '−'}{money(row.displayAmount)}</p>
    </li>
  ))}</ul> : <p className="px-4 py-6 text-sm text-slate-500">{empty}</p>
)

const COMING_SOON = ['ACH transfer', 'Mobile deposit', 'Check deposit', 'Virtual card']

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [rows, setRows] = useState<LedgerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts])
  const { check: checkActivation } = useActivationGate(user?.id, total)
  const [activated, setActivated] = useState<boolean | null>(null)
  const [fee, setFee] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)]).then(async ([nextProfile, nextAccounts]) => {
      if (!active) return
      setProfile(nextProfile)
      setAccounts(nextAccounts)
      try {
        const activity = await transactionService.getTransactions(user.id, { limit: 40 })
        if (active) setRows(activity)
      } catch {
        if (active) setError('We could not load transactions from the ledger.')
      }
    }).catch(() => { if (active) setError('We could not load your accounts.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user || loading || error) return
    void checkActivation().then((result) => {
      setActivated(result.activated)
      setFee(result.fee)
    })
  }, [user, loading, error, checkActivation])

  const recent = rows.slice(0, 5)
  const transfers = rows.filter(row => row.entryType === 'transfer').slice(0, 5)
  const deposits = rows.filter(row => row.entryType === 'deposit').slice(0, 5)
  const memberName = [profile?.firstName || user?.firstName, profile?.lastName || user?.lastName].filter(Boolean).join(' ')

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading your member portal...</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>

  return <PortalShell title="Account overview" eyebrow={memberName || 'Member'}>
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#C9A227]">Available balance</p>
        {error ? <p className="mt-2 text-sm text-slate-500">Balance is hidden because account records did not load.</p> : accounts.length ? <p className="mt-2 text-3xl font-semibold tabular-nums text-[#0504AA]">{money(total)}</p> : <p className="mt-2 text-sm text-slate-500">No accounts are on file for this member.</p>}
        <p className="mt-2 text-xs text-slate-500">{accounts.length ? 'Sum of balances returned for your accounts. Nothing on this page moves money.' : 'Balances appear here only when the database returns an account.'}</p>
        {activated === false && <p className="mt-3 text-sm text-slate-600">Activation is not complete.{fee != null ? ` The recorded fee is ${money(fee)}.` : ''} <Link to={ROUTES.ACTIVATION} className="font-semibold text-[#0504AA] hover:text-[#C9A227]">View activation</Link></p>}
      </section>

      <Panel title="Account details" action={<Link to={ROUTES.ACCOUNTS} className="text-sm font-semibold text-[#0504AA]">Open accounts</Link>}>
        {accounts.length ? <ul className="divide-y divide-slate-100">{accounts.map(account => (
          <li key={account.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-semibold capitalize text-[#101533]">{account.accountType}</p>
              <p className="text-xs text-slate-500">{account.accountNumber || 'Account number not returned'} · <span className="capitalize">{account.status}</span></p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-[#101533]">{money(account.balance)}</p>
          </li>
        ))}</ul> : <p className="px-4 py-6 text-sm text-slate-500">No account details were returned.</p>}
      </Panel>

      <Panel title="Recent transactions" action={<Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">Full history</Link>}>
        {error ? <p className="px-4 py-6 text-sm text-slate-500">Transactions were not loaded.</p> : <ActivityList rows={recent} empty="No transactions were returned." />}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Transfer history">
          {error ? <p className="px-4 py-6 text-sm text-slate-500">Transfer history was not loaded.</p> : <ActivityList rows={transfers} empty="No transfer entries were returned." />}
        </Panel>
        <Panel title="Deposit history">
          {error ? <p className="px-4 py-6 text-sm text-slate-500">Deposit history was not loaded.</p> : <ActivityList rows={deposits} empty="No deposit entries were returned." />}
        </Panel>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-[#101533]">Profile and support</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
          <Link to={ROUTES.PROFILE} className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Profile</Link>
          <Link to={ROUTES.SETTINGS} className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Security and password</Link>
          <Link to={ROUTES.SUPPORT} className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Support</Link>
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
        <h2 className="text-sm font-semibold text-[#101533]">Coming soon</h2>
        <p className="mt-1 text-sm text-slate-500">These are not available. Submitting a request here does not create a transfer, deposit, card, or receipt.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {COMING_SOON.map(item => <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{item} · Coming soon</li>)}
        </ul>
      </section>
    </div>
  </PortalShell>
}

export default MemberDashboardPage
