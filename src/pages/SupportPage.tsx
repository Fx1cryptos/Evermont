import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { MessageCircle, Plus } from 'lucide-react'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { supportService, type SupportStatus } from '@/services/supportService'

const labels: Record<SupportStatus, string> = {
  open: 'Open',
  pending_member: 'Waiting on you',
  pending_support: 'Awaiting Human Support',
  resolved: 'Resolved',
  closed: 'Closed',
}
export const SupportPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [creating, setCreating] = useState(false)
  const [params] = useSearchParams()
  const [showForm, setShowForm] = useState(params.get("chat") === "1")
  const [error, setError] = useState('')
  const inbox = useSWR(
    user ? ['support-list', user.id] : null,
    async ([, owner]) => {
      const result = await supportService.listConversations(owner)
      if (result.error) throw Error('We could not load your conversations.')
      return result.data
    },
    { refreshInterval: 15000 },
  )
  const rows = inbox.data || []
  const matches = rows.filter((row) => row.subject.toLowerCase().includes(search.trim().toLowerCase()))
  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    if (creating || !user || !subject.trim() || !body.trim()) return
    setCreating(true)
    setError('')
    const result = await supportService
      .createConversation(user.id, subject, body)
      .catch(() => ({ data: null, error: true }))
      .finally(() => setCreating(false))
    if (result.data && result.error) {
      navigate(`${ROUTES.SUPPORT}/${result.data.id}`, { state: { firstMessageFailed: true, draft: body } })
      return
    }
    if (result.error || !result.data) {
      setError('We could not start your conversation.')
      return
    }
    navigate(`${ROUTES.SUPPORT}/${result.data.id}`, {state:{received:true}})
  }
  const inboxContent = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#07142D] p-6 text-white">
        <p className="max-w-xl text-blue-100">
          <strong className="mb-2 block text-2xl font-semibold text-white">Your private inbox</strong>Ask a
          question, follow a request, or reach your member support team.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0504AA] px-4 py-3 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="size-4" />
          Chat with EVERMONT Support
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={create}
          className="mt-6 rounded-2xl border border-[#C9A227]/50 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-[#0504AA]">Start a conversation</h2>
          <div className="mt-4 grid gap-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={120}
              placeholder="Subject"
              aria-label="Subject"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0504AA]"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={4000}
              placeholder="How can we help?"
              aria-label="First message"
              rows={5}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0504AA]"
            />
            <button
              disabled={creating}
              className="w-fit rounded-xl bg-[#0504AA] px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {creating ? 'Starting...' : 'Send to Support'}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <section className="mt-7 grid gap-3">
        <label className="font-semibold" htmlFor="thread-search">
          Conversations
        </label>
        <input
          id="thread-search"
          type="search"
          className="rounded-xl border bg-white px-4 py-3"
          placeholder="Search by subject"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {inbox.error ? (
          <button className="p-4 text-left" onClick={() => void inbox.mutate()}>
            We could not load your conversations. Retry
          </button>
        ) : inbox.isLoading ? (
          <p>Loading conversations…</p>
        ) : rows.length && !matches.length ? (
          <p>No conversations match your search.</p>
        ) : matches.length ? (
          matches.map((row) => (
            <Link
              key={row.id}
              to={`${ROUTES.SUPPORT}/${row.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#C9A227]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-[#101533]">{row.subject}</h2>
                  <p className="line-clamp-1 break-all text-sm text-slate-600">
                    {row.support_messages?.[0]?.body}
                  </p>
                  {Boolean(row.unread?.length) && (
                    <small className="font-bold text-[#0504AA]">Unread reply</small>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {new Date(row.updated_at).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-[#0504AA]/10 px-3 py-1 text-xs font-semibold text-[#0504AA]">
                  {labels[row.status] || 'Open'}
                </span>
              </div>
            </Link>
          ))
        ) : (
          !error && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <MessageCircle className="mx-auto size-9 text-[#C9A227]" />
              <h2 className="mt-4 text-xl font-semibold text-[#0504AA]">Your support inbox is ready</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Start a private conversation and our support team will help you with your member experience.
              </p>
            </div>
          )
        )}
      </section>
    </>
  )
  return embedded ? inboxContent : <PortalShell title="Messaging center" eyebrow="Member services">{inboxContent}</PortalShell>
}
export default SupportPage
