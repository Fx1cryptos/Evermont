import { supabase } from '@/lib/supabase'

export type SupportStatus = 'open' | 'pending_member' | 'pending_support' | 'resolved' | 'closed'
export type SupportConversation = {
  id: string
  subject: string
  status: SupportStatus
  created_at: string
  updated_at: string
  assistant_resumed?: boolean
  human_requested?: boolean
  assigned_to?: string | null
  unread?: { id: string }[]
  support_messages?: Pick<SupportMessage, 'body' | 'sender_role' | 'read_by_member'>[]
}
export type SupportMessage = {
  id: string
  conversation_id: string
  sender_role: 'member' | 'support' | 'system'
  read_by_member: boolean
  body: string
  created_at: string
}

export async function memberAction(
  conversationId: string,
  action: 'notify' | 'handoff' | 'read',
  ids?: string[],
): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) return false
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, conversationId, ids }),
      signal: AbortSignal.timeout(10000),
    })
    return response.ok
  } catch {
    return false
  }
}

export const supportService = {
  async listConversations(userId: string) {
    const { data, error } = await supabase
      .from('support_conversations')
      .select(
        'id,subject,status,created_at,updated_at,support_messages(body,sender_role,read_by_member),unread:support_messages(id)',
      )
      .eq('user_id', userId)
      .eq('unread.is_internal', false)
      .eq('unread.read_by_member', false)
      .neq('unread.sender_role', 'member')
      .limit(1, { referencedTable: 'unread' })
      .eq('support_messages.is_internal', false)
      .order('created_at', { referencedTable: 'support_messages', ascending: false })
      .limit(1, { referencedTable: 'support_messages' })
      .order('updated_at', { ascending: false })
    return { data: (data || []) as SupportConversation[], error }
  },
  async getConversation(userId: string, id: string) {
    const { data, error } = await supabase
      .from('support_conversations')
      .select('id,subject,status,human_requested,assistant_resumed,assigned_to ,created_at,updated_at')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()
    return { data: data as SupportConversation | null, error }
  },
  async listMessages(userId: string, conversationId: string) {
    const conversation = await this.getConversation(userId, conversationId)
    if (conversation.error || !conversation.data)
      return {
        data: [] as SupportMessage[],
        error: conversation.error || new Error('Conversation not found'),
      }
    const messages: SupportMessage[] = []
    const size = 200
    for (let start = 0; ; start += size) {
      const { data, error } = await supabase
        .from('support_messages')
        .select('id,conversation_id,sender_role,body,created_at,read_by_member')
        .eq('conversation_id', conversationId)
        .eq('is_internal', false)
        .order('created_at')
        .order('id')
        .range(start, start + size - 1)
      if (error) return { data: [], error }
      messages.push(...((data || []) as SupportMessage[]))
      if (!data || data.length < size) break
    }
    return { data: messages, error: null }
  },
  // The database commits the ticket, message and outbox event before acknowledging.
  async submit(requestId: string, ticket: string | null, subject: string | null, body: string) {
    const result = await supabase.rpc('submit_member_support_message', {
      p_request: requestId, p_ticket: ticket, p_subject: subject, p_body: body.trim(),
    })
    if (!result.error && typeof result.data === 'string') void memberAction(result.data, 'notify')
    return result
  },
  async createConversation(userId: string, subject: string, body: string) {
    const { data: conversation, error: conversationError } = await supabase
      .from('support_conversations')
      .insert({ user_id: userId, subject: subject.trim() })
      .select('id,subject,status,created_at,updated_at')
      .single()
    if (conversationError || !conversation)
      return { data: null, error: conversationError || new Error('Conversation could not be created') }
    const { error: messageError } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: userId,
        sender_role: 'member',
        body: body.trim(),
        is_internal: false,
      })
    if (!messageError) void memberAction(conversation.id, 'notify')
    return { data: conversation as SupportConversation, error: messageError }
  },
  async sendMessage(userId: string, conversationId: string, body: string) {
    const conversation = await this.getConversation(userId, conversationId)
    if (conversation.error || !conversation.data)
      return { error: conversation.error || new Error('Conversation not found') }
    if (['closed', 'resolved'].includes(conversation.data.status))
      return { error: new Error('This conversation is closed.') }
    const result = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_role: 'member',
        body: body.trim(),
        is_internal: false,
      })
    if (!result.error) void memberAction(conversationId, 'notify')
    return result
  },
}
