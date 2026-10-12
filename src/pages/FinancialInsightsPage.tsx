import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, TrendingUp } from 'lucide-react'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Period = 30 | 90

type Row = {
  id: string
  created_at: string
  description: string
  category: string | null
  debit: number | string | null
  credit: number | string | null
  amount: number | string | null
  status: string
}

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const completedStatuses = new Set(['completed', 'posted', 'settled'])

export const FinancialInsightsPage: React.FC = () => {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>(30)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      setLoading(true)
      const start = new Date()
      start.setDate(start.getDate() - period)
      const { data: accounts, error: accountsError } = await supabase.from('accounts').select('id').eq('user_id', user.id)
      if (accountsError) throw accountsError
      const ids = (accounts || []).map(account => account.id)
      if (!ids.length) { if (active) { setRows([]); setLoading(false) }; return }
      const { data, error: ledgerError } = await supabase.from('ledger_entries').select('id,created_at,description,category,debit,credit,amount,status').eq('member_id', user.id).in('account_id', ids).gte('created_at', start.toISOString()).order('created_at', { ascending: false })
      if (ledgerError) throw ledgerError
      if (active) { setRows((data || []) as Row[]); setError(''); setLoading(false) }
    }
    void load().catch(() => { if (active) { setError('We could not load insights from your authorized activity.'); setLoading(false) } })
    return () => { active = false }
  }, [period, user])

  const completed = useMemo(() => rows.filter(row => completedStatuses.has(row.status.toLowerCase())), [rows])
  const incoming = completed.reduce((sum, row) => sum + Number(row.credit || 0), 0)
  const outgoing = completed.reduce((sum, row) => sum + Number(row.debit || 0), 0)
  const categories = useMemo(() => completed.reduce<Record<string, number>>((result, row) => { const category = row.category?.trim(); if (category) result[category] = (result[category] || 0) + Number(row.debit || 0); return result }, {}), [completed])
  const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return <PortalShell title="Financial insights" eyebrow="Your money, clearly understood">
    <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="size-4 text-[#0504AA]" />Completed activity only</div><label className="flex items-center gap-3 text-sm font-semibold">Period<select value={period} onChange={event => setPeriod(Number(event.target.value) as Period)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label></div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-slate-500">Loading authorized activity...</p> : <>
      <section className="mt-6 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ArrowDownLeft className="size-5 text-emerald-700" /><p className="mt-5 text-sm text-slate-500">Total incoming</p><p className="mt-1 text-2xl font-semibold">{money(incoming)}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ArrowUpRight className="size-5 text-[#0504AA]" /><p className="mt-5 text-sm text-slate-500">Total outgoing</p><p className="mt-1 text-2xl font-semibold">{money(outgoing)}</p></article><article className="rounded-2xl border border-[#C9A227]/40 bg-[#0504AA] p-5 text-white shadow-sm"><TrendingUp className="size-5 text-[#C9A227]" /><p className="mt-5 text-sm text-blue-100">Net transaction flow</p><p className="mt-1 text-2xl font-semibold">{money(incoming - outgoing)}</p></article></section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><BarChart3 className="size-5 text-[#0504AA]" /><div><h2 className="font-semibold">Spending breakdown</h2><p className="text-sm text-slate-500">Based only on categorized completed debits.</p></div></div>{topCategories.length ? <div className="mt-5 space-y-4">{topCategories.map(([category, value]) => <div key={category}><div className="flex justify-between text-sm"><span className="font-medium capitalize">{category}</span><span className="text-slate-500">{money(value)}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#C9A227]" style={{ width: `${Math.min(100, outgoing ? value / outgoing * 100 : 0)}%` }} /></div></div>)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No categorized completed debits were found for this period.</p>}</section>
      {!completed.length && <p className="mt-5 text-sm text-slate-500">No completed transactions were found for the selected period. Pending, failed, and reversed entries are excluded.</p>}
    </>}
  </PortalShell>
}

export default FinancialInsightsPage
