import React from 'react'
import { Transaction } from '@/types'
import { formatCurrency, timeAgo } from '@/utils/formatting'
import { merchantInfo } from '@/utils/merchant'

interface TransactionRowProps {
  transaction: Transaction
  accountLabel?: string
  showStatus?: boolean
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, accountLabel, showStatus = false }) => {
  const { Icon, chip, category } = merchantInfo(transaction.description)
  const isCredit = transaction.type === 'credit'

  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-evermont-border last:border-0">
      <span className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${chip}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-evermont-dark truncate">{transaction.description}</p>
          {showStatus && transaction.status === 'pending' && (
            <span className="text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 shrink-0">
              Pending
            </span>
          )}
        </div>
        <p className="text-xs text-evermont-muted mt-0.5 truncate">
          {category}
          {accountLabel ? ` • ${accountLabel}` : ''} • {timeAgo(transaction.createdAt)}
        </p>
      </div>
      <span
        className={`text-sm font-semibold whitespace-nowrap tabular-nums ${
          isCredit ? 'text-green-600' : 'text-evermont-dark'
        }`}
      >
        {isCredit ? '+' : '−'}
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  )
}

export default TransactionRow
