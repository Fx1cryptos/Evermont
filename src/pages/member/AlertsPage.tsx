import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/services/notificationService'
import { ROUTES } from '@/constants/routes'
import type { Notification } from '@/types'

export const AlertsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    notificationService.getNotifications(user.id).then((data) => {
      if (active) setRows(data)
    }).catch(() => {
      if (active) setError('We could not load alerts.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-600">Loading alerts…</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>

  return (
    <PortalShell title="Alerts & notifications" eyebrow="Account messages">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!error && rows.length === 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center">
          <h2 className="text-lg font-semibold text-[#0504AA]">No alerts returned</h2>
          <p className="mt-2 text-sm text-slate-600">When the database has a notification for this account, it will appear here.</p>
        </section>
      )}
      {rows.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3">
              <p className="text-sm font-semibold text-[#101533]">{row.title || 'Notification'}</p>
              <p className="mt-1 text-sm text-slate-600">{row.message}</p>
              <p className="mt-1 text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Date not returned'}</p>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  )
}
