import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, accountPath } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import MemberLayout from '@/components/MemberLayout'
import QuickActions from '@/components/member/QuickActions'
import TransactionRow from '@/components/member/TransactionRow'
import {
  StatCard,
  CashFlowCard,
  UpcomingPaymentsCard,
  SavingsGoalsCard,
  InvestmentPerformanceCard,
} from '@/components/member/DashboardWidgets'
import { BarChart } from '@/components/charts/SimpleCharts'
import { DEMO_UPCOMING_PAYMENTS, DEMO_SAVINGS_GOALS, DEMO_HOLDINGS, DEMO_PERFORMANCE, DEMO_HOME_VALUE } from '@/data/demoMember'
import { formatCurrency, accountTypeLabel } from '@/utils/formatting'
import { merchantInfo } from '@/utils/merchant'

const ASSET_TYPES = new Set(['checking', 'savings', 'investment', 'retirement_401k', 'crypto'])

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200/70 ${className}`} />
)

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { accounts, loading: accountsLoading } = useAccounts(user?.id)
  const { transactions, loading: txLoading } = useTransactions(user?.id)

  const assets = accounts.filter((a) => ASSET_TYPES.has(a.accountType)).reduce((s, a) => s + parseFloat(a.balance), 0)
  const loans = accounts
    .filter((a) => a.accountType.endsWith('_loan') || a.accountType === 'loan')
    .reduce((s, a) => s + parseFloat(a.balance), 0)
  const netWorth = assets + DEMO_HOME_VALUE - loans
  const available = accounts
    .filter((a) => a.accountType === 'checking' || a.accountType === 'savings')
    .reduce((s, a) => s + parseFloat(a.balance), 0)

  const byType = (type: string) => accounts.find((a) => a.accountType === type)
  const loanAccounts = accounts.filter((a) => a.accountType.endsWith('_loan') || a.accountType === 'loan')
  const loanLabel =
    loanAccounts.length > 0 ? `${loanAccounts.length} active loan${loanAccounts.length > 1 ? 's' : ''}` : 'None'

  // Spending by category, last 30 days
  const recent = transactions.filter(
    (t) => t.type === 'debit' && Date.now() - new Date(t.createdAt).getTime() < 30 * 86400000,
  )
  const categoryTotals = new Map<string, number>()
  for (const t of recent) {
    const cat = merchantInfo(t.description).category
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + parseFloat(t.amount))
  }
  const spendingData = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value: Math.round(value) }))

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const accountLabelFor = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId)
    return acc ? accountTypeLabel(acc.accountType) : undefined
  }

  return (
    <MemberLayout>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-evermont-dark">
          {greeting}, {user?.firstName}
        </h1>
        <p className="text-sm text-evermont-muted mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {' • '}Here's your complete financial position.
        </p>
      </div>

      {/* Total financial position hero */}
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
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-200">Total financial position</p>
            <p className="text-4xl sm:text-5xl font-bold mt-2 tabular-nums">{formatCurrency(netWorth)}</p>
            <p className="mt-2 text-sm text-gray-200">
              {formatCurrency(assets)} in accounts • {formatCurrency(DEMO_HOME_VALUE)} estimated home value •{' '}
              {formatCurrency(loans)} outstanding loans
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:gap-8">
            <div>
              <p className="text-xs text-gray-200">Available funds</p>
              <p className="text-xl font-bold text-evermont-gold tabular-nums">{formatCurrency(available)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-200">Outstanding loans</p>
              <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(loans)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance strip */}
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-evermont-muted mb-3">Your balances</h2>
        {accountsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <StatCard label="Checking" value={formatCurrency(byType('checking')?.balance ?? 0)} sub={byType('checking')?.accountNumber} to={accountPath('checking')} />
            <StatCard label="Savings" value={formatCurrency(byType('savings')?.balance ?? 0)} sub={byType('savings')?.accountNumber} to={accountPath('savings')} />
            <StatCard label="Investment" value={formatCurrency(byType('investment')?.balance ?? 0)} sub={byType('investment')?.accountNumber} to={accountPath('investment')} />
            <StatCard label="401(k)" value={formatCurrency(byType('retirement_401k')?.balance ?? 0)} sub={byType('retirement_401k')?.accountNumber} to={accountPath('retirement_401k')} />
            <StatCard label="Crypto" value={formatCurrency(byType('crypto')?.balance ?? 0)} sub={byType('crypto')?.accountNumber} to={accountPath('crypto')} />
            <StatCard label="Outstanding loans" value={formatCurrency(loans)} sub={loanLabel} to={ROUTES.ACCOUNTS} tone="alert" />
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-evermont-muted mb-3">Quick actions</h2>
        <QuickActions accounts={accounts} />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-evermont-dark">Recent Transactions</h2>
            <Link to={ROUTES.TRANSACTIONS} className="text-xs font-semibold text-evermont-blue hover:underline">
              View all →
            </Link>
          </div>
          {txLoading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-evermont-dark">No transactions yet</p>
              <p className="text-xs text-evermont-muted mt-1">Your activity will appear here after your first transfer or purchase.</p>
            </div>
          ) : (
            transactions.slice(0, 8).map((t) => (
              <TransactionRow key={t.id} transaction={t} accountLabel={accountLabelFor(t.accountId)} showStatus />
            ))
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <CashFlowCard transactions={transactions} />
          <UpcomingPaymentsCard payments={DEMO_UPCOMING_PAYMENTS} />
          <SavingsGoalsCard goals={DEMO_SAVINGS_GOALS} />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-bold text-evermont-dark mb-1">Spending by Category</h2>
          <p className="text-[11px] text-evermont-muted mb-5">Top categories over the last 30 days</p>
          {txLoading ? (
            <Skeleton className="h-40" />
          ) : spendingData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-evermont-dark">No spending activity</p>
              <p className="text-xs text-evermont-muted mt-1">Your category breakdown appears once you make purchases.</p>
            </div>
          ) : (
            <BarChart data={spendingData} height={170} formatValue={(v) => formatCurrency(v)} />
          )}
        </div>
        <InvestmentPerformanceCard
          performance={DEMO_PERFORMANCE}
          holdings={DEMO_HOLDINGS['demo-investments'] ?? []}
          accountLabel="Investments"
        />
      </div>
    </MemberLayout>
  )
}

export default DashboardPage
