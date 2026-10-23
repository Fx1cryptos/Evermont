import React, { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Row = {
  id: string
  account_id: string
  created_at: string
  description: string
  category: string
  debit: number | string | null
  credit: number | string | null
  amount: number | string
  status: string
  reference_id?: string
  balance_after: number | string
}

type AccountLabel = { id: string; accountType: string; accountNumber: string | null }
type ActivityType = 'all' | 'deposits' | 'withdrawals'

const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const debitCategories = new Set(['withdrawal', 'fee', 'transfer-out', 'ach'])
const creditCategories = new Set(['deposit', 'interest', 'opening_balance', 'transfer'])

const isCredit = (row: Row) => {
  const credit = Number(row.credit || 0)
  const debit = Number(row.debit || 0)
  if (credit > 0 && debit <= 0) return true
  if (debit > 0 && credit <= 0) return false
  const category = (row.category || '').toLowerCase()
  if (debitCategories.has(category)) return false
  if (creditCategories.has(category)) return true
  return credit >= debit
}

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [accounts, setAccounts] = useState<AccountLabel[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [activityType, setActivityType] = useState<ActivityType>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    void (async () => {
      const { data: accountRows, error: accountError } = await supabase.from('accounts').select('id,account_type,account_number').eq('user_id', user.id).order('created_at', { ascending: false })
      if (!active) return
      if (accountError) {
        setError('We could not load your accounts. Please try again.')
        setLoading(false)
        return
      }
      const owned = (accountRows || []).map(row => ({ id: row.id, accountType: row.account_type, accountNumber: row.account_number }))
      setAccounts(owned)
      const ids = owned.map(row => row.id)
      if (!ids.length) {
        setLoading(false)
        return
      }
      const { data, error: ledgerError } = await supabase.from('ledger_entries').select('id,account_id,created_at,description,category,debit,credit,amount,status,reference_id,balance_after').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false })
      if (!active) return
      if (ledgerError) setError('We could not load your transactions. Please try again.')
      else setRows((data || []) as Row[])
      setLoading(false)
    })()
    return () => { active = false }
  }, [user])

  const filtered = useMemo(() => rows.filter(row => {
    const matchesStatus = status === 'all' || row.status === status
    const haystack = `${row.description} ${row.category} ${row.reference_id || ''}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const credit = isCredit(row)
    const matchesType = activityType === 'all' || (activityType === 'deposits' ? credit : !credit)
    return matchesStatus && matchesQuery && matchesType
  }), [rows, query, status, activityType])

  const emptyMessage = query
    ? 'No transactions match your search'
    : activityType === 'deposits'
      ? 'No deposits found'
      : activityType === 'withdrawals'
        ? 'No withdrawals found'
        : 'No transactions match your search'

  return <PortalShell title="Transaction history" eyebrow="Account activity">
    <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_220px]">
      <label className="relative">
        <Search className="absolute left-3 top-3 size-4 text-slate-400" />
        <input aria-label="Search transactions" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search description, category or reference" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3" />
      </label>
      <select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3">
        <option value="all">All statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>
      <select aria-label="Filter by type" value={activityType} onChange={event => setActivityType(event.target.value as ActivityType)} className="rounded-xl border border-slate-200 px-3">
        <option value="all">All activity</option>
        <option value="deposits">Deposits / Credits</option>
        <option value="withdrawals">Withdrawals / Debits</option>
      </select>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? <p className="p-8 text-slate-500">Loading your activity...</p> : !filtered.length ? <p className="p-8 text-slate-500">{emptyMessage}</p> : <>
        <div className="hidden grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:grid">
          <span>Date</span><span>Description</span><span>Category</span><span>Account</span><span>Status</span><span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map(row => {
            const credit = isCredit(row)
            const account = accounts.find(item => item.id === row.account_id)
            return <div key={row.id} className="grid gap-2 p-5 lg:grid-cols-[140px_1.4fr_.8fr_.8fr_.7fr_140px] lg:items-center">
              <p className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString()}</p>
              <div>
                <p className="font-semibold">{row.description}</p>
                <p className="mt-1 text-xs text-slate-400 lg:hidden">{row.category} · {account?.accountNumber || account?.accountType || 'Account'} · {row.reference_id || 'Reference unavailable'}</p>
              </div>
              <p className="hidden text-sm capitalize text-slate-600 lg:block">{row.category || 'General'}</p>
              <p className="hidden text-sm text-slate-600 lg:block">{account?.accountNumber || account?.accountType || 'Account'}</p>
              <p className="text-xs font-semibold capitalize text-slate-500 lg:text-sm">{row.status}</p>
              <p className={`text-lg font-semibold lg:text-right ${credit ? 'text-emerald-700' : 'text-slate-900'}`}>{credit ? '+' : '−'}{money(row.credit || row.debit || row.amount)}</p>
            </div>
          })}
        </div>
      </>}
    </section>
  </PortalShell>
}

export default TransactionsPage
