import { supabase } from '@/lib/supabase'

export type SupportStatus = 'open' | 'pending_member' | 'pending_support' | 'resolved' | 'closed'
export type SupportConversation = { id: string; subject: string; status: SupportStatus; created_at: string; updated_at: string }
export type SupportMessage = { id: string; conversation_id: string; sender_role: 'member' | 'support'; body: string; created_at: string }

async function notifySupportWorker(conversationId: string): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) return
    await fetch('/api/support', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'notify', conversationId }),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    // The scheduled worker will deliver queued notifications if this best-effort request fails.
  }
}

export const supportService = {
  async requestHuman(conversationId: string) {
    try {
      const { data, error } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      if (error || !accessToken) return { data: null, error: new Error('Sign in again to request support.') }
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'handoff', conversationId }),
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json() as { handedOff?: boolean; status?: SupportStatus; requestedAt?: string; notificationQueued?: boolean; notificationDelivered?: boolean; error?: string }
      if (!response.ok || !result.handedOff) return { data: null, error: new Error('We could not confirm your request. Please try again.') }
      return { data: result, error: null }
    } catch {
      return { data: null, error: new Error('We could not confirm your request. Please try again.') }
    }
  },
  async listConversations(userId: string) {
    const { data, error } = await supabase.from('support_conversations').select('id,subject,status,created_at,updated_at').eq('user_id', userId).order('updated_at', { ascending: false })
    return { data: (data || []) as SupportConversation[], error }
  },
  async getConversation(userId: string, id: string) {
    const { data, error } = await supabase.from('support_conversations').select('id,subject,status,created_at,updated_at').eq('id', id).eq('user_id', userId).maybeSingle()
    return { data: data as SupportConversation | null, error }
  },
  async listMessages(userId: string, conversationId: string) {
    const conversation = await this.getConversation(userId, conversationId)
    if (conversation.error || !conversation.data) return { data: [] as SupportMessage[], error: conversation.error || new Error('Conversation not found') }
    const { data, error } = await supabase.from('support_messages').select('id,conversation_id,sender_role,body,created_at').eq('conversation_id', conversationId).eq('is_internal', false).order('created_at', { ascending: true })
    return { data: (data || []) as SupportMessage[], error }
  },
  // Creates the conversation and its first message in one database transaction.
  async createConversation(userId: string, subject: string, body: string) {
    const { data: conversationId, error } = await supabase.rpc('create_support_conversation', { p_subject: subject.trim(), p_body: body.trim() })
    if (error || typeof conversationId !== 'string') return { data: null, error: error || new Error('Conversation could not be created') }
    void notifySupportWorker(conversationId)
    const created = await this.getConversation(userId, conversationId)
    if (created.error || !created.data) return { data: null, error: created.error || new Error('Conversation not found') }
    return { data: created.data as SupportConversation, error: null }
  },
  async sendMessage(userId: string, conversationId: string, body: string) {
    const conversation = await this.getConversation(userId, conversationId)
    if (conversation.error || !conversation.data) return { error: conversation.error || new Error('Conversation not found') }
    if (conversation.data.status === 'closed') return { error: new Error('This conversation is closed. Start a new conversation to contact support.') }
    const result = await supabase.from('support_messages').insert({ conversation_id: conversationId, sender_id: userId, sender_role: 'member', body: body.trim(), is_internal: false })
    if (!result.error) void notifySupportWorker(conversationId)
    return result
  },
  // Marks staff replies on the member's own conversation as read. Idempotent.
  async markRead(conversationId: string) {
    const { error } = await supabase.rpc('support_mark_member_read', { p_conversation_id: conversationId })
    return { error }
  },
}
