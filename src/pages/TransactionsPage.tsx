import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { accountService } from '@/services/accountService'
import { supabase } from '@/lib/supabase'
import { PortalShell } from '@/components/member/PortalShell'
import type { Account } from '@/types'

type LedgerRow = { id: string; account_id: string; created_at: string; description: string; category: string; debit: string | number | null; credit: string | number | null; amount: string | number; status: 'pending' | 'completed' | 'failed' | 'reversed'; balance_after: string | number; reference_id?: string }
const money = (value: string | number | null) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export const TransactionsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState<LedgerRow[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'credit' | 'debit'>('all')
  const [status, setStatus] = useState<'all' | LedgerRow['status']>('all')
  const [selected, setSelected] = useState<LedgerRow | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const accountData = await accountService.getAccounts(user.id)
        const accountIds = accountData.map((account) => account.id)
        const result = accountIds.length ? await supabase.from('ledger_entries').select('id, created_at, description, category, debit, credit, amount, status, balance_after, reference_id').eq('member_id', user.id).in('account_id', accountIds).order('created_at', { ascending: false }) : { data: [], error: null }
        if (result.error) throw result.error
        if (active) { setAccounts(accountData); setRows((result.data || []) as LedgerRow[]) }
      } catch { if (active) setError('We could not load your transaction history. Please refresh and try again.') } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [user])

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesQuery = !query || `${row.description} ${row.category}`.toLowerCase().includes(query.toLowerCase())
    const isCredit = Boolean(row.credit)
    return matchesQuery && (type === 'all' || (type === 'credit' ? isCredit : !isCredit)) && (status === 'all' || row.status === status)
  }), [rows, query, type, status])

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading transaction history...</main>
  if (!user) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Please sign in to view transaction history.</main>

  return <PortalShell title="Transaction History"><section className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Financial activity</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Transaction History</h2><p className="mt-2 text-sm text-slate-500">Review the ledger activity associated with your Evermont accounts.</p></div><p className="text-sm font-semibold text-slate-500">{filtered.length} result{filtered.length === 1 ? '' : 's'}</p></div>
    <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><span className="sr-only">Search transactions</span><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search descriptions or categories" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0504AA] focus:ring-2 focus:ring-[#0504AA]/10" /></label><div className="flex gap-2"><select aria-label="Filter transaction type" value={type} onChange={(event) => setType(event.target.value as typeof type)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">All types</option><option value="credit">Credits</option><option value="debit">Debits</option></select><select aria-label="Filter transaction status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="reversed">Reversed</option></select></div></div></div>
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[1fr_150px_130px_120px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid"><span>Description</span><span>Date</span><span>Status</span><span className="text-right">Amount</span></div>{filtered.length ? filtered.map((row) => { const credit = Boolean(row.credit); return <button type="button" key={row.id} onClick={() => setSelected(row)} className="grid w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-[#f8f9ff] md:grid-cols-[1fr_150px_130px_120px] md:items-center md:gap-4"><span className="flex min-w-0 items-center gap-3"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span><span className="min-w-0"><span className="block truncate font-semibold text-[#101533]">{row.description}</span><span className="block text-xs capitalize text-slate-500">{row.category} · {accounts.find((account) => account.id === row.account_id)?.accountNumber || 'Account activity'}</span></span></span><span className="text-sm text-slate-500">{date(row.created_at)}</span><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{row.status}</span><span className={`text-right font-semibold ${credit ? 'text-emerald-700' : 'text-[#101533]'}`}>{credit ? '+' : '-'}{money(row.credit || row.debit || row.amount)}</span></button> }) : <div className="px-5 py-14 text-center"><SlidersHorizontal className="mx-auto size-7 text-slate-300" /><p className="mt-3 font-semibold">No matching transactions</p><p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p></div>}</div>
    <p className="mt-4 text-xs text-slate-500">Transaction status and amounts are displayed from existing ledger records. Pending, failed, and reversed entries are not presented as completed payments.</p>
    {selected && <div role="dialog" aria-modal="true" aria-label="Transaction details" className="fixed inset-0 z-50 flex items-end justify-center bg-[#101533]/40 p-4 sm:items-center"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">Transaction detail</p><h3 className="mt-2 text-xl font-semibold">{selected.description}</h3></div><button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-[#0504AA]">Close</button></div><dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Amount</dt><dd className="font-semibold">{money(selected.credit || selected.debit || selected.amount)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Date</dt><dd className="text-right font-medium">{date(selected.created_at)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="capitalize font-medium">{selected.status}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Reference</dt><dd className="max-w-[12rem] break-all text-right font-medium">{selected.reference_id || 'Not supplied'}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Balance after</dt><dd className="font-medium">{money(selected.balance_after)}</dd></div></dl></div></div>}
  </section></PortalShell>
}

export default TransactionsPage
