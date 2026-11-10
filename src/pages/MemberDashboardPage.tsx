import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Bell, Building2, CreditCard, Eye, EyeOff, FileText, Headphones, Landmark, Receipt, Send, Smartphone, UserRound, WalletCards } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { ActivationRequiredModal } from '@/components/member/ActivationRequiredModal'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { GATED_FEATURES, LINK_FEATURES, maskAccount } from '@/lib/bankingServices'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { isDepositActivity, isTransferActivity, mergeActivity, transactionService, type LedgerActivity } from '@/services/transactionService'
import { useActivationGate } from '@/hooks/useActivationGate'
import type { Account, Profile } from '@/types'

const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const SAMPLE_MEMBER_ID = '96167e4c-024d-47ba-9f43-dce4f8cf599a'
const SAMPLE_ACCOUNT_ID = 'ee99d49d-f2df-4326-bb76-cc2801fc8448'
const BENEFICIARY_STORAGE_KEY = 'evermont-dashboard-beneficiary'
const formatActivityDate = (value: string | null) => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : 'Date not returned'

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
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
      <li key={row.id} className="grid gap-3 px-4 py-3.5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span className={`flex size-9 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`} aria-label={credit ? 'Credit' : 'Debit'}>{credit ? <ArrowUpRight className="size-4" aria-hidden="true" /> : <ArrowDownLeft className="size-4" aria-hidden="true" />}</span>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-[#101533]">{row.description || 'Ledger entry'}</p>{row.isSample && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Sample</span>}</div><p className="mt-1 text-xs text-slate-500">{formatActivityDate(row.createdAt)} · <span className="capitalize">{row.entryType || row.category || row.direction}</span>{row.referenceId ? ` · ${row.referenceId}` : ''}</p></div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><p className={`text-sm font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-rose-800'}`}>{credit ? '+' : '−'}{money(row.displayAmount)}</p><span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${row.status === 'completed' || row.status === 'posted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{row.status || 'Status not returned'}</span></div>
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
  const [sampleRows, setSampleRows] = useState<LedgerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiarySaved, setBeneficiarySaved] = useState(false)
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
        if (user.id === SAMPLE_MEMBER_ID && nextAccounts.some(account => account.id === SAMPLE_ACCOUNT_ID)) {
          try {
            const samples = await transactionService.getSampleTransactions(user.id, [SAMPLE_ACCOUNT_ID])
            if (active) setSampleRows(samples)
          } catch {
            if (active) setSampleRows([])
          }
        } else if (active) {
          setSampleRows([])
        }
      } catch {
        if (active) setError('We could not load transactions from the ledger.')
      }
    }).catch(() => { if (active) setError('We could not load your accounts.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user || typeof window === 'undefined') return
    setBeneficiaryName(window.localStorage.getItem(`${BENEFICIARY_STORAGE_KEY}:${user.id}`) || '')
  }, [user])

  useEffect(() => {
    if (!user || loading || error) return
    void checkActivation().then(() => {
    }).catch(() => setServiceError('We could not verify activation.'))
  }, [user, loading, error, checkActivation])

  const mergedActivity = useMemo(() => mergeActivity(rows, sampleRows), [rows, sampleRows])
  const recent = mergedActivity.slice(0, 8)
  const transfers = rows.filter((row) => isTransferActivity(row)).slice(0, 8)
  const deposits = rows.filter((row) => isDepositActivity(row)).slice(0, 8)
  const depositTotal = rows.filter((row) => isDepositActivity(row)).reduce((sum, row) => sum + Number(row.displayAmount || 0), 0)
  const withdrawalTotal = rows.filter((row) => row.direction === 'debit' && !isTransferActivity(row)).reduce((sum, row) => sum + Number(row.displayAmount || 0), 0)
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

  const firstName = profile?.firstName || user.firstName || 'Member'

  return <PortalShell title={`Hello, ${firstName}`} eyebrow="Account overview">
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Account summary">
        {[{ label: 'Account status', value: accounts[0]?.status || 'Not returned', detail: 'Verified from account record' }, { label: 'Total deposits', value: shown(depositTotal), detail: `${rows.filter((row) => isDepositActivity(row)).length} posted entries` }, { label: 'Total withdrawals', value: shown(withdrawalTotal), detail: 'Posted debit activity' }].map(card => <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">{card.label}</p><p className="mt-3 truncate text-2xl font-semibold tabular-nums text-[#101533]">{card.value}</p><p className="mt-2 text-xs text-slate-500">{card.detail}</p></article>)}
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

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr] xl:items-start">
        <Panel title="Recent activity" action={<Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">Full history</Link>}>
          {error ? <p className="px-4 py-6 text-sm text-slate-500">Activity was not loaded.</p> : <ActivityList rows={recent} empty="Posted ledger entries and transactions will appear here." />}
        </Panel>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <Panel title="Transfer history">
            {error ? <p className="px-4 py-6 text-sm text-slate-500">Transfer history was not loaded.</p> : <ActivityList rows={transfers} empty="No transfer entries were returned." />}
          </Panel>
          <Panel title="Deposit history">
            {error ? <p className="px-4 py-6 text-sm text-slate-500">Deposit history was not loaded.</p> : <ActivityList rows={deposits} empty="No deposit entries were returned." />}
          </Panel>
        </div>
      </div>

      <section className="sticky bottom-4 z-10 rounded-2xl border border-[#C9A227]/40 bg-white/95 p-5 shadow-lg shadow-slate-900/10 backdrop-blur" aria-labelledby="beneficiary-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#C9A227]">Account planning</p><h2 id="beneficiary-title" className="mt-1 text-base font-semibold text-[#101533]">Beneficiary</h2><p className="mt-1 text-sm text-slate-500">Save a reminder locally for now. This does not change accounts or submit a transaction.</p></div><form className="flex w-full gap-2 sm:max-w-md" onSubmit={event => { event.preventDefault(); if (typeof window !== 'undefined' && user) window.localStorage.setItem(`${BENEFICIARY_STORAGE_KEY}:${user.id}`, beneficiaryName.trim()); setBeneficiarySaved(true) }}><label className="sr-only" htmlFor="beneficiary-name">Beneficiary name</label><input id="beneficiary-name" value={beneficiaryName} onChange={event => { setBeneficiaryName(event.target.value); setBeneficiarySaved(false) }} placeholder="Enter a name" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0504AA] focus:ring-4 focus:ring-[#0504AA]/10" /><button type="submit" className="rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#04038c]">Save</button></form></div>{beneficiarySaved && <p className="mt-3 text-xs font-semibold text-emerald-700" role="status">Beneficiary reminder saved on this device.</p>}
      </section>

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
