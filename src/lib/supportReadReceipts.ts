// Read receipts for a member's support thread. The thread page syncs on every load, including the
// 30-second recovery poll, so this tracker only calls the database when the newest staff reply has not
// yet been confirmed as read for that conversation. A failed call is logged with its context and tried
// again on the next sync instead of being dropped.

export type ReadReceiptMessage = { id: string; sender_role: 'member' | 'support' }

export type ReadReceiptOutcome =
  | { status: 'not-needed' }
  | { status: 'marked'; replyId: string }
  | { status: 'failed'; replyId: string; reason: string }

export type ReadReceiptTracker = {
  sync: (conversationId: string, messages: ReadReceiptMessage[]) => Promise<ReadReceiptOutcome>
}

type MarkRead = (conversationId: string) => PromiseLike<{ error: unknown }>

export function latestStaffReplyId(messages: ReadReceiptMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].sender_role === 'support') return messages[index].id
  }
  return null
}

export function describeReadError(error: unknown): string {
  if (error && typeof error === 'object') {
    const { message, code } = error as { message?: unknown; code?: unknown }
    const text = typeof message === 'string' && message ? message : 'unknown error'
    return typeof code === 'string' && code ? `${text} (code ${code})` : text
  }
  return String(error)
}

export function createReadReceiptTracker(
  markRead: MarkRead,
  report: (line: string) => void = (line) => console.warn(line),
): ReadReceiptTracker {
  // Newest staff reply the server has confirmed as read, per conversation id.
  const confirmed = new Map<string, string>()
  // Reply currently being marked, per conversation id, so overlapping syncs send one request.
  const pending = new Map<string, string>()

  return {
    async sync(conversationId, messages) {
      const replyId = latestStaffReplyId(messages)
      if (!replyId || confirmed.get(conversationId) === replyId || pending.get(conversationId) === replyId) {
        return { status: 'not-needed' }
      }
      pending.set(conversationId, replyId)
      try {
        const { error } = await markRead(conversationId)
        if (error) throw error
        confirmed.set(conversationId, replyId)
        return { status: 'marked', replyId }
      } catch (error) {
        const reason = describeReadError(error)
        report(`Read receipt not saved for support conversation ${conversationId} up to staff reply ${replyId}: ${reason}. It will be retried automatically.`)
        return { status: 'failed', replyId, reason }
      } finally {
        if (pending.get(conversationId) === replyId) pending.delete(conversationId)
      }
    },
  }
}
