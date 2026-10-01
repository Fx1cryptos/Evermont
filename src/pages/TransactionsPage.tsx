import React, { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import MemberLayout from '@/components/MemberLayout'
import { formatCurrency, accountTypeLabel } from '@/utils/formatting'
import { merchantInfo } from '@/utils/merchant'

type TypeFilter = 'all' | 'credit' | 'debit'

const TransactionsPage: React.FC = () => {
  const { user } = useAuth()
  const { accounts } = useAccounts(user?.id)
  const { transactions, loading } = useTransactions(user?.id)

  const [query, setQuery] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [accountId, setAccountId] = useState('all')

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (query && !t.description.toLowerCase().includes(query.toLowerCase())) return false
      if (type !== 'all' && t.type !== type) return false
      if (accountId !== 'all' && t.accountId !== accountId) return false
      return true
    })
  }, [transactions, query, type, accountId])

  const moneyIn = filtered.filter((t) => t.type === 'credit').reduce((s, t) => s + parseFloat(t.amount), 0)
  const moneyOut = filtered.filter((t) => t.type === 'debit').reduce((s, t) => s + parseFloat(t.amount), 0)

  const accountLabel = (id: string) => {
    const acc = accounts.find((a) => a.id === id)
    return acc ? accountTypeLabel(acc.accountType) : 'Account'
  }

  const selectClass =
    'px-3 py-2.5 text-sm border border-evermont-border rounded-lg bg-white text-evermont-dark focus:ring-2 focus:ring-evermont-gold focus:border-transparent'

  return (
    <MemberLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-evermont-dark">Transactions</h1>
        <p className="text-sm text-evermont-muted mt-0.5">Search and filter activity across all of your accounts.</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Money in', value: moneyIn, color: 'text-green-600' },
          { label: 'Money out', value: moneyOut, color: 'text-red-600' },
          { label: 'Net', value: moneyIn - moneyOut, color: moneyIn - moneyOut >= 0 ? 'text-green-600' : 'text-red-600' },
        ].map((chip) => (
          <div key={chip.label} className="bg-white rounded-xl border border-evermont-border shadow-sm p-4">
            <p className="text-[11px] font-medium text-evermont-muted">{chip.label}</p>
            <p className={`text-lg sm:text-xl font-bold mt-1 tabular-nums ${chip.color}`}>
              {formatCurrency(chip.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by description or merchant…"
            aria-label="Search transactions"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-evermont-border rounded-lg focus:ring-2 focus:ring-evermont-gold focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-evermont-muted shrink-0" />
          <select value={type} onChange={(e) => setType(e.target.value as TypeFilter)} aria-label="Filter by type" className={selectClass}>
            <option value="all">All types</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} aria-label="Filter by account" className={selectClass}>
            <option value="all">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountTypeLabel(a.accountType)} {a.accountNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full animate-pulse bg-gray-200" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Search className="h-6 w-6 text-evermont-blue" />
            </div>
            <p className="text-sm font-semibold text-evermont-dark">No transactions found</p>
            <p className="text-xs text-evermont-muted mt-1 max-w-xs mx-auto">
              Try a different search term or clear your filters to see all activity.
            </p>
            <button
              onClick={() => {
                setQuery('')
                setType('all')
                setAccountId('all')
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-evermont-blue border border-evermont-blue rounded-lg hover:bg-blue-50 transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-evermont-muted border-b border-evermont-border">
                  <th className="py-3 pr-4 font-semibold">Description</th>
                  <th className="py-3 pr-4 font-semibold">Account</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const info = merchantInfo(t.description)
                  const isCredit = t.type === 'credit'
                  return (
                    <tr key={t.id} className="border-b border-evermont-border last:border-0 hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <span className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${info.chip}`}>
                            <info.Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-evermont-dark truncate max-w-[280px]">{t.description}</p>
                            <p className="text-[11px] text-evermont-muted">
                              {info.category} •{' '}
                              {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-evermont-muted">{accountLabel(t.accountId)}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-semibold tabular-nums ${isCredit ? 'text-green-600' : 'text-evermont-dark'}`}>
                        {isCredit ? '+' : '−'}
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MemberLayout>
  )
}

export default TransactionsPage
