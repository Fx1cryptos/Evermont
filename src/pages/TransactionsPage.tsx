import React, { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { accountService } from '@/services/accountService'
import { LedgerActivity, transactionService } from '@/services/transactionService'
import { maskAccount } from '@/lib/bankingServices'
import type { Account } from '@/types'

type ActivityType = 'all' | 'deposits' | 'withdrawals'
const PAGE_SIZE = 10

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth()
  const [rows, setRows] = useState<LedgerActivity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountFilter,setAccountFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [activityType, setActivityType] = useState<ActivityType>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const [owned, activity] = await Promise.all([
          accountService.getAccounts(user.id).catch(() => [] as Account[]),
          transactionService.getTransactions(user.id),
        ])
        if (!active) return
        setAccounts(owned)
        setRows(activity)
      } catch {
        if (active) {
          setRows([])
          setError('We could not load your transactions. Please try again.')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [user])

  useEffect(() => {
    setPage(0)
    setOpenId(null)
  }, [query, status, activityType, startDate, endDate, accountFilter])

  const filtered = useMemo(() => rows.filter(row => {
    const matchesStatus = status === 'all' || row.status === status
    const haystack = `${row.description} ${row.category} ${row.entryType} ${row.referenceId}`.toLowerCase()
    const matchesQuery = haystack.includes(query.trim().toLowerCase())
    const created = row.createdAt ? new Date(row.createdAt).getTime() : 0
    const matchesStart = !startDate || created >= new Date(`${startDate}T00:00:00`).getTime()
    const matchesEnd = !endDate || created <= new Date(`${endDate}T23:59:59.999`).getTime()
    const matchesType = activityType === 'all' || (activityType === 'deposits' ? row.direction === 'credit' : row.direction === 'debit')
    return (accountFilter === "all" || row.accountId === accountFilter) && matchesStatus && matchesQuery && matchesType && matchesStart && matchesEnd
  }), [rows, query, status, activityType, startDate, endDate, accountFilter])


  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const filtersActive = Boolean(query.trim()) || status !== 'all' || activityType !== 'all' || Boolean(startDate || endDate)
  const emptyMessage = !rows.length && !filtersActive
    ? 'No transactions yet. Posted ledger activity will appear here.'
    : query.trim()
      ? 'No transactions match your search'
      : activityType === 'deposits'
        ? 'No deposits found'
        : activityType === 'withdrawals'
          ? 'No withdrawals found'
          : 'No transactions match your filters'

  return <PortalShell title="Transaction history" eyebrow="Account activity">
    <header className="private-hero px-6 py-7"><p className="private-overline text-white">Member ledger</p><h2 className="mt-2 font-serif text-3xl">Account activity</h2><p className="mt-2 text-sm text-blue-100">Review posted amounts, references and the balance after each entry.</p></header>
    <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_220px]">
      <label className="relative">
        <Search className="absolute left-3 top-3 size-4 text-slate-400" />
        <input aria-label="Search transactions" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search description, category or reference" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3" />
      </label>
      <select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3">
        <option value="all">All statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
        <option value="reversed">Reversed</option>
      </select>
      <select aria-label="Filter by type" value={activityType} onChange={event => setActivityType(event.target.value as ActivityType)} className="rounded-xl border border-slate-200 px-3">
        <option value="all">All activity</option>
        <option value="deposits">Deposits / Credits</option>
        <option value="withdrawals">Withdrawals / Debits</option>
      </select>
      <select aria-label="Filter by account" value={accountFilter} className="rounded-xl border p-2" onChange={e=>setAccountFilter(e.target.value)}><option value="all">All accounts</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.accountType} {maskAccount(a.accountNumber || "")}</option>)}</select>
      <label className="grid gap-1 text-xs font-semibold text-slate-500">From<input type="date" aria-label="Filter from date" value={startDate} onChange={event => setStartDate(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700" /></label>
      <label className="grid gap-1 text-xs font-semibold text-slate-500">To<input type="date" aria-label="Filter to date" value={endDate} onChange={event => setEndDate(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700" /></label>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? <p className="p-8 text-slate-500">Loading your activity...</p> : error ? null : !filtered.length ? <p className="p-8 text-slate-500">{emptyMessage}</p> : <>
        <div className="hidden grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid">
          <span>Date</span><span>Description</span><span>Category</span><span>Account</span><span>Status</span><span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-slate-100">
          {visible.map(row => {
            const money = (value: unknown) => value != null && Number.isFinite(Number(value)) && account?.currency && /^[A-Z]{3}$/.test(account.currency) ? new Intl.NumberFormat('en-US',{style:'currency',currency:account.currency}).format(Number(value)) : 'Unavailable'
            const posted = (value: string | null) => value == null ? '—' : money(value)
            const credit = row.direction === 'credit'
            const account = accounts.find(item => item.id === row.accountId)
            const open = openId === row.id
            const detailId = `transaction-${row.id}`
            return <div key={row.id} className="p-5">
              <div className="grid gap-2 lg:grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] lg:items-center">
                <p className="text-sm text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</p>
                <div>
                  <p className="font-semibold">{row.description || 'Ledger entry'}</p>
                  <p className="mt-1 text-xs text-slate-400">{row.referenceId || 'Reference unavailable'}</p>
                  <p className="mt-1 text-xs text-slate-400 lg:hidden">{row.category || 'General'} · {account?.accountNumber ? maskAccount(account.accountNumber) : account?.accountType || 'Account'}</p>
                </div>
                <p className="hidden text-sm capitalize text-slate-600 lg:block">{row.category || 'General'}</p>
                <p className="hidden text-sm text-slate-600 lg:block">{account?.accountNumber ? maskAccount(account.accountNumber) : account?.accountType || 'Account'}</p>
                <p className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${row.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : row.status === 'pending' ? 'bg-amber-50 text-amber-900' : ['failed','reversed'].includes(row.status || '') ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'}`}>{row.status || '—'}</p>
                <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                  <p className={`text-lg font-semibold ${credit ? 'text-emerald-700' : 'text-slate-900'}`}>{credit ? '+' : '−'}{money(row.displayAmount)}</p>
                  <button type="button" aria-expanded={open} aria-controls={detailId} onClick={() => setOpenId(open ? null : row.id)} className="text-xs font-semibold text-[#0504AA] lg:mt-1">
                    {open ? 'Hide details' : 'View details'}
                  </button>
                </div>
              </div>
              {open && <dl id={detailId} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Entry type</dt><dd className="mt-1 capitalize text-slate-700">{row.entryType || '—'}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Reference</dt><dd className="mt-1 text-slate-700">{row.referenceId || '—'}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Amount</dt><dd className="mt-1 text-slate-700">{posted(row.amount)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Debit</dt><dd className="mt-1 text-slate-700">{posted(row.debit)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Credit</dt><dd className="mt-1 text-slate-700">{posted(row.credit)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Balance after</dt><dd className="mt-1 text-slate-700">{posted(row.balanceAfter)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Posted</dt><dd className="mt-1 text-slate-700">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Status</dt><dd className="mt-1 capitalize text-slate-700">{row.status || '—'}</dd></div>
              </dl>}
            </div>
          })}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <p>Showing {safePage * PAGE_SIZE + 1}–{safePage * PAGE_SIZE + visible.length} of {filtered.length}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage(current => Math.max(0, current - 1))} disabled={safePage === 0} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-[#0504AA] disabled:opacity-40">Previous</button>
            <button type="button" onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))} disabled={safePage >= pageCount - 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-[#0504AA] disabled:opacity-40">Next</button>
          </div>
        </div>
      </>}
    </section>
  </PortalShell>
}

export default TransactionsPage
