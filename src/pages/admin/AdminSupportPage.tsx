import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import {
  AlertCircle,
  ArrowLeft,
  CheckCheck,
  ChevronDown,
  Clock3,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  RotateCw,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Status = 'open' | 'pending_member' | 'pending_support' | 'resolved' | 'closed'
type Priority = 'low' | 'normal' | 'high' | 'urgent'
type Conversation = {
  id: string
  user_id: string
  subject: string
  status: Status
  priority: Priority
  assigned_to: string | null
  last_message_at: string
  created_at: string
  unreadCount: number
  preview: string
  humanRequested: boolean
}
type TicketMessage = {
  id: string
  sender_id: string
  sender_role: 'member' | 'support' | 'system'
  body: string
  is_internal: boolean
  created_at: string
  delivery_status?: 'queued' | 'sending' | 'sent' | 'failed' | null
  delivery_error?: string | null
}
type FailedNotification = { id: string; event_type: string; attempt_count: number; last_error: string | null; updated_at: string }
type InboxResult = { conversations: Conversation[] }
type GmailStatus = {
  connection: { senderEmail: string; accountEmail: string; senderMatches: boolean; canReadInbox: boolean }
  sync: { lastSyncedAt: string | null; lastError: string | null; isRunning: boolean }
}
type SyncResult = { imported: number; ignored: number; nextPagePending: boolean; lastSyncedAt: string }
type DetailResult = {
  conversation: Conversation
  member: { name: string | null; email: string | null }
  messages: TicketMessage[]
  failedNotifications: FailedNotification[]
}

const statusLabel: Record<Status, string> = {
  open: 'Open',
  pending_member: 'Waiting on member',
  pending_support: 'Needs response',
  resolved: 'Resolved',
  closed: 'Closed',
}
const priorityLabel: Record<Priority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.access_token) throw new Error('Your session has expired. Sign in again.')
  return data.session.access_token
}

async function supportRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const result = await response.json() as T & { error?: string }
  if (!response.ok) throw new Error(result.error || 'Support request failed.')
  return result
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function getStatusStyle(status: Status): string {
  if (status === 'open' || status === 'pending_support') return 'bg-blue-50 text-[#0504AA]'
  if (status === 'resolved' || status === 'closed') return 'bg-emerald-50 text-emerald-700'
  return 'bg-amber-50 text-amber-800'
}

function getPriorityStyle(priority: Priority): string {
  if (priority === 'urgent') return 'bg-rose-50 text-rose-700'
  if (priority === 'high') return 'bg-amber-50 text-amber-800'
  return 'bg-slate-100 text-slate-600'
}

export const AdminSupportPage: React.FC = () => {
  const { user } = useAuth()
  const { role } = useAdminAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [reply, setReply] = useState('')
  const pendingReply = useRef<{ messageId: string; body: string } | null>(null)
  const [working, setWorking] = useState(false)
  const [testSending, setTestSending] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const { data: gmailStatus, mutate: refreshGmailStatus } = useSWR<GmailStatus>(
    ['support-gmail-status'],
    () => supportRequest<GmailStatus>('/api/support-gmail'),
    { refreshInterval: 60000, revalidateOnFocus: true },
  )
  const inboxKey = ['support-inbox', search, statusFilter, priorityFilter]
  const { data: inboxData, error: inboxError, isLoading: inboxLoading, mutate: refreshInbox } = useSWR<InboxResult>(
    inboxKey,
    () => supportRequest<InboxResult>(`/api/support?q=${encodeURIComponent(search)}&status=${statusFilter}&priority=${priorityFilter}`),
    { refreshInterval: 30000, revalidateOnFocus: true },
  )
  const { data: detail, error: detailError, isLoading: detailLoading, mutate: refreshDetail } = useSWR<DetailResult>(
    id ? ['support-ticket', id] : null,
    () => supportRequest<DetailResult>(`/api/support?id=${encodeURIComponent(id as string)}`),
    { refreshInterval: 30000, revalidateOnFocus: true },
  )

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('admin-support-inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => {
        void refreshInbox()
        if (id) void refreshDetail()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_conversations' }, () => {
        void refreshInbox()
        if (id) void refreshDetail()
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          void refreshInbox()
          if (id) void refreshDetail()
        }
      })
    return () => { void supabase.removeChannel(channel) }
  }, [user, id, refreshInbox, refreshDetail])

  const updateTicket = async (updates: { status?: Status; priority?: Priority }) => {
    if (!id) return
    setWorking(true)
    setActionError('')
    try {
      await supportRequest('/api/support', {
        method: 'PATCH',
        body: JSON.stringify({ conversationId: id, ...updates }),
      })
      await Promise.all([refreshInbox(), refreshDetail()])
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Ticket update failed.')
    } finally {
      setWorking(false)
    }
  }

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !reply.trim() || working) return
    const normalizedReply = reply.trim()
    const request = pendingReply.current?.body === normalizedReply ? pendingReply.current : { messageId: crypto.randomUUID(), body: normalizedReply }
    pendingReply.current = request
    setWorking(true)
    setActionError('')
    try {
      const result = await supportRequest<{ notification: { sent: number; failed: number } }>('/api/support', {
        method: 'POST',
        body: JSON.stringify({ action: 'reply', conversationId: id, message: request.body, messageId: request.messageId }),
      })
      pendingReply.current = null
      setReply('')
      if (result.notification?.failed) setActionError('Your reply is saved, but email delivery failed. It will retry automatically.')
      await Promise.all([refreshDetail(), refreshInbox()])
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Your reply could not be sent.')
    } finally {
      setWorking(false)
    }
  }

  const sendTestEmail = async () => {
    setTestSending(true)
    setTestMessage('')
    try {
      const result = await supportRequest<{ message: string }>('/api/support-test-email', { method: 'POST', body: '{}' })
      setTestMessage(result.message)
    } catch (error) {
      setTestMessage(error instanceof Error ? error.message : 'The Gmail connection test failed.')
    } finally {
      setTestSending(false)
    }
  }

  const syncMailbox = async () => {
    if (syncing || gmailStatus?.sync.isRunning) return
    setSyncing(true)
    setSyncMessage('')
    try {
      const { result } = await supportRequest<{ result: SyncResult }>('/api/support-gmail', { method: 'POST', body: '{}' })
      setSyncMessage(`${result.imported} new message${result.imported === 1 ? '' : 's'} imported${result.nextPagePending ? '. More messages remain; sync again to continue.' : '.'}`)
      await Promise.all([refreshGmailStatus(), refreshInbox(), id ? refreshDetail() : Promise.resolve(undefined)])
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : 'Gmail inbox sync failed.')
    } finally {
      setSyncing(false)
    }
  }

  const retryNotifications = async () => {
    if (!id || working) return
    setWorking(true)
    setActionError('')
    try {
      const result = await supportRequest<{ result: { sent: number; failed: number } }>('/api/support', {
        method: 'POST',
        body: JSON.stringify({ action: 'retry', conversationId: id }),
      })
      if (result.result.failed) setActionError('Email delivery is still failing. The notification will retry automatically.')
      await Promise.all([refreshDetail(), refreshInbox()])
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Notification retry failed.')
    } finally {
      setWorking(false)
    }
  }

  const conversations = inboxData?.conversations ?? []
  const ticket = detail?.conversation
  const isTicketVisibleOnMobile = Boolean(id)

  return (
    <AdminLayout staffName={user?.email?.split('@')[0] || 'Support team'} staffRole={role === 'SUPER_ADMIN' ? 'Super Admin' : 'Support operations'}>
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-[1500px] flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6e16]">Member care</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Support inbox</h1>
            <p className="mt-1 text-sm text-slate-500">Private member conversations, handled by your team.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <ShieldCheck size={14} className="text-emerald-700" aria-hidden="true" />
              Staff-only workspace
            </div>
            <button type="button" onClick={() => void syncMailbox()} disabled={syncing || gmailStatus?.sync.isRunning || !gmailStatus?.connection.senderMatches} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#0504AA]/20 bg-white px-3 text-xs font-semibold text-[#0504AA] hover:bg-blue-50 disabled:opacity-50">
              <RotateCw size={14} className={syncing || gmailStatus?.sync.isRunning ? 'animate-spin' : ''} aria-hidden="true" />
              {syncing || gmailStatus?.sync.isRunning ? 'Syncing inbox' : 'Sync inbox'}
            </button>
            <button type="button" onClick={() => void sendTestEmail()} disabled={testSending} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#0504AA]/20 bg-white px-3 text-xs font-semibold text-[#0504AA] hover:bg-blue-50 disabled:opacity-50">
              {testSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              Send test email
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
          <p>{gmailStatus?.connection.senderMatches === false ? 'Configured sender and authorized Gmail account do not match.' : gmailStatus?.connection.senderMatches ? `Gmail connected · ${gmailStatus.connection.accountEmail}` : 'Checking Gmail connection…'}</p>
          <p>{gmailStatus?.sync.lastSyncedAt ? `Last synced ${formatDate(gmailStatus.sync.lastSyncedAt)}` : 'Inbox has not been synced yet'}</p>
        </div>
        {(syncMessage || gmailStatus?.sync.lastError || testMessage) && <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{syncMessage || gmailStatus?.sync.lastError || testMessage}</p>}

        <div className="grid min-h-[620px] flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className={`${isTicketVisibleOnMobile ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col border-r border-slate-200`} aria-label="Support conversation inbox">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-900"><Inbox size={17} className="text-[#0504AA]" aria-hidden="true" /> Conversations</div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{conversations.length}</span>
              </div>
              <label className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-[#0504AA] focus-within:ring-2 focus-within:ring-blue-100">
                <Search size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Search tickets</span>
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search subject or ticket" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="relative">
                  <span className="sr-only">Filter by status</span>
                  <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-xs text-slate-600 outline-none focus:border-[#0504AA]">
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="pending_support">Needs response</option>
                    <option value="pending_member">Waiting on member</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-3 text-slate-400" aria-hidden="true" />
                </label>
                <label className="relative">
                  <span className="sr-only">Filter by priority</span>
                  <select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-xs text-slate-600 outline-none focus:border-[#0504AA]">
                    <option value="all">All priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-3 text-slate-400" aria-hidden="true" />
                </label>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {inboxLoading && <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Loading conversations</div>}
              {inboxError && <div role="alert" className="m-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{inboxError.message}</div>}
              {!inboxLoading && !inboxError && conversations.length === 0 && <div className="p-8 text-center"><MessageSquare className="mx-auto text-slate-300" size={25} aria-hidden="true" /><p className="mt-3 text-sm font-medium text-slate-700">No conversations found</p><p className="mt-1 text-xs text-slate-500">Try changing your search or filters.</p></div>}
              {conversations.map(conversation => (
                <button key={conversation.id} type="button" onClick={() => navigate(`/admin/support/${conversation.id}`)} className={`block w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${id === conversation.id ? 'bg-blue-50/60' : ''}`} aria-current={id === conversation.id ? 'page' : undefined}>
                  <div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-900">{conversation.subject}</p>{conversation.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0504AA] px-1.5 text-[10px] font-bold text-white">{conversation.unreadCount}</span>}</div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{conversation.preview || 'No messages yet'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyle(conversation.status)}`}>{statusLabel[conversation.status]}</span>{conversation.humanRequested && <span className="rounded-full bg-[#C9A227]/15 px-2 py-1 text-[10px] font-semibold text-[#715500]">Human requested</span>}<span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getPriorityStyle(conversation.priority)}`}>{priorityLabel[conversation.priority]}</span><time className="ml-auto text-[10px] text-slate-400">{formatDate(conversation.last_message_at)}</time></div>
                </button>
              ))}
            </div>
          </section>

          <section className={`${isTicketVisibleOnMobile ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col bg-[#fafbfd]`} aria-label="Selected support conversation">
            {!id && <div className="hidden flex-1 flex-col items-center justify-center p-8 text-center lg:flex"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0504AA]"><MessageSquare size={25} aria-hidden="true" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Select a conversation</h2><p className="mt-1 max-w-xs text-sm text-slate-500">Choose a member message from the inbox to review and respond.</p></div>}
            {id && <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => navigate('/admin/support')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Back to conversations"><ArrowLeft size={18} /></button><div className="min-w-0"><p className="truncate text-xs text-slate-500">Ticket {id.slice(0, 8).toUpperCase()} · {detail?.member.name || 'Member'}</p><h2 className="truncate text-base font-semibold text-slate-950">{ticket?.subject || 'Support conversation'}</h2></div></div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative"><span className="sr-only">Ticket status</span><select disabled={working || !ticket} value={ticket?.status || 'open'} onChange={event => void updateTicket({ status: event.target.value as Status })} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none disabled:opacity-60"><option value="open">Open</option><option value="pending_support">Needs response</option><option value="pending_member">Waiting on member</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-slate-400" aria-hidden="true" /></label>
                  <label className="relative"><span className="sr-only">Ticket priority</span><select disabled={working || !ticket} value={ticket?.priority || 'normal'} onChange={event => void updateTicket({ priority: event.target.value as Priority })} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none disabled:opacity-60"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-slate-400" aria-hidden="true" /></label>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white px-4 py-3 text-xs text-slate-500 sm:px-6"><div className="flex min-w-0 items-center gap-2"><Mail size={14} className="shrink-0" aria-hidden="true" /><span className="truncate">{detail?.member.email || 'Member email unavailable'}</span></div><button type="button" onClick={() => void retryNotifications()} disabled={working} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-[#0504AA] hover:bg-blue-50 disabled:opacity-50"><RotateCw size={13} aria-hidden="true" /> Retry email</button></div>
              {Boolean(detail?.failedNotifications.length) && <div role="status" className="border-b border-rose-200 bg-rose-50 px-4 py-3 sm:px-6"><p className="text-xs font-semibold text-rose-800">Email delivery needs attention</p><ul className="mt-1 space-y-1">{detail?.failedNotifications.map(notification => <li key={notification.id} className="text-xs text-rose-700">{notification.event_type === 'support_reply' ? 'Member reply' : notification.event_type === 'support_handoff' ? 'Human-support request' : 'Support notification'} failed after {notification.attempt_count} attempt{notification.attempt_count === 1 ? '' : 's'} · {formatDate(notification.updated_at)}</li>)}</ul></div>}
              <div className="min-h-[220px] flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                {detailLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={15} className="animate-spin" /> Loading ticket</div>}
                {detailError && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{detailError.message}</div>}
                {detail?.messages.filter(message => !message.is_internal).map(message => {
                  const isStaff = message.sender_role !== 'member'
                  return <div key={message.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}><article className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${isStaff ? 'rounded-br-md bg-[#0504AA] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}><div className={`mb-1.5 flex items-center gap-2 text-[11px] ${isStaff ? 'text-blue-100' : 'text-slate-400'}`}><span className="font-semibold">{isStaff ? 'Evermont Support' : (detail.member.name || 'Member')}</span><time>{formatDate(message.created_at)}</time></div><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p></article></div>
                })}
                {detail && detail.messages.filter(message => !message.is_internal).length === 0 && <p className="text-sm text-slate-500">No messages have been sent in this ticket.</p>}
              </div>
              <div className="border-t border-slate-200 bg-white p-4 sm:px-6">
                {actionError && <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800"><AlertCircle size={14} className="mt-0.5 shrink-0" />{actionError}</div>}
                <form onSubmit={sendReply}>
                  <label htmlFor="support-reply" className="mb-2 block text-xs font-semibold text-slate-700">Reply to member</label>
                  <textarea id="support-reply" value={reply} onChange={event => setReply(event.target.value)} maxLength={4000} rows={3} placeholder="Write a clear, helpful response…" className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-[#0504AA] focus:ring-2 focus:ring-blue-100" />
                  <div className="mt-2 flex items-center justify-between gap-3"><p className="text-[11px] text-slate-400">Never request a password, PIN, CVV, or one-time code.</p><button type="submit" disabled={working || !reply.trim()} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#0504AA] px-4 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">{working ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send reply</button></div>
                </form>
              </div>
            </>}
          </section>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500"><CheckCheck size={13} className="text-emerald-700" aria-hidden="true" /><span>Conversation records are stored securely in the member support system.</span><span className="ml-auto hidden items-center gap-1 sm:inline-flex"><Clock3 size={12} /> Inbox refreshes every 30 seconds</span></div>
      </div>
    </AdminLayout>
  )
}
