import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { ROUTES } from '@/constants/routes'
import { Account, Transaction } from '@/types'

const money = (value: string | number | undefined) => {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount)) return '$0.00'
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const when = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const statusLabel = (status: Transaction['status']) => {
  if (status === 'pending') return 'Pending verification — simulated test data'
  if (status === 'failed') return 'Failed'
  return 'Completed'
}

const downloadStatement = (name: string, accounts: Account[], transactions: Transaction[]) => {
  const lines = [
    'Evermont Credit Union',
    'SIMULATED PROTOTYPE STATEMENT — NOT A REAL BANK RECORD',
    `Member,"${name.replace(/"/g, '""')}"`,
    '',
    'Accounts',
    'Type,Number,Available balance,Status',
    ...accounts.map((account) =>
      [account.accountType, account.accountNumber, account.balance, account.status].join(',')
    ),
    '',
    'Transactions',
    'Date,Description,Category,Type,Amount,Status,Resulting balance',
    ...transactions.map((item) =>
      [
        item.createdAt,
        `"${item.description.replace(/"/g, '""')}"`,
        item.category ?? '',
        item.type,
        item.amount,
        item.status,
        item.balanceAfter ?? '',
      ].join(',')
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'evermont-simulated-statement.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export const MemberDashboardPage: React.FC = () => {
  const { user, loading, signOut } = useAuth()
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts(user?.id)
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions(user?.id)
  const available = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0)
  const holder = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const busy = loading || (!!user && (accountsLoading || transactionsLoading))

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#17213b]">
      <header className="border-b border-evermont-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link to={ROUTES.HOME} className="text-lg font-bold tracking-wide text-evermont-blue">
            EVERMONT
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-sm font-semibold text-evermont-blue"
            >
              Sign out
            </button>
          ) : (
            <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-evermont-blue">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-evermont-muted">Member account</p>
        <h1 className="mt-2 text-3xl font-semibold text-evermont-blue">
          {holder ? `Welcome, ${holder}` : 'Member dashboard'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-evermont-muted">
          Simulated prototype balances and history. Evermont is not a licensed bank, and these figures are not real money.
        </p>

        {!user && !loading && (
          <div className="mt-8 rounded-2xl border border-evermont-border bg-white p-6">
            <p className="text-sm text-gray-700">Sign in to view your available balance and transaction history.</p>
            <Link
              to={ROUTES.LOGIN}
              className="mt-4 inline-flex rounded-lg bg-evermont-blue px-4 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        )}

        {busy && <p className="mt-8 text-sm text-evermont-blue">Loading your account...</p>}

        {user && !busy && (
          <>
            <div className="mt-8 overflow-hidden rounded-2xl bg-evermont-blue text-white shadow-sm">
              <div className="h-1 bg-evermont-gold" />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Available balance</p>
                <p className="mt-2 text-4xl font-semibold">{money(available)}</p>
                <p className="mt-3 text-sm text-white/80">
                  Pending credits are listed below and are not included in this balance.
                </p>
              </div>
            </div>

            {(accountsError || transactionsError) && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {accountsError || transactionsError}
              </p>
            )}

            <div className="mt-6 grid gap-4">
              {accounts.map((account) => (
                <article key={account.id} className="rounded-2xl border border-evermont-border bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold capitalize">{account.accountType.replace('_', ' ')}</h2>
                      <p className="mt-1 text-sm text-evermont-muted">Account {account.accountNumber}</p>
                    </div>
                    <p className="text-lg font-semibold text-evermont-blue">{money(account.balance)}</p>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-evermont-gold">{account.status}</p>
                </article>
              ))}
              {accounts.length === 0 && !accountsError && (
                <p className="rounded-2xl border border-evermont-border bg-white p-5 text-sm text-evermont-muted">
                  No account is saved for this member yet.
                </p>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-evermont-border bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-evermont-border px-5 py-4">
                <h2 className="text-lg font-semibold">Transaction history</h2>
                <button
                  type="button"
                  onClick={() => downloadStatement(holder || user.email, accounts, transactions)}
                  className="rounded-lg border border-evermont-blue px-3 py-2 text-xs font-semibold text-evermont-blue"
                >
                  Download statement
                </button>
              </div>
              <div className="divide-y divide-evermont-border">
                {transactions.map((item) => (
                  <article key={item.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{item.description}</h3>
                        <p className="mt-1 text-sm text-evermont-muted">
                          {when(item.createdAt)}
                          {item.category ? ` · ${item.category}` : ''}
                        </p>
                      </div>
                      <p className={`font-semibold ${item.type === 'credit' ? 'text-evermont-blue' : 'text-[#17213b]'}`}>
                        {item.type === 'credit' ? '+' : '−'}{money(item.amount)}
                      </p>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-evermont-gold">
                      {item.type} · {statusLabel(item.status)}
                    </p>
                    {item.balanceAfter && (
                      <p className="mt-1 text-sm text-evermont-muted">Resulting balance {money(item.balanceAfter)}</p>
                    )}
                  </article>
                ))}
                {transactions.length === 0 && !transactionsError && (
                  <p className="px-5 py-6 text-sm text-evermont-muted">No transactions are saved for this member yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <footer className="border-t border-evermont-border bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-evermont-blue">Connect with Evermont</p>
            <p className="mt-1 text-xs text-evermont-muted">Follow official Evermont Credit Union updates.</p>
          </div>
          <nav aria-label="Evermont social media" className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/evermontcreditunion"
              target="_blank"
              rel="noreferrer"
              aria-label="Evermont Credit Union on Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-evermont-border text-evermont-blue transition-colors hover:border-evermont-gold hover:text-evermont-gold"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.25" />
                <circle cx="17.4" cy="6.7" r="1" className="fill-current stroke-none" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/1GupMnFfkt/"
              target="_blank"
              rel="noreferrer"
              aria-label="Evermont Credit Union on Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-evermont-border text-evermont-blue transition-colors hover:border-evermont-gold hover:text-evermont-gold"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.6v8h3.1Z" />
              </svg>
            </a>
          </nav>
        </div>
      </footer>
    </main>
  )
}
