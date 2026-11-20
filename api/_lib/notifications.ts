import type { SupabaseClient } from '@supabase/supabase-js'
import { sendSupportEmail } from './gmail'

type OutboxRow = {
  id: string
  conversation_id: string | null
  message_id: string | null
  attempt_count: number
}

type SupportMessage = {
  body: string
  created_at: string
  is_internal: boolean
  sender_role: string
}

type SupportConversation = {
  user_id: string
  subject: string
  priority: string
  status: string
}

async function completeJob(client: SupabaseClient, id: string): Promise<void> {
  await client.from('support_notification_outbox').update({
    status: 'sent',
    sent_at: new Date().toISOString(),
    locked_at: null,
    last_error: null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
}

async function failJob(client: SupabaseClient, job: OutboxRow, error: unknown): Promise<void> {
  const attempts = Math.min(6, Math.max(1, job.attempt_count))
  const delayMs = Math.min(60 * 60 * 1000, 60 * 1000 * (2 ** (attempts - 1)))
  const safeError = error instanceof Error ? error.message : 'Notification delivery failed'
  await client.from('support_notification_outbox').update({
    status: 'failed',
    available_at: new Date(Date.now() + delayMs).toISOString(),
    locked_at: null,
    last_error: safeError.slice(0, 300),
    updated_at: new Date().toISOString(),
  }).eq('id', job.id)
}

export async function deliverSupportNotification(client: SupabaseClient, job: OutboxRow): Promise<boolean> {
  try {
    if (!job.conversation_id || !job.message_id) throw new Error('Support notification is missing a ticket reference')

    const [{ data: conversation, error: conversationError }, { data: message, error: messageError }] = await Promise.all([
      client.from('support_conversations')
        .select('user_id,subject,priority,status')
        .eq('id', job.conversation_id)
        .single(),
      client.from('support_messages')
        .select('body,created_at,is_internal,sender_role')
        .eq('id', job.message_id)
        .single(),
    ])
    if (conversationError || !conversation) throw new Error('Support ticket could not be loaded')
    if (messageError || !message) throw new Error('Support message could not be loaded')

    const typedMessage = message as SupportMessage
    if (typedMessage.is_internal || typedMessage.sender_role.toLowerCase() !== 'member') {
      await completeJob(client, job.id)
      return true
    }

    const { data: userData, error: userError } = await client.auth.admin.getUserById(conversation.user_id)
    if (userError) throw new Error('Member contact information could not be loaded')
    const metadata = userData.user?.user_metadata ?? {}
    const memberName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')
      || metadata.full_name
      || metadata.name
      || undefined

    await sendSupportEmail({
      ticketId: job.conversation_id,
      subject: conversation.subject,
      memberName: typeof memberName === 'string' ? memberName.slice(0, 120) : undefined,
      memberEmail: userData.user?.email,
      body: typedMessage.body,
      createdAt: typedMessage.created_at,
      priority: conversation.priority,
      status: conversation.status,
    })
    await completeJob(client, job.id)
    return true
  } catch (error) {
    await failJob(client, job, error)
    return false
  }
}

export async function processConversationNotification(client: SupabaseClient, conversationId: string): Promise<{ sent: number; failed: number }> {
  const { data, error } = await client.rpc('claim_support_notification_for_conversation', {
    p_conversation_id: conversationId,
  })
  if (error) throw new Error('Unable to claim support notification')
  const job = (data as OutboxRow[] | null)?.[0]
  if (!job) return { sent: 0, failed: 0 }
  const sent = await deliverSupportNotification(client, job)
  return sent ? { sent: 1, failed: 0 } : { sent: 0, failed: 1 }
}

export async function processNotificationBatch(client: SupabaseClient): Promise<{ sent: number; failed: number }> {
  const { data, error } = await client.rpc('claim_support_notifications', { p_batch_size: 20 })
  if (error) throw new Error('Unable to claim support notifications')
  const jobs = (data as OutboxRow[] | null) ?? []
  const results = await Promise.all(jobs.map(job => deliverSupportNotification(client, job)))
  return {
    sent: results.filter(Boolean).length,
    failed: results.filter(result => !result).length,
  }
}
