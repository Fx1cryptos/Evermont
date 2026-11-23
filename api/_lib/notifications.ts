import type { SupabaseClient } from '@supabase/supabase-js'
import { sendSupportEmail, sendSupportReply } from './gmail.js'

type OutboxRow = {
  id: string
  conversation_id: string | null
  message_id: string | null
  event_type: string
  attempt_count: number
}

type SupportMessage = {
  id: string
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
  gmail_thread_id: string | null
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
  if (job.event_type === 'support_reply' && job.message_id) {
    await client.from('support_messages').update({
      delivery_status: 'failed',
      delivery_error: safeError.slice(0, 300),
    }).eq('id', job.message_id)
  }
}

export async function deliverSupportNotification(client: SupabaseClient, job: OutboxRow): Promise<boolean> {
  try {
    if (!job.conversation_id || !job.message_id) throw new Error('Support notification is missing a ticket reference')

    const [{ data: conversation, error: conversationError }, { data: message, error: messageError }] = await Promise.all([
      client.from('support_conversations')
        .select('user_id,subject,priority,status,gmail_thread_id')
        .eq('id', job.conversation_id)
        .single(),
      client.from('support_messages')
        .select('id,body,created_at,is_internal,sender_role')
        .eq('id', job.message_id)
        .single(),
    ])
    if (conversationError || !conversation) throw new Error('Support ticket could not be loaded')
    if (messageError || !message) throw new Error('Support message could not be loaded')

    const typedConversation = conversation as SupportConversation
    const typedMessage = message as SupportMessage
    if (typedMessage.is_internal) {
      await completeJob(client, job.id)
      return true
    }

    if (job.event_type === 'support_reply' && typedMessage.sender_role.toLowerCase() === 'support') {
      const { data: userData, error: userError } = await client.auth.admin.getUserById(typedConversation.user_id)
      const member = userData.user
      if (userError || !member?.email || !member.email_confirmed_at) {
        throw new Error('A verified member email address could not be loaded')
      }

      const { data: latestInbound, error: inboundError } = await client.from('support_messages')
        .select('gmail_rfc_message_id,gmail_references')
        .eq('conversation_id', job.conversation_id)
        .eq('source', 'gmail')
        .not('gmail_rfc_message_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (inboundError) throw new Error('Gmail reply headers could not be loaded')

      await client.from('support_messages').update({ delivery_status: 'sending', delivery_error: null })
        .eq('id', job.message_id)
      const sent = await sendSupportReply({
        recipient: member.email,
        subject: typedConversation.subject,
        body: typedMessage.body,
        threadId: typedConversation.gmail_thread_id,
        inReplyTo: latestInbound?.gmail_rfc_message_id,
        references: latestInbound?.gmail_references,
      })

      const { error: savedMessageError } = await client.from('support_messages').update({
        delivery_status: 'sent',
        delivery_error: null,
        gmail_message_id: sent.id,
        gmail_thread_id: sent.threadId,
      }).eq('id', job.message_id)
      if (savedMessageError) throw new Error('Gmail delivery succeeded but the support message status could not be saved')

      const { error: savedConversationError } = await client.from('support_conversations').update({
        gmail_thread_id: sent.threadId,
        status: 'pending_member',
        updated_at: new Date().toISOString(),
      }).eq('id', job.conversation_id)
      if (savedConversationError) throw new Error('Gmail delivery succeeded but the support thread could not be updated')
      await completeJob(client, job.id)
      return true
    }

    if ((job.event_type === 'support_message' || job.event_type === 'support_handoff') && typedMessage.sender_role.toLowerCase() === 'member') {
      const { data: userData, error: userError } = await client.auth.admin.getUserById(typedConversation.user_id)
      if (userError) throw new Error('Member contact information could not be loaded')
      const metadata = userData.user?.user_metadata ?? {}
      const memberName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')
        || metadata.full_name
        || metadata.name
        || undefined
      const isHandoff = job.event_type === 'support_handoff'

      await sendSupportEmail({
        ticketId: job.conversation_id,
        subject: isHandoff ? `Human support requested: ${typedConversation.subject}` : typedConversation.subject,
        memberName: typeof memberName === 'string' ? memberName.slice(0, 120) : undefined,
        memberEmail: userData.user?.email,
        body: isHandoff ? `The member requested a human response.\n\nLatest message:\n${typedMessage.body}` : typedMessage.body,
        createdAt: typedMessage.created_at,
        priority: typedConversation.priority,
        status: typedConversation.status,
      })
      await completeJob(client, job.id)
      return true
    }

    throw new Error('Support notification has an unsupported event type')
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

export async function processSupportNotificationBatch(
  client: SupabaseClient,
  batchSize = 10,
): Promise<{ processed: number; sent: number; failed: number }> {
  const { data, error } = await client.rpc('claim_support_notifications', {
    p_batch_size: Math.max(1, Math.min(20, batchSize)),
  })
  if (error) throw new Error('Unable to claim support notifications')
  const jobs = (data as OutboxRow[] | null) ?? []
  let sent = 0
  let failed = 0
  for (const job of jobs) {
    if (await deliverSupportNotification(client, job)) sent += 1
    else failed += 1
  }
  return { processed: jobs.length, sent, failed }
}
