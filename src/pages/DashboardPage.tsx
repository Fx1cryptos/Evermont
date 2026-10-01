import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import MemberLayout from '@/components/MemberLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, accountTypeLabel, timeAgo } from '@/utils/formatting'

const assetTypes = new Set(['checking', 'savings', 'investment', 'retirement_401k', 'crypto'])

const TransactionRow: React.FC<{
  description: string
  accountLabel: string
  type: 'debit' | 'credit'
  amount: string
  date: string
}> = ({ description, accountLabel, type, amount, date }) => (
  <div className="flex items-center justify-between py-3 border-b border-evermont-border last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-evermont-dark truncate">{description}</p>
      <p className="text-xs text-evermont-muted">
        {accountLabel} • {timeAgo(date)}
      </p>
    </div>
    <span className={`text-sm font-semibold whitespace-nowrap ${type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
      {type === 'credit' ? '+' : '−'}
      {formatCurrency(amount)}
    </span>
  </div>
)

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { accounts, loading: accountsLoading } = useAccounts(user?.id)
  const { transactions, loading: txLoading } = useTransactions(user?.id, { limit: 8 })

  const assets = accounts
    .filter((a) => assetTypes.has(a.accountType))
    .reduce((sum, a) => sum + parseFloat(a.balance), 0)
  const liabilities = accounts
    .filter((a) => a.accountType === 'loan')
    .reduce((sum, a) => sum + parseFloat(a.balance), 0)
  const accountName = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId)
    return acc ? accountTypeLabel(acc.accountType) : 'Account'
  }

  return (
    <MemberLayout>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-evermont-dark">
          Welcome, {user?.firstName}
        </h1>
      </div>
      <p className="text-evermont-muted text-sm mb-8">
        Financial overview of your simulated member accounts.
      </p>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <p className="text-sm text-evermont-muted mb-1">Total Assets</p>
          <p className="text-3xl font-bold text-evermont-blue">
            {formatCurrency(assets)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-evermont-muted mb-1">Total Liabilities</p>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(liabilities)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-evermont-muted mb-1">Net Worth</p>
          <p className="text-3xl font-bold text-evermont-blue">
            {formatCurrency(assets - liabilities)}
          </p>
        </Card>
      </div>

      {/* Accounts */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-evermont-dark">Your Accounts</h2>
        <Link to={ROUTES.ACCOUNTS}>
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </div>
      {accountsLoading ? (
        <p className="text-evermont-muted text-sm mb-10">Loading accounts…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {accounts.map((account) => (
            <Card key={account.id}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-evermont-dark">
                  {accountTypeLabel(account.accountType)}
                </p>
                {account.accountType === 'loan' && (
                  <span className="text-[10px] font-bold uppercase text-red-600">Outstanding</span>
                )}
              </div>
              <p className={`text-2xl font-bold ${account.accountType === 'loan' ? 'text-red-600' : 'text-evermont-blue'}`}>
                {formatCurrency(account.balance)}
              </p>
              <p className="text-xs text-evermont-muted mt-2">
                {accountTypeLabel(account.accountType)} • {account.accountNumber}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Recent transactions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-evermont-dark">Recent Transactions</h2>
        <Link to={ROUTES.TRANSACTIONS}>
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </div>
      <Card>
        {txLoading ? (
          <p className="text-evermont-muted text-sm py-4">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-evermont-muted">
            <p>No transactions yet.</p>
            <p className="text-sm mt-1">Your recent activity will appear here.</p>
          </div>
        ) : (
          transactions.map((txn) => (
            <TransactionRow
              key={txn.id}
              description={txn.description}
              accountLabel={accountName(txn.accountId)}
              type={txn.type}
              amount={txn.amount}
              date={txn.createdAt}
            />
          ))
        )}
      </Card>
    </MemberLayout>
  )
}

export default DashboardPage
