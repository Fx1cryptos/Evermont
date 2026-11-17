import React, { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpRight as ExternalLink,
  Bell,
  FileText,
  HelpCircle,
  Receipt,
  Send,
  WalletCards,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { maskAccount } from '@/lib/bankingServices'
import { useNotifications } from '@/hooks/useNotifications'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { transactionService, type LedgerActivity } from '@/services/transactionService'
import type { Account, Profile } from '@/types'

const formatCurrency = (value: string | number, currency: string): string => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || String(value).trim() === '') return 'Balance unavailable'
  if (!currency.trim()) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

const formatAmount = (value: string | number): string => {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : 'Amount unavailable'
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date not returned'
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const Panel: React.FC<{
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}> = ({ title, description, action, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(20,32,63,0.035)]">
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-sm font-semibold text-[#17213C]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
)

const quickActions = [
  { label: 'View accounts', to: ROUTES.ACCOUNTS, icon: WalletCards, note: 'Your account details' },
  { label: 'Make a transfer', to: '/services/transfer', icon: Send, note: 'Transfer services' },
  { label: 'Transaction history', to: ROUTES.TRANSACTIONS, icon: Receipt, note: 'Review account activity' },
  { label: 'Contact support', to: ROUTES.SUPPORT, icon: HelpCircle, note: 'We are here to help' },
]

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<LedgerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [accountError, setAccountError] = useState('')
  const [transactionError, setTransactionError] = useState('')
  const { notifications, loading: notificationsLoading, error: notificationError } = useNotifications(user?.id)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setAccountError('')
    setTransactionError('')

    const load = async () => {
      const results = await Promise.allSettled([
        profileService.getProfile(user.id),
        accountService.getAccounts(user.id),
        transactionService.getTransactions(user.id, { limit: 8 }),
      ])
      if (!active) return

      const [profileResult, accountsResult, transactionsResult] = results
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value)
      else setProfile(null)

      if (accountsResult.status === 'fulfilled') setAccounts(accountsResult.value)
      else {
        setAccounts([])
        setAccountError('We could not load your accounts. Please try again later.')
      }

      if (transactionsResult.status === 'fulfilled') setTransactions(transactionsResult.value)
      else {
        setTransactions([])
        setTransactionError('We could not load recent transactions. Please try again later.')
      }

      setLoading(false)
    }

    void load()
    return () => { active = false }
  }, [user])

  if (authLoading || (user && loading)) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500" role="status">Loading your member overview…</p>
      </main>
    )
  }

  if (!user) {
    return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>
  }

  const firstName = profile?.firstName || user.firstName || 'Member'
  const fullName = [profile?.firstName || user.firstName, profile?.lastName || user.lastName].filter(Boolean).join(' ')
  const unreadCount = notifications.filter(notification => !notification.read).length

  return (
    <PortalShell title="Overview" eyebrow="Private member portal">
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[24px] bg-[#101A35] px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10">
          <div className="pointer-events-none absolute -right-20 -top-32 size-[340px] rounded-full border border-white/[0.07]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-8 -top-20 size-[230px] rounded-full border border-[#C9A227]/20" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#D4B65D]">EVERMONT · PRIVATE MEMBER</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-.035em] sm:text-3xl lg:text-[34px]">
              Welcome back, {firstName}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Your financial overview, thoughtfully brought together.
            </p>
            <p className="mt-5 text-xs font-medium tracking-wide text-[#E4D6A9]">Where Private Wealth Is Protected.</p>
          </div>
          {fullName && (
            <div className="relative mt-7 flex items-center gap-3 border-t border-white/10 pt-5 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:border-0 sm:pt-0 lg:right-10">
              <span className="flex size-10 items-center justify-center rounded-full border border-[#C9A227]/40 bg-white/[0.06] text-xs font-semibold text-[#E4D6A9]">
                {fullName.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('')}
              </span>
              <span>
                <span className="block text-xs font-semibold text-white">{fullName}</span>
                <span className="mt-1 block text-[10px] text-slate-400">Member account</span>
              </span>
            </div>
          )}
        </section>

        <section aria-labelledby="accounts-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#927421]">Your relationship</p>
              <h2 id="accounts-heading" className="mt-1 text-lg font-semibold tracking-[-.02em] text-[#17213C]">Accounts</h2>
            </div>
            <Link to={ROUTES.ACCOUNTS} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0504AA] hover:text-[#8A6A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]">
              All accounts <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {accountError && <p role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{accountError}</p>}
          {!accountError && accounts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <WalletCards className="mx-auto size-6 text-[#927421]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#17213C]">No accounts to display</p>
              <p className="mt-1 text-xs text-slate-500">Account details will appear here when available.</p>
            </div>
          )}
          {accounts.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {accounts.map(account => (
                <article key={account.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(20,32,63,0.035)] transition-colors hover:border-[#C9A227]/70 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0504AA]/[0.06] text-[#0504AA]">
                        <WalletCards className="size-[18px]" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold capitalize text-[#17213C]">{account.accountType.replace('_', ' ')}</h3>
                        <p className="mt-1 font-mono text-[11px] tracking-wide text-slate-500">
                          {account.accountNumber ? maskAccount(account.accountNumber) : 'Account number not returned'}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold capitalize ${
                      account.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {account.status || 'Status not returned'}
                    </span>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-slate-400">Account balance</p>
                    <p className="mt-1.5 text-[25px] font-medium tracking-[-.035em] text-[#17213C] tabular-nums">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {account.currency || 'Currency not returned'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="quick-actions-heading">
          <div className="mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#927421]">At your service</p>
            <h2 id="quick-actions-heading" className="mt-1 text-lg font-semibold tracking-[-.02em] text-[#17213C]">Quick access</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {quickActions.map(({ label, to, icon: Icon, note }) => (
              <Link
                key={to}
                to={to}
                className="group flex min-h-[104px] items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#C9A227]/70 hover:shadow-[0_10px_28px_rgba(20,32,63,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] sm:p-5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0504AA]/[0.06] text-[#0504AA] transition-colors group-hover:bg-[#0504AA] group-hover:text-white">
                  <Icon className="size-[17px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-xs font-semibold text-[#17213C]">{label}</span>
                  <span className="mt-1 block text-[10px] leading-4 text-slate-500">{note}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Panel
            title="Recent transactions"
            description="Recent activity returned for your member accounts."
            action={
              <Link to={ROUTES.TRANSACTIONS} className="shrink-0 text-[11px] font-semibold text-[#0504AA] hover:text-[#8A6A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]">
                View history
              </Link>
            }
          >
            {transactionError ? (
              <p role="alert" className="px-5 py-8 text-sm text-rose-800 sm:px-6">{transactionError}</p>
            ) : transactions.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <Receipt className="mx-auto size-6 text-[#927421]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[#17213C]">No transactions to display</p>
                <p className="mt-1 text-xs text-slate-500">Posted activity will appear here when available.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {transactions.map(row => {
                  const credit = row.direction === 'credit'
                  const account = accounts.find(item => item.id === row.accountId)
                  return (
                    <li key={row.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {credit
                          ? <ArrowDownLeft className="size-4" aria-hidden="true" />
                          : <ArrowUpRight className="size-4" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#17213C]">{row.description || 'Transaction'}</p>
                        <p className="mt-1 text-[10px] text-slate-500">{formatDate(row.createdAt)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-xs font-semibold tabular-nums ${credit ? 'text-emerald-800' : 'text-[#17213C]'}`}>
                          {credit ? '+' : '−'}{account?.currency
                            ? formatCurrency(row.displayAmount, account.currency)
                            : formatAmount(row.displayAmount)}
                        </p>
                        <p className="mt-1 text-[9px] font-medium capitalize text-slate-500">
                          {row.status || 'Status not returned'}
                          {!account?.currency && <span className="block">Currency not returned</span>}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Your notifications"
            description={unreadCount ? `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}` : 'Important account messages'}
            action={
              <Link to="/alerts" aria-label="View all notifications" className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0504AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]">
                <Bell className="size-4" aria-hidden="true" />
              </Link>
            }
          >
            {notificationsLoading ? (
              <p role="status" className="px-5 py-8 text-sm text-slate-500 sm:px-6">Loading notifications…</p>
            ) : notificationError ? (
              <p role="alert" className="px-5 py-8 text-sm text-rose-800 sm:px-6">Notifications could not be loaded.</p>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <Bell className="mx-auto size-6 text-[#927421]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[#17213C]">No notifications returned</p>
                <p className="mt-1 text-xs text-slate-500">Account notifications will appear here when available.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.slice(0, 4).map(notification => (
                  <li key={notification.id} className="flex gap-3 px-5 py-4 sm:px-6">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-200' : 'bg-[#C9A227]'}`} aria-label={notification.read ? 'Read' : 'Unread'} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#17213C]">{notification.title || 'Account notification'}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">{notification.message}</p>
                      <p className="mt-1.5 text-[9px] text-slate-400">{formatDate(notification.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
              <Link to="/alerts" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0504AA] hover:text-[#8A6A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]">
                All notifications <FileText className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </PortalShell>
  )
}

export default MemberDashboardPage
