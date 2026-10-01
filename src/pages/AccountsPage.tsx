import React from 'react'
import { Link } from 'react-router-dom'
import { Wallet, PiggyBank, TrendingUp, Landmark, Bitcoin, Car, Home, CreditCard, ChevronRight, type LucideIcon } from 'lucide-react'
import { accountPath } from '@/constants/routes'
import { Account } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import MemberLayout from '@/components/MemberLayout'
import { formatCurrency, accountTypeLabel, maskAccountNumber, formatDate, isLoanType } from '@/utils/formatting'

const CARD_ICONS: Record<string, LucideIcon> = {
  checking: Wallet,
  savings: PiggyBank,
  investment: TrendingUp,
  retirement_401k: Landmark,
  crypto: Bitcoin,
  personal_loan: CreditCard,
  auto_loan: Car,
  home_loan: Home,
  crypto_loan: Bitcoin,
}

const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
  const Icon = CARD_ICONS[account.accountType] ?? Wallet
  const loan = isLoanType(account.accountType)
  return (
    <Link
      to={accountPath(account.accountType)}
      className="group bg-white rounded-xl border border-evermont-border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-evermont-blue/40 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-evermont-blue" />
        </span>
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-evermont-blue group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-sm font-semibold text-evermont-dark">{accountTypeLabel(account.accountType)}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${loan ? 'text-red-600' : 'text-evermont-blue'}`}>
        {formatCurrency(account.balance)}
      </p>
      <p className="text-[11px] text-evermont-muted mt-1">
        {loan ? 'Outstanding balance' : 'Available balance'} • {maskAccountNumber(account.accountNumber)}
      </p>
      <div className="mt-4 pt-3 border-t border-evermont-border flex items-center justify-between text-[11px] text-evermont-muted">
        <span>Opened {formatDate(account.createdAt)}</span>
        <span className="font-semibold uppercase tracking-wide text-green-600">Active</span>
      </div>
    </Link>
  )
}

const AccountsPage: React.FC = () => {
  const { user } = useAuth()
  const { accounts, loading } = useAccounts(user?.id)

  const assetAccounts = accounts.filter((a) => !isLoanType(a.accountType))
  const loanAccounts = accounts.filter((a) => isLoanType(a.accountType))
  const totalAssets = assetAccounts.reduce((s, a) => s + parseFloat(a.balance), 0)
  const totalLoans = loanAccounts.reduce((s, a) => s + parseFloat(a.balance), 0)

  return (
    <MemberLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-evermont-dark">Accounts</h1>
          <p className="text-sm text-evermont-muted mt-0.5">Every account, one clear view.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-white border border-evermont-border shadow-sm px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-evermont-muted">Total assets</p>
            <p className="text-lg font-bold text-evermont-blue tabular-nums">{formatCurrency(totalAssets)}</p>
          </div>
          <div className="rounded-xl bg-white border border-evermont-border shadow-sm px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-evermont-muted">Outstanding loans</p>
            <p className="text-lg font-bold text-red-600 tabular-nums">{formatCurrency(totalLoans)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-200/70" />
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-xs font-bold uppercase tracking-wider text-evermont-muted mb-3">Asset accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {assetAccounts.map((a) => (
              <AccountCard key={a.id} account={a} />
            ))}
          </div>

          <h2 className="text-xs font-bold uppercase tracking-wider text-evermont-muted mb-3">Loans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loanAccounts.map((a) => (
              <AccountCard key={a.id} account={a} />
            ))}
          </div>
        </>
      )}
    </MemberLayout>
  )
}

export default AccountsPage
