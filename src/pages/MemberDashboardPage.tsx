import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  LogOut,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import type { Account, Transaction } from '@/types'

const formatMoney = (value: string | number, currency = 'USD') => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const accountLabel = (account: Account) => {
  const labels: Record<string, string> = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    money_market: 'Money Market Account',
  }

  return labels[account.accountType] || 'Bank Account'
}

const maskAccountNumber = (value: string) => {
  const cleaned = value.replace(/\s/g, '')
  if (cleaned.includes('*')) return cleaned
  return `•••• ${cleaned.slice(-4)}`
}

const TransactionRow: React.FC<{
  transaction: Transaction
  currency: string
}> = ({ transaction, currency }) => {
  const isCredit = transaction.type === 'credit'

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-b-0">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          isCredit
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-600'
        }`}
      >
        {isCredit ? (
          <ArrowDownLeft size={20} />
        ) : (
          <ArrowUpRight size={20} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {transaction.description || 'Account transaction'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDate(transaction.createdAt)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-bold ${
            isCredit ? 'text-emerald-700' : 'text-slate-800'
          }`}
        >
          {isCredit ? '+' : '−'}
          {formatMoney(transaction.amount, currency)}
        </p>
        <span
          className={`mt-1 inline-flex items-center gap-1 text-xs ${
            transaction.status === 'completed'
              ? 'text-emerald-700'
              : transaction.status === 'pending'
                ? 'text-amber-700'
                : 'text-rose-600'
          }`}
        >
          {transaction.status === 'completed' ? (
            <CheckCircle2 size={12} />
          ) : (
            <Clock3 size={12} />
          )}
          {transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)}
        </span>
      </div>
    </div>
  )
}

export const MemberDashboardPage: React.FC = () => {
  const [selectedBankingAction, setSelectedBankingAction] = useState<string | null>(null)
  const { user, signOut } = useAuth()
  const { accounts, loading: accountsLoading, error: accountsError } =
    useAccounts(user?.id)

  const transactionFilters = useMemo(() => ({ limit: 10 }), [])
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions(user?.id, transactionFilters)

  const totalBalance = accounts.reduce(
    (total, account) => total + (Number(account.balance) || 0),
    0,
  )

  const currency = accounts[0]?.currency || 'USD'
  const firstName = user?.firstName?.trim() || 'Member'
  const activeAccounts = accounts.filter(
    (account) => account.status === 'active',
  ).length

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0504AA] text-white shadow-lg shadow-blue-900/20">
              <Landmark size={23} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-[0.12em] text-[#0504AA]">
                EVERMONT
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.19em] text-slate-500">
                Private Wealth Banking
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">
                {user?.firstName || 'Member'} {user?.lastName || ''}
              </p>
              <p className="text-xs text-slate-500">Member banking</p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0504AA] via-[#1715a5] to-[#252d72] p-6 text-white shadow-xl shadow-blue-950/15 sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-[#C9A227]/15 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
                <ShieldCheck size={15} className="text-[#e7c65c]" />
                Your secure member space
              </div>

              <p className="text-sm font-medium text-blue-100">
                WHERE PRIVATE WEALTH IS PROTECTED.
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Your financial life, organized in one place. Review your
                accounts and stay up to date with your latest transactions.
              </p>

              <a
                href="#accounts"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#C9A227] px-5 py-3 text-sm font-bold text-[#17143e] transition hover:bg-[#e0bd49]"
              >
                View my accounts <ArrowRight size={17} />
              </a>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-blue-100">
                  Combined account balance
                </span>
                <WalletCards className="text-[#e7c65c]" size={23} />
              </div>

              {accountsLoading ? (
                <div className="mt-4 h-10 w-48 animate-pulse rounded-lg bg-white/15" />
              ) : accountsError ? (
                <p className="mt-4 text-sm font-semibold text-amber-200">
                  Balance temporarily unavailable
                </p>
              ) : (
                <p className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                  {formatMoney(totalBalance, currency)}
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-blue-100">
                <ShieldCheck size={15} className="text-[#e7c65c]" />
                Balance from your linked account records
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total balance
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0504AA]">
                <WalletCards size={20} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {accountsLoading
                ? 'Loading…'
                : accountsError
                  ? 'Unavailable'
                  : formatMoney(totalBalance, currency)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Across your loaded accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Your accounts
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <CreditCard size={20} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {accountsLoading ? '…' : accountsError ? '—' : accounts.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {accountsLoading
                ? 'Loading account records'
                : `${activeAccounts} active account${activeAccounts === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Recent activity
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp size={20} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              {transactionsLoading
                ? '…'
                : transactionsError
                  ? '—'
                  : transactions.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Latest available transactions
            </p>
          </div>
        </section>

        <section id="accounts" className="mt-10 scroll-mt-24">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0504AA]">
                Your money
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                My accounts
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Secure account overview
            </span>
          </div>

          {accountsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          ) : accountsError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-bold">We couldn&apos;t load your accounts.</p>
              <p className="mt-1">
                {accountsError} Your saved records have not been changed.
                Please refresh or contact member support if this continues.
              </p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <WalletCards className="mx-auto text-slate-400" size={32} />
              <h3 className="mt-3 font-bold text-slate-800">
                No accounts are available to display
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No account records were returned for this signed-in member.
                If you expect to see an account, check the member profile and
                account permissions in Supabase.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {accounts.map((account, index) => (
                <article
                  key={account.id}
                  className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${
                    index % 2 === 0
                      ? 'bg-gradient-to-br from-[#0908a5] to-[#3038a1]'
                      : 'bg-gradient-to-br from-[#17243d] to-[#31556c]'
                  }`}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/10" />
                  <div className="pointer-events-none absolute -right-1 -top-1 h-24 w-24 rounded-full border border-white/10" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-100">
                        {accountLabel(account)}
                      </p>
                      <p className="mt-2 text-xs tracking-[0.15em] text-blue-100/80">
                        {maskAccountNumber(account.accountNumber)}
                      </p>
                    </div>
                    <Landmark size={25} className="text-[#e7c65c]" />
                  </div>

                  <div className="relative mt-8">
                    <p className="text-xs font-medium text-blue-100">
                      Available balance
                    </p>
                    <p className="mt-2 break-words text-3xl font-bold tracking-tight">
                      {formatMoney(account.balance, account.currency)}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between border-t border-white/15 pt-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        account.status === 'active'
                          ? 'bg-emerald-400/15 text-emerald-100'
                          : account.status === 'frozen'
                            ? 'bg-rose-400/15 text-rose-100'
                            : 'bg-white/15 text-white'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {account.status.charAt(0).toUpperCase() +
                        account.status.slice(1)}
                    </span>
                    <span className="text-xs text-blue-100">
                      Member account
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="transactions" className="mt-10 scroll-mt-24">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0504AA]">
                Account activity
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Recent transactions
              </h2>
            </div>
            <span className="text-xs text-slate-500">Latest 10 entries</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white px-5 shadow-sm sm:px-6">
            {transactionsLoading ? (
              <div className="space-y-4 py-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : transactionsError ? (
              <div className="py-8 text-sm text-amber-800">
                <p className="font-bold">
                  Transaction history is temporarily unavailable.
                </p>
                <p className="mt-1">
                  {transactionsError} Your saved transaction records have not
                  been changed.
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center">
                <Clock3 className="mx-auto text-slate-400" size={30} />
                <p className="mt-3 font-semibold text-slate-700">
                  No transactions to display
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  No ledger entries were returned for this member.
                </p>
              </div>
            ) : (
              transactions.map((transaction) => {
                const transactionAccount = accounts.find(
                  (account) => account.id === transaction.accountId,
                )

                return (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    currency={transactionAccount?.currency || currency}
                  />
                )
              })
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            This view shows the latest available entries. Older history remains
            in the underlying records; this dashboard currently displays up
            to 10 transactions.
          </p>
        </section>


        <section id="banking-actions" className="mt-10 scroll-mt-24">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0504AA]">
              Member services
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Banking Actions
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Select a service to learn how to request access. Availability and eligibility must be confirmed with Member Support.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Transfer Money',
                description: 'Request access to money transfer services.',
                icon: ArrowUpRight,
              },
              {
                label: 'Pay Bills',
                description: 'Ask about bill payment service access.',
                icon: CreditCard,
              },
              {
                label: 'Buy/Sell Cryptocurrency',
                description: 'Ask whether cryptocurrency services are available.',
                icon: WalletCards,
              },
              {
                label: 'Invest',
                description: 'Discuss investment service availability and eligibility.',
                icon: TrendingUp,
              },
            ].map((action) => {
              const ActionIcon = action.icon

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => setSelectedBankingAction(action.label)}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0504AA]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0504AA] focus:ring-offset-2"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0504AA] transition group-hover:bg-[#0504AA] group-hover:text-white">
                    <ActionIcon size={23} />
                  </span>
                  <span className="mt-4 block font-bold text-slate-900">
                    {action.label}
                  </span>
                  <span className="mt-2 block text-sm leading-5 text-slate-500">
                    {action.description}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0504AA]">
                    Request access <ArrowRight size={15} />
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section id="products" className="mt-11 scroll-mt-24">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0504AA]">
              Plan your next chapter
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Explore Evermont
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore banking and financial planning options. Product
              availability, eligibility, and terms must be confirmed with
              Evermont before applying.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
                <CreditCard size={42} className="text-[#0504AA]" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0504AA]">
                  Everyday banking
                </p>
                <h3 className="mt-2 text-lg font-bold">Checking</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Manage everyday spending and keep your banking organized.
                </p>
                <a
                  href="#accounts"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0504AA] hover:underline"
                >
                  View accounts <ArrowRight size={15} />
                </a>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-white">
                <PiggyBank size={42} className="text-emerald-700" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Build your future
                </p>
                <h3 className="mt-2 text-lg font-bold">Savings</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore ways to organize savings around your financial goals.
                </p>
                <a
                  href="#accounts"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
                >
                  View accounts <ArrowRight size={15} />
                </a>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-amber-100 via-amber-50 to-white">
                <TrendingUp size={42} className="text-amber-700" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Retirement planning
                </p>
                <h3 className="mt-2 text-lg font-bold">401(k) & retirement</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Learn about retirement planning and long-term financial goals.
                </p>
                <a
                  href={ROUTES.HOME}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:underline"
                >
                  Explore options <ArrowRight size={15} />
                </a>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-violet-100 via-violet-50 to-white">
                <Landmark size={42} className="text-violet-700" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
                  Personalized service
                </p>
                <h3 className="mt-2 text-lg font-bold">Private wealth</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Discover wealth-planning and lending service options.
                </p>
                <a
                  href={ROUTES.HOME}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:underline"
                >
                  Learn more <ArrowRight size={15} />
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e4d39b] bg-gradient-to-r from-[#fff9e7] via-white to-[#eef0ff] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C9A227]/20 text-[#80620b]">
                <ShieldCheck size={25} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#80620b]">
                  Banking with confidence
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Your financial information deserves care.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Keep your sign-in details private. Always verify account
                  activity and contact official member support if something
                  looks unfamiliar.
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.HOME}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0504AA] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
            >
              Evermont home <ArrowRight size={16} />
            </Link>
          </div>
        </section>


        {selectedBankingAction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedBankingAction(null)
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="activation-modal-title"
              aria-describedby="activation-modal-description"
              className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C9A227]/20 text-[#80620b]">
                  <ShieldCheck size={25} />
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBankingAction(null)}
                  aria-label="Close activation dialog"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0504AA]"
                >
                  Close
                </button>
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#80620b]">
                Evermont Member Services
              </p>
              <h2
                id="activation-modal-title"
                className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
              >
                Account Activation Required
              </h2>
              <p className="mt-3 text-sm font-semibold text-[#0504AA]">
                Selected service: {selectedBankingAction}
              </p>
              <p
                id="activation-modal-description"
                className="mt-3 text-sm leading-6 text-slate-600"
              >
                Your account may require additional review or activation before you can access this service. Please contact Evermont Member Support to verify your account status, service availability, and any applicable requirements or fees.
              </p>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                No transfer, bill payment, cryptocurrency transaction, or investment will be initiated from this dialog.
              </div>

              <a
                href="mailto:support@evermontcredit.online?subject=Account%20Activation%20Request"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0504AA] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-[#0504AA] focus:ring-offset-2"
              >
                Contact Member Support <ArrowRight size={17} />
              </a>

              <button
                type="button"
                onClick={() => setSelectedBankingAction(null)}
                className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Return to dashboard
              </button>
            </section>
          </div>
        )}

        <footer className="mt-10 flex flex-col gap-3 border-t border-slate-200 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EVERMONT Credit Union.</p>
          <p>Where Private Wealth is Protected.</p>
        </footer>
      </div>
    </main>
  )
}
