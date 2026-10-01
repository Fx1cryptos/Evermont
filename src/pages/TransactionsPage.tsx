import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import MemberLayout from '@/components/MemberLayout'
import { Card } from '@/components/ui/Card'
import { formatCurrency, accountTypeLabel, formatDate } from '@/utils/formatting'

const TransactionsPage: React.FC = () => {
  const { user } = useAuth()
  const { accounts } = useAccounts(user?.id)
  const { transactions, loading } = useTransactions(user?.id)

  const accountLabel = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId)
    return acc ? accountTypeLabel(acc.accountType) : 'Account'
  }

  return (
    <MemberLayout>
      <h1 className="text-2xl font-bold text-evermont-dark mb-1">Transactions</h1>
      <p className="text-evermont-muted text-sm mb-8">
        Simulated activity across all of your accounts.
      </p>

      <Card>
        {loading ? (
          <p className="text-evermont-muted text-sm py-4">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <p className="text-center py-8 text-evermont-muted">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-evermont-muted border-b border-evermont-border">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Description</th>
                  <th className="py-3 pr-4 font-medium">Account</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-evermont-border last:border-0">
                    <td className="py-3 pr-4 text-evermont-muted whitespace-nowrap">
                      {formatDate(txn.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-evermont-dark">{txn.description}</td>
                    <td className="py-3 pr-4 text-evermont-muted">{accountLabel(txn.accountId)}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-700">
                        {txn.status}
                      </span>
                    </td>
                    <td
                      className={`py-3 text-right font-semibold whitespace-nowrap ${
                        txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.type === 'credit' ? '+' : '−'}
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </MemberLayout>
  )
}

export default TransactionsPage
