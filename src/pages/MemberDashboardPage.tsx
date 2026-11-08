import React, { useEffect, useMemo, useState } from 'react'
import { Bell, Building2, CreditCard, Eye, EyeOff, FileText, Headphones, Landmark, Receipt, Send, Smartphone, UserRound, WalletCards } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { ActivationRequiredModal } from '@/components/member/ActivationRequiredModal'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { GATED_FEATURES, LINK_FEATURES, maskAccount } from '@/lib/bankingServices'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { isDepositActivity, isTransferActivity, transactionService, type LedgerActivity } from '@/services/transactionService'
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
  rows.length ? <ul className="divide-y divide-slate-100">{rows.map(row => {
    const credit = row.direction === 'credit'
    return (
      <li key={row.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#101533]">{row.description || 'Ledger entry'}</p>
          <p className="mt-1 text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Date not returned'} · <span className="capitalize">{row.entryType || row.category || row.direction}</span>{row.referenceId ? ` · ${row.referenceId}` : ''}</p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <p className={`text-sm font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-rose-800'}`}>{credit ? '+' : '−'}{money(row.displayAmount)}</p>
          <p className="text-xs capitalize text-slate-500">{row.status || 'Status not returned'}</p>
        </div>
      </li>
    )
  })}</ul> : (
    <div className="px-4 py-10 text-center">
      <Receipt className="mx-auto size-6 text-[#C9A227]" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-[#0504AA]">No activity returned</p>
      <p className="mt-1 text-sm text-slate-500">{empty}</p>
    </div>
  )
)

const FEATURE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  transfer: Send,
  ach: Building2,
  'bill-pay': Receipt,
  mobile: Smartphone,
  check: FileText,
  wire: Landmark,
  'virtual-card': CreditCard,
  'digital-assets': WalletCards,
  statements: FileText,
  alerts: Bell,
  support: Headphones,
  profile: UserRound,
}

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [rows, setRows] = useState<LedgerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts])
  const { check: checkActivation, checking } = useActivationGate(user?.id)
  const navigate = useNavigate()
  const [pendingService, setPendingService] = useState<string | null>(null)
  const [gatePath, setGatePath] = useState<string | null>(null)
  const [serviceError, setServiceError] = useState('')
  const [hidden, setHidden] = useState(false)

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
    void checkActivation().then(() => {
    }).catch(() => setServiceError('We could not verify activation.'))
  }, [user, loading, error, checkActivation])

  const recent = rows.slice(0, 8)
  const transfers = rows.filter((row) => isTransferActivity(row)).slice(0, 8)
  const deposits = rows.filter((row) => isDepositActivity(row)).slice(0, 8)
  const memberName = [profile?.firstName || user?.firstName, profile?.lastName || user?.lastName].filter(Boolean).join(' ')
  const shown = (value: unknown) => hidden ? '••••••' : money(value)

  const openService = async (path: string, key: string) => {
    setServiceError('')
    setPendingService(key)
    try {
      const result = await checkActivation()
      if (!result.activated) {
        setGatePath(path)
        return
      }
      navigate(path)
    } catch {
      setServiceError('We could not verify activation. The service was not opened.')
    } finally {
      setPendingService(null)
    }
  }

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-500">Loading your member portal...</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>

  return <PortalShell title="Account overview" eyebrow={memberName || 'Member'}>
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-2xl bg-[#0504AA] p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#C9A227]">Available balance</p>
          <button type="button" onClick={() => setHidden((value) => !value)} aria-pressed={hidden} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold">{hidden ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}{hidden ? 'Show' : 'Hide'}</button>
        </div>
        {error ? <p className="mt-3 text-sm text-blue-100">Balance is hidden because account records did not load.</p> : accounts.length ? <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">{shown(total)}</p> : <p className="mt-3 text-sm text-blue-100">No accounts are on file for this member.</p>}
        <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">{accounts.length ? `Sum of ${accounts.length === 1 ? 'the balance' : 'the balances'} returned for your account${accounts.length === 1 ? '' : 's'}. This page does not move money.` : 'A balance appears only when the database returns an account.'}</p>
      </section>

      <section aria-labelledby="account-summary-title">
        <h2 id="account-summary-title" className="text-sm font-semibold text-[#101533]">Accounts</h2>
        {accounts.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{accounts.map(account => (
          <li key={account.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold capitalize text-[#0504AA]">{account.accountType}</p>
            <p className="mt-1 text-xs text-slate-500">{account.accountNumber ? maskAccount(account.accountNumber) : 'Account number not returned'} · <span className="capitalize">{account.status || 'Status not returned'}</span></p>
            <p className="mt-3 text-xl font-semibold tabular-nums text-[#101533]">{shown(account.balance)}</p>
          </li>
        ))}</ul> : <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">No account details were returned.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="banking-services-title">
        <h2 id="banking-services-title" className="text-sm font-semibold text-[#101533]">Features</h2>
        <p className="mt-1 text-sm text-slate-500">Money-movement features stay closed until the database says this account is activated.</p>
        {serviceError && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serviceError}</p>}
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {GATED_FEATURES.map((item) => {
            const Icon = FEATURE_ICONS[item.key] || Landmark
            const busy = checking && pendingService === item.key
            return (
              <li key={item.key}>
                <button type="button" onClick={() => void openService(item.path, item.key)} disabled={checking} aria-busy={busy} className="flex h-full w-full flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-[#C9A227] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0504AA] disabled:opacity-60 sm:p-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#0504AA] text-[#C9A227]"><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="text-sm font-semibold text-[#0504AA]">{item.title}</span>
                  <span className="text-xs leading-5 text-slate-500">{busy ? 'Checking activation…' : item.description}</span>
                </button>
              </li>
            )
          })}
          {LINK_FEATURES.map((item) => {
            const Icon = FEATURE_ICONS[item.key] || Landmark
            return (
              <li key={item.key}>
                <Link to={item.path} className="flex h-full flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 hover:border-[#C9A227] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0504AA] sm:p-4">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-[#C9A227] text-[#0504AA]"><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="text-sm font-semibold text-[#0504AA]">{item.title}</span>
                  <span className="text-xs leading-5 text-slate-500">{item.description}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <Panel title="Recent activity" action={<Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">Full history</Link>}>
        {error ? <p className="px-4 py-6 text-sm text-slate-500">Activity was not loaded.</p> : <ActivityList rows={recent} empty="Posted ledger entries and transactions will appear here." />}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Transfer history">
          {error ? <p className="px-4 py-6 text-sm text-slate-500">Transfer history was not loaded.</p> : <ActivityList rows={transfers} empty="No transfer entries were returned." />}
        </Panel>
        <Panel title="Deposit history">
          {error ? <p className="px-4 py-6 text-sm text-slate-500">Deposit history was not loaded.</p> : <ActivityList rows={deposits} empty="No deposit entries were returned." />}
        </Panel>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-[#101533]">Profile and support</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
          <Link to={ROUTES.PROFILE} className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Profile</Link>
          <Link to={ROUTES.SETTINGS} className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Security and password</Link>
          <Link to={ROUTES.SUPPORT} className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Support</Link>
          <a href="mailto:support@evermontcredit.online" className="rounded-lg border border-slate-200 px-3 py-2 text-[#0504AA] hover:border-[#C9A227]">Contact support</a>
        </div>
      </section>
      <ActivationRequiredModal open={gatePath != null} nextPath={gatePath || undefined} onClose={() => setGatePath(null)} />
    </div>
  </PortalShell>
}

export default MemberDashboardPage
