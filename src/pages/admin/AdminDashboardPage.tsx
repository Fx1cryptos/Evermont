import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { MetricCard } from '@/components/admin/MetricCard'
import { adminDashboardService } from '@/services/adminDashboardService'
import { DashboardMetrics } from '@/types/admin'

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminDashboardService.getMetrics()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to load admin metrics', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <AdminLayout staffName="Administrator" staffRole="ADMIN">
        <div className="p-6">Loading dashboard...</div>
      </AdminLayout>
    )
  }

  if (!metrics) {
    return (
      <AdminLayout staffName="Administrator" staffRole="ADMIN">
        <div className="p-6">Unable to load dashboard metrics.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout staffName="Administrator" staffRole="ADMIN">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm font-semibold text-red-600">
              SIMULATED DATA NOTICE: Prototype financial figures shown here are demo-only and not live customer records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Total registered members" value={metrics.members.total} />
          <MetricCard title="Total accounts" value={metrics.accounts.total} />
          <MetricCard title="Checking balances" value={metrics.accounts.checking} />
          <MetricCard title="Savings balances" value={metrics.accounts.savings} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-lg border border-evermont-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Account balances by type</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Checking</span>
                <strong>${metrics.accounts.checking.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Savings</span>
                <strong>${metrics.accounts.savings.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Linked external</span>
                <strong>${metrics.accounts.linkedExternal.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-evermont-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Recent transactions</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Today</span>
                <strong>{metrics.transactions.today}</strong>
              </div>
              <div className="flex justify-between">
                <span>Completed</span>
                <strong>{metrics.transactions.completed}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <strong>{metrics.transactions.pending}</strong>
              </div>
              <div className="flex justify-between">
                <span>Flagged</span>
                <strong>{metrics.transactions.flagged}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-lg border border-evermont-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Pending items</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Document review: {metrics.transactions.pending}</li>
              <li>Member verification queue: {metrics.members.pending}</li>
              <li>Security alerts: {metrics.security.alerts}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-evermont-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Account status</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Active: {metrics.members.active}</li>
              <li>Suspended: {metrics.members.suspended}</li>
              <li>Security critical events: {metrics.security.criticalEvents}</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-evermont-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Searchable member directory</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by member name or email"
              className="w-full rounded border border-evermont-border px-3 py-2"
            />
          </div>
          <div className="text-sm text-gray-500">Search is available for prototype member review.</div>
        </div>
      </div>
    </AdminLayout>
  )
}
