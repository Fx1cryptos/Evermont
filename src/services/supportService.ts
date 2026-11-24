import { supabase } from '@/lib/supabase'

export type SupportStatus = 'open' | 'pending_member' | 'pending_support' | 'resolved' | 'closed'
export type SupportConversation = { id: string; subject: string; status: SupportStatus; created_at: string; updated_at: string }
export type SupportMessage = { id: string; conversation_id: string; sender_role: 'member' | 'support'; body: string; created_at: string; read_by_member: boolean; read_by_support: boolean }

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
      if (!response.ok || !result.handedOff) return { data: null, error: new Error(result.error || 'We could not confirm your request. Please try again.') }
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
    const { data, error } = await supabase.from('support_messages').select('id,conversation_id,sender_role,body,created_at,read_by_member,read_by_support').eq('conversation_id', conversationId).eq('is_internal', false).order('created_at', { ascending: true })
    return { data: (data || []) as SupportMessage[], error }
  },
  async createConversation(userId: string, subject: string, body: string, conversationId: string, messageId: string) {
    const normalizedSubject = subject.trim()
    const normalizedBody = body.trim()
    const { data: insertedConversation, error: conversationError } = await supabase.from('support_conversations')
      .insert({ id: conversationId, user_id: userId, subject: normalizedSubject })
      .select('id,subject,status,created_at,updated_at')
      .single()
    let conversation = insertedConversation
    if (conversationError || !conversation) {
      const { data: existingConversation, error: lookupError } = await supabase.from('support_conversations')
        .select('id,subject,status,created_at,updated_at')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .maybeSingle()
      if (lookupError || !existingConversation || existingConversation.subject !== normalizedSubject) {
        return { data: null, error: conversationError || lookupError || new Error('Conversation could not be created') }
      }
      conversation = existingConversation
    }

    const { error: messageError } = await supabase.from('support_messages').insert({
      id: messageId,
      conversation_id: conversation.id,
      sender_id: userId,
      sender_role: 'member',
      body: normalizedBody,
      is_internal: false,
    })
    if (messageError) {
      const { data: existingMessage, error: messageLookupError } = await supabase.from('support_messages')
        .select('id,body')
        .eq('id', messageId)
        .eq('conversation_id', conversation.id)
        .eq('sender_id', userId)
        .maybeSingle()
      if (messageLookupError || !existingMessage || existingMessage.body !== normalizedBody) {
        return { data: conversation as SupportConversation, error: messageError || messageLookupError || new Error('First message could not be saved') }
      }
    }

    void notifySupportWorker(conversation.id)
    return { data: conversation as SupportConversation, error: null }
  },
  async sendMessage(userId: string, conversationId: string, body: string, messageId: string) {
    const conversation = await this.getConversation(userId, conversationId)
    if (conversation.error || !conversation.data) return { error: conversation.error || new Error('Conversation not found') }
    const normalizedBody = body.trim()
    const result = await supabase.from('support_messages').insert({ id: messageId, conversation_id: conversationId, sender_id: userId, sender_role: 'member', body: normalizedBody, is_internal: false })
    if (result.error) {
      const { data: existingMessage, error: lookupError } = await supabase.from('support_messages')
        .select('id,body')
        .eq('id', messageId)
        .eq('conversation_id', conversationId)
        .eq('sender_id', userId)
        .maybeSingle()
      if (lookupError || !existingMessage || existingMessage.body !== normalizedBody) return { error: result.error }
      void notifySupportWorker(conversationId)
      return { error: null }
    }
    void notifySupportWorker(conversationId)
    return result
  },
}
