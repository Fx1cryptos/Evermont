import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Landmark,
  Bitcoin,
  Car,
  Home,
  CreditCard,
  ArrowLeft,
  Repeat,
  Receipt,
  Download,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import MemberLayout from '@/components/MemberLayout'
import TransactionRow from '@/components/member/TransactionRow'
import { LineChart, BarChart } from '@/components/charts/SimpleCharts'
import ActionModal, { QuickActionDef } from '@/components/member/ActionModal'
import { DEMO_LOAN_DETAILS, DEMO_HOLDINGS, DEMO_PERFORMANCE } from '@/data/demoMember'

const TRANSFER_ACTION: QuickActionDef = {
  id: 'transfer',
  label: 'Transfer Money',
  description: 'Move funds between your Evermont accounts instantly.',
  fields: [
    { name: 'from', label: 'From account', type: 'select', options: ['account'] },
    { name: 'to', label: 'To account', type: 'select', options: ['account'] },
    { name: 'amount', label: 'Amount', type: 'currency' },
    { name: 'note', label: 'Note (optional)', type: 'text', placeholder: 'e.g. Monthly savings' },
  ],
  successNote: 'Your internal transfer has been scheduled and will post immediately.',
}
import { formatCurrency, isLoanType } from '@/utils/formatting'

type DetailKind = 'cash' | 'invest' | 'crypto' | 'loan'

interface DetailConfig {
  label: string
  tagline: string
  Icon: LucideIcon
  kind: DetailKind
  balanceLabel: string
  availableLabel?: string
}

const CONFIG: Record<string, DetailConfig> = {
  checking: { label: 'Evermont Checking', tagline: 'Everyday spending account', Icon: Wallet, kind: 'cash', balanceLabel: 'Current balance', availableLabel: 'Available balance' },
  savings: { label: 'High-Yield Savings', tagline: 'Build your future, earn as you save', Icon: PiggyBank, kind: 'cash', balanceLabel: 'Current balance', availableLabel: 'Available balance' },
  investment: { label: 'Investments', tagline: 'Brokerage account — ETFs and index funds', Icon: TrendingUp, kind: 'invest', balanceLabel: 'Total portfolio value' },
  retirement_401k: { label: '401(k) Retirement', tagline: 'Employer plan with target-date strategy', Icon: Landmark, kind: 'invest', balanceLabel: 'Total balance' },
  crypto: { label: 'Crypto Account', tagline: 'Buy, sell and hold major cryptocurrencies', Icon: Bitcoin, kind: 'crypto', balanceLabel: 'Portfolio value' },
  personal_loan: { label: 'Personal Loan', tagline: 'Fixed-rate installment loan', Icon: CreditCard, kind: 'loan', balanceLabel: 'Outstanding balance' },
  auto_loan: { label: 'Auto Loan', tagline: 'Vehicle financing — simple interest', Icon: Car, kind: 'loan', balanceLabel: 'Outstanding balance' },
  home_loan: { label: 'Home Loan', tagline: '30-year fixed-rate mortgage', Icon: Home, kind: 'loan', balanceLabel: 'Outstanding balance' },
  crypto_loan: { label: 'Crypto-Backed Loan', tagline: 'Borrowed against digital assets', Icon: Bitcoin, kind: 'loan', balanceLabel: 'Outstanding balance' },
}

const LoadingState: React.FC = () => (
  <div className="space-y-6">
    <div className="h-56 animate-pulse rounded-2xl bg-gray-200/70" />
    <div className="h-64 animate-pulse rounded-xl bg-gray-200/70" />
    <div className="h-64 animate-pulse rounded-xl bg-gray-200/70" />
  </div>
)

const AccountDetailPage: React.FC = () => {
  const { accountType } = useParams<{ accountType: string }>()
  const { user } = useAuth()
  const { accounts, loading } = useAccounts(user?.id)
  const { transactions, loading: txLoading } = useTransactions(user?.id)

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [notice, setNotice] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const config = accountType ? CONFIG[accountType] : undefined
  const account = accounts.find((a) => a.accountType === accountType)
  const isLoan = accountType ? isLoanType(accountType) : false

  const accountTxns = useMemo(
    () => transactions.filter((t) => t.accountId === account?.id),
    [transactions, account],
  )

  const filteredTxns = useMemo(
    () =>
      accountTxns.filter((t) => {
        if (query && !t.description.toLowerCase().includes(query.toLowerCase())) return false
        if (typeFilter !== 'all' && t.type !== typeFilter) return false
        return true
      }),
    [accountTxns, query, typeFilter],
  )

  // Monthly activity for cash accounts (6 months)
  const monthlyActivity = useMemo(() => {
    const buckets: { label: string; value: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const total = accountTxns
        .filter((t) => {
          const td = new Date(t.createdAt)
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
        })
        .reduce((s, t) => s + parseFloat(t.amount), 0)
      buckets.push({ label, value: Math.round(total) })
    }
    return buckets
  }, [accountTxns])

  if (!config) {
    return (
      <MemberLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Info className="h-6 w-6 text-evermont-blue" />
          </div>
          <h1 className="text-xl font-bold text-evermont-dark">Account not found</h1>
          <p className="text-sm text-evermont-muted mt-2">
            We couldn't find this account type. Browse all of your accounts instead.
          </p>
          <Link to={ROUTES.ACCOUNTS} className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-evermont-blue text-white text-sm font-semibold hover:bg-blue-800 transition">
            Back to Accounts
          </Link>
        </div>
      </MemberLayout>
    )
  }

  if (loading) {
    return (
      <MemberLayout>
        <LoadingState />
      </MemberLayout>
    )
  }

  if (!account) {
    return (
      <MemberLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <config.Icon className="h-6 w-6 text-evermont-blue" />
          </div>
          <h1 className="text-xl font-bold text-evermont-dark">{config.label}</h1>
          <p className="text-sm text-evermont-muted mt-2">
            You don't have a {config.label.toLowerCase()} yet. Visit the accounts page to explore products.
          </p>
          <Link to={ROUTES.ACCOUNTS} className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-evermont-blue text-white text-sm font-semibold hover:bg-blue-800 transition">
            Back to Accounts
          </Link>
        </div>
      </MemberLayout>
    )
  }

  const loanDetail = isLoan ? DEMO_LOAN_DETAILS[account.id] : undefined
  const holdings = DEMO_HOLDINGS[account.id] ?? []
  const payoff = loanDetail ? ((loanDetail.originalAmount - parseFloat(account.balance)) / loanDetail.originalAmount) * 100 : 0

  const statements = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i - 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })

  const balance = parseFloat(account.balance)

  return (
    <MemberLayout>
      <div className="mb-5">
        <Link to={ROUTES.ACCOUNTS} className="inline-flex items-center gap-1.5 text-sm font-medium text-evermont-muted hover:text-evermont-blue transition">
          <ArrowLeft className="h-4 w-4" /> All accounts
        </Link>
      </div>

      {notice && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center gap-2" role="status">
          <Info className="h-4 w-4 shrink-0" /> {notice}
        </div>
      )}

      {/* Account hero */}
      <div className="relative overflow-hidden rounded-2xl bg-evermont-blue text-white p-6 sm:p-8 mb-8 shadow-lg">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
                <config.Icon className="h-6 w-6 text-evermont-gold" />
              </span>
              <div>
                <h1 className="text-xl font-bold">{config.label}</h1>
                <p className="text-xs text-gray-200 mt-0.5">
                  {account.accountNumber} • {config.tagline}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-green-400/20 text-green-200 text-[10px] font-bold uppercase tracking-wide px-3 py-1">
              {account.status}
            </span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-200">{config.balanceLabel}</p>
          <p className="text-4xl sm:text-5xl font-bold mt-1.5 tabular-nums">{formatCurrency(balance)}</p>
          <p className="mt-2 text-sm text-gray-200">
            {isLoan
              ? `Next payment ${formatCurrency(loanDetail?.monthlyPayment ?? '0')} • due ${loanDetail ? new Date(loanDetail.nextPaymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '—'}`
              : `Available now: ${formatCurrency(balance)} • opened ${new Date(account.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {config.kind === 'cash' && (
              <>
                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-evermont-gold text-[#1a1a2e] text-sm font-semibold hover:brightness-110 transition">
                  <Repeat className="h-4 w-4" /> Transfer Money
                </button>
                <button onClick={() => setNotice('Bill Pay is simulated in demo mode — no real payment was scheduled.')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-white/60 text-sm font-semibold hover:bg-white/10 transition">
                  <Receipt className="h-4 w-4" /> Pay a Bill
                </button>
              </>
            )}
            {config.kind === 'loan' && (
              <button onClick={() => setNotice('Loan payment is simulated in demo mode — no real payment was made.')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-evermont-gold text-[#1a1a2e] text-sm font-semibold hover:brightness-110 transition">
                <Receipt className="h-4 w-4" /> Make a Payment
              </button>
            )}
            {(config.kind === 'invest' || config.kind === 'crypto') && (
              <>
                <button onClick={() => setNotice('Trading is simulated in demo mode — no real order was placed.')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-evermont-gold text-[#1a1a2e] text-sm font-semibold hover:brightness-110 transition">
                  Trade
                </button>
                <button onClick={() => setNotice('Statements export is simulated in demo mode.')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-white/60 text-sm font-semibold hover:bg-white/10 transition">
                  Statements
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loan details */}
      {isLoan && loanDetail && (
        <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6 mb-8">
          <h2 className="text-sm font-bold text-evermont-dark mb-4">Loan details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'APR', value: loanDetail.apr },
              { label: 'Original amount', value: formatCurrency(loanDetail.originalAmount) },
              { label: 'Monthly payment', value: formatCurrency(loanDetail.monthlyPayment) },
              { label: 'Term', value: `${loanDetail.termMonths} months` },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] text-evermont-muted">{item.label}</p>
                <p className="text-base font-bold text-evermont-dark tabular-nums mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-evermont-dark">Payoff progress</span>
              <span className="text-xs text-evermont-muted tabular-nums">
                {formatCurrency(loanDetail.originalAmount - balance)} of {formatCurrency(loanDetail.originalAmount)} paid
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-evermont-blue to-evermont-gold" style={{ width: `${Math.min(payoff, 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-evermont-blue">{Math.round(payoff)}% paid off</p>
          </div>
        </div>
      )}

      {/* Holdings */}
      {holdings.length > 0 && (
        <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6 mb-8">
          <h2 className="text-sm font-bold text-evermont-dark mb-4">
            Holdings {config.kind === 'crypto' ? '(simulated assets)' : ''}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-evermont-muted border-b border-evermont-border">
                  <th className="py-2.5 pr-4 font-semibold">Symbol</th>
                  <th className="py-2.5 pr-4 font-semibold">Name</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">Quantity</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">Change</th>
                  <th className="py-2.5 text-right font-semibold">Market value</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.symbol} className="border-b border-evermont-border last:border-0">
                    <td className="py-3 pr-4 font-bold text-evermont-blue">{h.symbol}</td>
                    <td className="py-3 pr-4 text-evermont-muted">{h.name}</td>
                    <td className="py-3 pr-4 text-right text-evermont-dark tabular-nums">{h.quantity}</td>
                    <td className={`py-3 pr-4 text-right font-semibold tabular-nums ${h.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {h.changePct >= 0 ? '+' : '−'}
                      {Math.abs(h.changePct).toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-bold text-evermont-dark tabular-nums">{formatCurrency(h.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {(config.kind === 'invest' || config.kind === 'crypto') && (
          <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-bold text-evermont-dark mb-1">Performance</h2>
            <p className="text-[11px] text-evermont-muted mb-4">Trailing 12 months</p>
            <LineChart data={DEMO_PERFORMANCE} height={150} formatValue={(v) => formatCurrency(v)} />
          </div>
        )}
        {config.kind === 'cash' && (
          <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-bold text-evermont-dark mb-1">Monthly Activity</h2>
            <p className="text-[11px] text-evermont-muted mb-4">Total movement over the last 6 months</p>
            <BarChart data={monthlyActivity} height={150} formatValue={(v) => formatCurrency(v)} />
          </div>
        )}
        {config.kind === 'loan' && (
          <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-bold text-evermont-dark mb-1">Payment Activity</h2>
            <p className="text-[11px] text-evermont-muted mb-4">Payments over the last 6 months</p>
            <BarChart data={monthlyActivity} height={150} barColor="#C9A227" formatValue={(v) => formatCurrency(v)} />
          </div>
        )}

        {/* Statements */}
        <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-bold text-evermont-dark mb-4">Statements</h2>
          <div className="space-y-1">
            {statements.map((stmt) => (
              <div key={stmt} className="flex items-center justify-between py-2.5 border-b border-evermont-border last:border-0">
                <span className="text-sm text-evermont-dark">{stmt} statement</span>
                <button
                  onClick={() => setNotice('Statement export is simulated in demo mode — no file was generated.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-evermont-blue border border-evermont-blue rounded-lg hover:bg-blue-50 transition"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold text-evermont-dark">Account Activity</h2>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity…"
              aria-label="Search account activity"
              className="px-3.5 py-2 text-sm border border-evermont-border rounded-lg focus:ring-2 focus:ring-evermont-gold focus:border-transparent min-w-0"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
              aria-label="Filter activity"
              className="px-3 py-2 text-sm border border-evermont-border rounded-lg bg-white focus:ring-2 focus:ring-evermont-gold focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </div>
        </div>

        {txLoading ? (
          <div className="space-y-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full animate-pulse bg-gray-200" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <config.Icon className="h-5 w-5 text-evermont-blue" />
            </div>
            <p className="text-sm font-semibold text-evermont-dark">
              {accountTxns.length === 0 ? 'No activity on this account yet' : 'No matching activity'}
            </p>
            <p className="text-xs text-evermont-muted mt-1 max-w-xs mx-auto">
              {accountTxns.length === 0
                ? 'Transactions will appear here once this account is used.'
                : 'Try a different search term or filter.'}
            </p>
          </div>
        ) : (
          filteredTxns.map((t) => <TransactionRow key={t.id} transaction={t} showStatus />)
        )}
      </div>

      <ActionModal action={modalOpen ? TRANSFER_ACTION : null} accounts={accounts} onClose={() => setModalOpen(false)} />
    </MemberLayout>
  )
}

export default AccountDetailPage
