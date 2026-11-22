import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Bell, Building2, CreditCard, Eye, EyeOff, FileText, Headphones, Landmark, Receipt, Send, Smartphone, UserRound, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SupportPage } from './SupportPage'
import { DashboardSkeleton } from '@/components/member/MemberDesk'
import { PortalShell } from '@/components/member/PortalShell'
import { ActivationRequiredModal } from '@/components/member/ActivationRequiredModal'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { GATED_FEATURES, maskAccount } from '@/lib/bankingServices'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { transactionService, type LedgerActivity } from '@/services/transactionService'
import { useActivationGate, type GateResult } from '@/hooks/useActivationGate'
import type { Account, Profile } from '@/types'

const formatActivityDate = (value: string | null) => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : 'Date not returned'

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <h2 className="text-sm font-semibold text-[#07142D]">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

const ActivityList: React.FC<{ rows: LedgerActivity[]; empty: string; format: (value: string, account: string) => string }> = ({ rows, empty, format }) => (
  rows.length ? <ul className="divide-y divide-slate-100">{rows.map(row => {
    const credit = row.direction === 'credit'
    return (
      <li key={row.id} className="grid gap-3 px-4 py-3.5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span className={`flex size-9 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`} aria-label={row.direction}>{row.direction === 'unknown' ? '—' : credit ? <ArrowUpRight className="size-4" aria-hidden="true" /> : <ArrowDownLeft className="size-4" aria-hidden="true" />}</span>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-[#07142D]">{row.description || 'Ledger entry'}</p></div><p className="mt-1 text-xs text-slate-500">{formatActivityDate(row.createdAt)} · <span className="capitalize">{row.entryType || row.category || row.direction}</span>{row.referenceId ? ` · ${row.referenceId}` : ''}</p></div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><p className={`text-sm font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-rose-800'}`}>{row.displayAmount && (credit ? '+' : row.direction === 'debit' ? '−' : '')}{format(row.displayAmount,row.accountId)}</p>{row.balanceAfter != null && <small>Balance {format(row.balanceAfter,row.accountId)}</small>}<span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${row.status === 'completed' || row.status === 'posted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{row.status || 'Status not returned'}</span></div>
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
  const [historyAttempt,retryHistory] = useState(0)
  const [activityError,setActivityError] = useState(false)
  const [error, setError] = useState('')
  const singleCurrency = accounts.length && accounts.every(account => account.currency === accounts[0].currency) ? accounts[0].currency : null
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts])
  const { check: checkActivation } = useActivationGate(user?.id)
  const [gatePath, setGatePath] = useState<string | null>(null)
  const [membership, setMembership] = useState<GateResult | null>(null)
  const [verificationError, setVerificationError] = useState('')
  const [attempt, retry] = useState(0)
  const [supportOpen,setSupportOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    setActivityError(false); setError(''); setLoading(true)
    void Promise.all([
      profileService.getProfile(user.id).then(p=>{if(active) setProfile(p)}),
      accountService.getAccounts(user.id).then(a=>{if(active) setAccounts(a)}).catch(()=>{if(active){setAccounts([]);setError('We could not load your accounts.')}}),
      transactionService.getTransactions(user.id,{limit:40}).then(rows=>{if(active) setRows(rows)}).catch(()=>{if(active){setRows([]);setActivityError(true)}})
    ]).finally(()=>{if(active) setLoading(false)})
    return () => { active = false }
  }, [user,historyAttempt])

  useEffect(() => {
    let mounted = true
    setMembership(null); setVerificationError('')
    if (user) void checkActivation().then(result => { if (mounted) setMembership(result) })
      .catch(e => { if (mounted) setVerificationError(e instanceof Error ? e.message : 'Please retry verification.') })
    return () => { mounted = false }
  }, [user, attempt, checkActivation])

  const recent = rows.slice(0, 8)
  const shown = (value: unknown, currency = singleCurrency) => {
    if (hidden) return '••••••'
    if (!currency || !/^[A-Z]{3}$/.test(currency) || value == null || value === '' || !Number.isFinite(Number(value))) return 'Unavailable'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value))
  }

  if (authLoading || (user && loading)) return <DashboardSkeleton />
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>

  const firstName = profile?.firstName || user.firstName || 'Member'

  return <PortalShell title={`Hello, ${firstName}`} eyebrow="Account overview">
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="private-hero p-6 sm:p-9">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#C9A227]">Private wealth / Portfolio</p>
          <button type="button" onClick={() => setHidden((value) => !value)} aria-pressed={hidden} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold">{hidden ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}{hidden ? 'Show' : 'Hide'}</button>
        </div>
        <h2 className="mt-5 font-serif text-3xl sm:text-4xl">Account overview</h2>
        {error ? <p className="mt-3 text-sm text-blue-100">Balance is hidden because account records did not load.</p> : accounts.length ? <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">{shown(accounts.some(a => a.balance == null) ? null : total)}</p> : <p className="mt-3 text-sm text-blue-100">No accounts are on file for this member.</p>}
        <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">{accounts.length ? `Across ${accounts.length} member account${accounts.length === 1 ? '' : 's'}` : 'Your linked accounts and their balances will appear here.'}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <section aria-live="polite" className="private-surface flex flex-col items-start justify-between gap-4 p-6 lg:order-2">
        <div><p className="private-overline">Membership</p><h2 className="mt-1 font-semibold">{membership?.label || (verificationError ? 'Unable to verify activation' : 'Checking activation…')}</h2><p className="text-sm text-slate-600">{membership?.detail || verificationError}</p></div>
        {verificationError ? <button className="font-semibold text-[#0504AA]" onClick={() => retry(n => n + 1)}>Retry verification</button> : <Link className="font-semibold text-[#0504AA]" to={ROUTES.ACTIVATION}>Activation details →</Link>}
      </section>
      <section className="private-surface p-5" aria-labelledby="account-summary-title"><p className="private-overline">Portfolio details</p>
        <h2 id="account-summary-title" className="private-heading">Accounts</h2>
        {accounts.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{accounts.map(account => (
          <li key={account.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold capitalize text-[#0504AA]">{account.accountType}</p>
            <p className="mt-1 text-xs text-slate-500">{account.accountNumber ? maskAccount(account.accountNumber) : 'Account number not returned'} · <span className="capitalize">{account.status || 'Status not returned'}</span></p>
            <p className="mt-3 text-xl font-semibold tabular-nums text-[#07142D]">{shown(account.balance, account.currency)}</p><p className="mt-2 text-xs text-slate-500">{account.currency} · Account balance{account.createdAt ? ' · Opened ' + new Date(account.createdAt).toLocaleDateString() : ''}{account.updatedAt ? ' · Updated ' + formatActivityDate(account.updatedAt) : ''}</p>
          </li>
        ))}</ul> : <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">No account details were returned.</p>}
      </section>

      </div>
      <section><h2 className="text-lg font-semibold">Transfers, deposits &amp; cards</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {GATED_FEATURES.filter(item => item.key !== "digital-assets").map((item) => {
            const Icon = FEATURE_ICONS[item.key] || Landmark
            return (
              <li key={item.key}>
                <button type="button" onClick={() => setGatePath(item.path)} className="flex h-full w-full flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-[#C9A227] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0504AA] disabled:bg-slate-50 disabled:text-slate-500 sm:p-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#0504AA] text-[#C9A227]"><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="text-sm font-semibold text-[#0504AA]">{item.title}</span>
                  <span className="text-xs leading-5 text-slate-500">View service access</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="private-surface p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="private-overline">Private correspondence</p><h2 className="private-heading">Member support</h2></div><button className="rounded-full bg-[#0504AA] px-5 py-3 text-sm font-semibold text-white" aria-expanded={supportOpen} onClick={()=>setSupportOpen(!supportOpen)}>{supportOpen ? 'Close inbox' : 'Open your inbox'}</button></div>{supportOpen && <div className="mt-5"><SupportPage embedded /></div>}</section>
      <div className="grid gap-5">
        <Panel title="Recent activity" action={<Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">Full history</Link>}>
          {activityError ? <p className="px-4 py-6 text-sm text-slate-500">Activity was not loaded. <button className="font-semibold underline" onClick={()=>retryHistory(n=>n+1)}>Retry history</button></p> : <ActivityList format={(value,id) => shown(value, accounts.find(a => a.id === id)?.currency || null)} rows={recent} empty="Posted ledger entries and transactions will appear here." />}
        </Panel>
      </div>

      <ActivationRequiredModal open={gatePath != null} nextPath={gatePath || undefined} onClose={() => setGatePath(null)} />
    </div>
  </PortalShell>
}

export default MemberDashboardPage
