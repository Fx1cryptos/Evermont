import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import MemberLayout from '@/components/MemberLayout'
import { Card } from '@/components/ui/Card'
import { formatCurrency, accountTypeLabel, formatDate } from '@/utils/formatting'

const assetTypes = new Set(['checking', 'savings', 'investment', 'retirement_401k', 'crypto'])

const AccountsPage: React.FC = () => {
  const { user } = useAuth()
  const { accounts, loading } = useAccounts(user?.id)

  return (
    <MemberLayout>
      <h1 className="text-2xl font-bold text-evermont-dark mb-1">Accounts</h1>
      <p className="text-evermont-muted text-sm mb-8">
        All of your simulated Evermont accounts.
      </p>

      {loading ? (
        <p className="text-evermont-muted text-sm">Loading accounts…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-evermont-dark">
                  {accountTypeLabel(account.accountType)}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    account.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {account.status}
                </span>
              </div>
              <p className={`text-2xl font-bold ${account.accountType === 'loan' ? 'text-red-600' : 'text-evermont-blue'}`}>
                {formatCurrency(account.balance)}
              </p>
              <p className="text-xs text-evermont-muted mt-1">
                {account.accountType === 'loan' ? 'Outstanding balance' : 'Available balance'}
              </p>
              <div className="mt-4 pt-4 border-t border-evermont-border text-xs text-evermont-muted space-y-1">
                <p>Account number: {account.accountNumber}</p>
                <p>Opened: {formatDate(account.createdAt)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MemberLayout>
  )
}

export default AccountsPage
