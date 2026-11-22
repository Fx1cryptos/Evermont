import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Headphones } from 'lucide-react'
import useSWR from 'swr'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { supabase } from '@/lib/supabase'
import { memberAction, supportService } from '@/services/supportService'

function Thread({ owner, id }: { owner: string; id: string }) {
  const location = useLocation()
  const [draft, setDraft] = useState<string>(
    typeof location.state?.draft === 'string' ? location.state.draft : '',
  )
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(
    location.state?.firstMessageFailed
      ? 'Conversation created. Your first message was not saved; please send it here.'
      : '',
  )
  const { data, error, mutate } = useSWR(
    ['member-thread', owner, id],
    async () => {
      const conversation = await supportService.getConversation(owner, id)
      if (!conversation.data || conversation.error) throw Error('This conversation is unavailable.')
      const messages = await supportService.listMessages(owner, id)
      if (messages.error) throw Error('Messages could not be loaded.')
      return { conversation: conversation.data, messages: messages.data }
    },
    { refreshInterval: 15000 },
  )
  useEffect(() => {
    const channel = supabase
      .channel('thread-' + id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: 'conversation_id=eq.' + id },
        () => {
          void mutate()
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [id, mutate])
  useEffect(() => {
    if (!data) return
    const unread = data.messages
      .filter((m) => m.sender_role !== 'member' && !m.read_by_member)
      .map((m) => m.id)
    for (let i = 0; i < unread.length; i += 100) void memberAction(id, 'read', unread.slice(i, i + 100))
  }, [id, data])
  const closed = ['resolved', 'closed'].includes(data?.conversation.status || '')
  async function send(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || busy || closed) return
    setBusy(true)
    try {
      const result = await supportService.sendMessage(owner, id, draft)
      if (result.error) throw result.error
      setDraft('')
      setNotice('Message saved.')
      await mutate()
    } catch {
      setNotice('Message could not be sent. Your draft is still here.')
    } finally {
      setBusy(false)
    }
  }
  async function handoff() {
    setBusy(true)
    const ok = await memberAction(id, 'handoff')
    setNotice(
      ok
        ? 'Your request for a human agent is saved.'
        : 'Handoff could not be confirmed. You can still send a message to the team.',
    )
    setBusy(false)
  }
  return (
    <PortalShell title={data?.conversation.subject || 'Conversation'} eyebrow="Private correspondence">
      <Link
        to={ROUTES.SUPPORT}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0504AA]"
      >
        <ArrowLeft size={16} /> All conversations
      </Link>
      <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-[#07142D] p-5 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">Member services</p>
            <h2 className="mt-1 text-xl font-semibold">Secure conversation</h2>
          </div>
          {data && !closed && (
            <button
              className="flex items-center gap-2 rounded-xl border border-white/40 px-3 py-2 text-sm"
              onClick={() => void handoff()}
              disabled={busy}
            >
              <Headphones size={16} /> Request a human
            </button>
          )}
        </header>
        <div className="space-y-4 bg-slate-50 p-4 sm:p-7">
          {error ? (
            <button onClick={() => void mutate()}>Unable to load this thread. Retry</button>
          ) : !data ? (
            'Loading messages…'
          ) : !data.messages.length ? (
            'No messages yet.'
          ) : (
            data.messages.map((m) => (
              <article
                key={m.id}
                className={
                  'w-fit max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm shadow-sm ' +
                  (m.sender_role === 'member'
                    ? 'ml-auto bg-[#0504AA] text-white'
                    : 'border bg-white text-[#07142D]')
                }
              >
                <strong className="block text-xs">
                  {m.sender_role === 'member'
                    ? 'You'
                    : m.sender_role === 'system'
                      ? m.body.startsWith('EVERMONT AI Support: ')
                        ? 'EVERMONT AI Support · AI-generated'
                        : 'System notice'
                      : 'EVERMONT Support'}
                </strong>
                <p className="my-1">
                  {m.sender_role === 'system' ? m.body.replace(/^EVERMONT AI Support: /, '') : m.body}
                </p>
                <time className="text-xs opacity-75">{new Date(m.created_at).toLocaleString()}</time>{m.sender_role === 'member' && <span className="ml-2 text-xs opacity-75">Saved to conversation</span>}
              </article>
            ))
          )}
        </div>
        {notice && (
          <p role="status" className="px-5 py-2 text-sm">
            {notice}
          </p>
        )}
        {closed ? (
          <p className="p-5 text-sm">
            This conversation is closed. Start a new conversation for further help.
          </p>
        ) : (
          data && (
            <form onSubmit={send} className="grid gap-3 border-t p-4">
              <label className="text-sm font-semibold" htmlFor="reply">
                Message the support team
              </label>
              <textarea
                id="reply"
                className="rounded-xl border p-3"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={4000}
                rows={3}
                required
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <small>Never share passwords, PINs or sign-in codes.</small>
                <button
                  disabled={busy || !draft.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0504AA] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Send size={15} /> {busy ? 'Working…' : 'Send message'}
                </button>
              </div>
            </form>
          )
        )}
      </section>
    </PortalShell>
  )
}
export function SupportThreadPage() {
  const { user } = useAuth()
  const { id } = useParams()
  return user && id ? <Thread key={user.id + id} owner={user.id} id={id} /> : null
}
export default SupportThreadPage
