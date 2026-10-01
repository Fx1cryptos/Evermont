import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Calendar, Target } from 'lucide-react'
import { UpcomingPayment, SavingsGoal, Holding, PerformancePoint, Transaction } from '@/types'
import { formatCurrency } from '@/utils/formatting'
import { merchantInfo } from '@/utils/merchant'
import { LineChart } from '@/components/charts/SimpleCharts'

/* ---------- Stat card (balance strip) ---------- */

export const StatCard: React.FC<{
  label: string
  value: string
  sub?: string
  to?: string
  tone?: 'default' | 'alert'
}> = ({ label, value, sub, to, tone = 'default' }) => {
  const body = (
    <div
      className={`h-full bg-white rounded-xl border border-evermont-border shadow-sm p-4 sm:p-5 ${
        to ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-evermont-blue/40 transition-all duration-200' : ''
      }`}
    >
      <p className="text-xs font-medium text-evermont-muted truncate">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-1.5 tabular-nums ${tone === 'alert' ? 'text-red-600' : 'text-evermont-dark'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-evermont-muted mt-1 truncate">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

/* ---------- Cash flow summary ---------- */

const last30 = (t: Transaction): boolean =>
  Date.now() - new Date(t.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000

export const CashFlowCard: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const recent = transactions.filter(last30)
  const income = recent.filter((t) => t.type === 'credit').reduce((s, t) => s + parseFloat(t.amount), 0)
  const spending = recent.filter((t) => t.type === 'debit').reduce((s, t) => s + parseFloat(t.amount), 0)
  const net = income - spending
  const max = Math.max(income, spending, 1)

  return (
    <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-evermont-dark">Monthly Cash Flow</h3>
        <span className="text-[10px] font-semibold uppercase text-evermont-muted">Last 30 days</span>
      </div>
      {[
        { label: 'Income', value: income, Icon: ArrowDownLeft, color: 'bg-green-600' },
        { label: 'Spending', value: spending, Icon: ArrowUpRight, color: 'bg-red-500' },
      ].map((row) => (
        <div key={row.label} className="mb-3 last:mb-0">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs text-evermont-muted">
              <row.Icon className="h-3.5 w-3.5" /> {row.label}
            </span>
            <span className="text-sm font-bold text-evermont-dark tabular-nums">{formatCurrency(row.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full ${row.color}`} style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className="mt-4 pt-4 border-t border-evermont-border flex items-center justify-between">
        <span className="text-xs font-medium text-evermont-muted">Net cash flow</span>
        <span className={`text-base font-bold tabular-nums ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {net >= 0 ? '+' : '−'}
          {formatCurrency(Math.abs(net))}
        </span>
      </div>
    </div>
  )
}

/* ---------- Upcoming payments ---------- */

export const UpcomingPaymentsCard: React.FC<{ payments: UpcomingPayment[] }> = ({ payments }) => (
  <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-evermont-dark">Upcoming Payments</h3>
      <Calendar className="h-4 w-4 text-evermont-muted" />
    </div>
    {payments.length === 0 ? (
      <p className="text-sm text-evermont-muted py-4 text-center">No upcoming payments scheduled.</p>
    ) : (
      <div className="space-y-1">
        {payments.map((p) => {
          const days = Math.ceil((new Date(p.dueDate).getTime() - Date.now()) / 86400000)
          const dueIn = days <= 1 ? 'Due soon' : `in ${days} days`
          const info = merchantInfo(p.name)
          return (
            <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-evermont-border last:border-0">
              <span className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${info.chip}`}>
                <info.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-evermont-dark truncate">{p.name}</p>
                <p className="text-[11px] text-evermont-muted">
                  Due {new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {dueIn}
                </p>
              </div>
              <span className="text-sm font-bold text-evermont-dark tabular-nums">{formatCurrency(p.amount)}</span>
            </div>
          )
        })}
      </div>
    )}
  </div>
)

/* ---------- Savings goals ---------- */

export const SavingsGoalsCard: React.FC<{ goals: SavingsGoal[] }> = ({ goals }) => (
  <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-evermont-dark">Savings Progress</h3>
      <Target className="h-4 w-4 text-evermont-muted" />
    </div>
    <div className="space-y-4">
      {goals.map((goal) => {
        const pct = Math.min((goal.saved / goal.target) * 100, 100)
        return (
          <div key={goal.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-evermont-dark">{goal.name}</span>
              <span className="text-xs text-evermont-muted tabular-nums">
                {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-evermont-blue to-blue-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] font-semibold text-evermont-blue">{Math.round(pct)}% funded</p>
          </div>
        )
      })}
    </div>
  </div>
)

/* ---------- Investment performance ---------- */

export const InvestmentPerformanceCard: React.FC<{
  performance: PerformancePoint[]
  holdings: Holding[]
  accountLabel: string
}> = ({ performance, holdings, accountLabel }) => {
  const change = performance.length > 1
    ? ((performance[performance.length - 1].value - performance[0].value) / performance[0].value) * 100
    : 0

  return (
    <div className="bg-white rounded-xl border border-evermont-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-evermont-dark">Investment Performance</h3>
          <p className="text-[11px] text-evermont-muted mt-0.5">{accountLabel} • trailing 12 months</p>
        </div>
        <span
          className={`text-xs font-bold rounded-full px-2.5 py-1 ${
            change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {change >= 0 ? '+' : '−'}
          {Math.abs(change).toFixed(1)}% 1Y
        </span>
      </div>
      <LineChart
        data={performance}
        height={140}
        formatValue={(v) => formatCurrency(v)}
      />
      {holdings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-evermont-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-evermont-muted mb-2">Top holdings</p>
          <div className="space-y-1.5">
            {holdings.slice(0, 4).map((h) => (
              <div key={h.symbol} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-evermont-dark w-14">{h.symbol}</span>
                <span className="text-evermont-muted flex-1 truncate px-2">{h.name}</span>
                <span className={`font-semibold tabular-nums ${h.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {h.changePct >= 0 ? '+' : '−'}
                  {Math.abs(h.changePct).toFixed(1)}%
                </span>
                <span className="font-bold text-evermont-dark tabular-nums w-20 text-right">
                  {formatCurrency(h.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
