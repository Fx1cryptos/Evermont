import React, { useEffect, useState } from 'react'
import { Bell, CheckCheck, Circle, Link as LinkIcon } from 'lucide-react'
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
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    notificationService.getNotifications(user.id).then(data => { if (active) setRows(data) }).catch(() => { if (active) setError('We could not load alerts.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  const markRead = async (notification: Notification) => {
    if (!user || notification.read || updating) return
    setUpdating(true)
    setError('')
    try {
      await notificationService.markAsRead(notification.id, user.id)
      setRows(current => current.map(item => item.id === notification.id ? { ...item, read: true, readAt: new Date().toISOString() } : item))
    } catch { setError('This alert could not be marked as read. Please try again.') } finally { setUpdating(false) }
  }

  const markAllRead = async () => {
    if (!user || !rows.some(row => !row.read) || updating) return
    setUpdating(true)
    setError('')
    try {
      await notificationService.markAllAsRead(user.id)
      const readAt = new Date().toISOString()
      setRows(current => current.map(item => ({ ...item, read: true, readAt: item.readAt || readAt })))
    } catch { setError('Alerts could not be updated. Please try again.') } finally { setUpdating(false) }
  }

  if (authLoading || (user && loading)) return <main className="flex min-h-screen items-center justify-center bg-[#F5F7FB] text-sm text-slate-600">Loading alerts…</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>
  const unreadCount = rows.filter(row => !row.read).length

  return <PortalShell title="Alerts & notifications" eyebrow="Account messages">
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl bg-[#07143D] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><span className="rounded-xl bg-white/10 p-3 text-[#C8A43D]"><Bell className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#C8A43D]">Member inbox</p><h2 className="mt-1 text-xl font-semibold">Your account updates</h2><p className="mt-1 text-sm text-white/75">{unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}</p></div></div><button type="button" onClick={() => void markAllRead()} disabled={!unreadCount || updating} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"><CheckCheck className="size-4" aria-hidden="true" />Mark all as read</button></section>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!error && rows.length === 0 && <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"><Bell className="mx-auto size-7 text-[#C8A43D]" aria-hidden="true" /><h2 className="mt-3 text-lg font-semibold text-[#080A9F]">No alerts returned</h2><p className="mt-2 text-sm text-slate-600">When the database has a notification for this account, it will appear here.</p></section>}
      {rows.length > 0 && <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">{rows.map(row => <li key={row.id} className={`flex items-start gap-3 px-4 py-4 sm:px-5 ${row.read ? '' : 'bg-[#080A9F]/[.025]'}`}><span className={`mt-1 shrink-0 ${row.read ? 'text-slate-300' : 'text-[#C8A43D]'}`} aria-label={row.read ? 'Read' : 'Unread'}><Circle className="size-2.5 fill-current" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#172033]">{row.title || 'Notification'}</p><p className="mt-1 text-sm leading-6 text-slate-600">{row.message}</p><p className="mt-2 text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Date not returned'} · {row.read ? 'Read' : 'Unread'}</p>{row.actionUrl && <Link to={row.actionUrl} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#080A9F]"><LinkIcon className="size-3" aria-hidden="true" />View details</Link>}</div>{!row.read && <button type="button" onClick={() => void markRead(row)} disabled={updating} className="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold text-[#080A9F] hover:bg-[#080A9F]/5 disabled:opacity-50">Mark read</button>}</li>)}</ul>}
    </div>
  </PortalShell>
}
