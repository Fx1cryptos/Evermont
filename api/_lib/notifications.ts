import type { SupabaseClient } from '@supabase/supabase-js'
import { assistMember } from './assistant.js'
import { sendSupportEmail, sendSupportReply } from './gmail.js'

type OutboxRow = {
  id: string
  conversation_id: string | null
  message_id: string | null
  payload?: { handoff?: boolean; alert?: unknown }
  event_type: string
  created_at?: string
  locked_at: string
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

async function completeJob(client: SupabaseClient, job: OutboxRow, binding?: {threadId?: string; id?: string}): Promise<void> {
  const {data,error} = await client.from('support_notification_outbox').update({
    ...(binding ? { payload: { ...job.payload, notification_thread:binding.threadId, notification_message:binding.id } } : {}),
    status: 'sent',
    sent_at: new Date().toISOString(),
    locked_at: null,
    last_error: null,
    updated_at: new Date().toISOString(),
  }).eq('id', job.id).eq('status','processing').eq('locked_at',job.locked_at).select('id').maybeSingle()
  if (!data || error) throw new Error('Could not record notification delivery')
  console.info({event:'support.notification.completed'})
}

async function failJob(client: SupabaseClient, job: OutboxRow, error: unknown): Promise<void> {
  const attempts = Math.min(6, Math.max(1, job.attempt_count))
  const delayMs = Math.min(60 * 60 * 1000, 60 * 1000 * (2 ** (attempts - 1)))
  const safeError = error instanceof Error ? error.message : 'Notification delivery failed'
  const failed = await client.from('support_notification_outbox').update({
    status: 'failed',
    available_at: new Date(Date.now() + delayMs).toISOString(),
    locked_at: null,
    last_error: safeError.slice(0, 300),
    updated_at: new Date().toISOString(),
  }).eq('id', job.id).eq('status','processing').eq('locked_at',job.locked_at).select('id').maybeSingle()
  if (failed.error) throw new Error('Could not record notification failure')
  if (!failed.data) return
  if (job.event_type === 'support_reply' && job.message_id) {
    await client.from('support_messages').update({
      delivery_status: 'failed',
      delivery_error: safeError.slice(0, 300),
    }).eq('id', job.message_id).neq('delivery_status','sent')
  }
}

export async function deliverSupportNotification(client: SupabaseClient, job: OutboxRow): Promise<boolean> {
  try {
    if (job.event_type === 'support_staff_alert' && job.conversation_id) {
      const alert = job.payload?.alert
      if (alert !== 'handoff' && alert !== 'high_priority' && alert !== 'overdue' && alert !== 'delivery_failure') {
        throw new Error('Unknown staff alert')
      }
      const { data: ticket, error } = await client.from('support_conversations')
        .select('subject,priority,status').eq('id', job.conversation_id).single()
      if (error || !ticket) throw new Error('Support ticket could not be loaded')
      await sendSupportEmail({
        alert,
        ticketId: job.conversation_id,
        notificationId: job.id,
        received: job.created_at,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
      }, job.attempt_count > 1)
      await completeJob(client, job)
      return true
    }
    if (!job.conversation_id || !job.message_id) throw new Error('Support notification is missing a ticket reference')

    const [{ data: conversation, error: conversationError }, { data: message, error: messageError }] = await Promise.all([
      client.from('support_conversations')
        .select('user_id,subject,priority,status,gmail_thread_id')
        .eq('id', job.conversation_id)
        .single(),
      client.from('support_messages')
        .select('id,body,created_at,is_internal,sender_role')
        .eq('id', job.message_id).eq('conversation_id',job.conversation_id)
        .single(),
    ])
    if (conversationError || !conversation) throw new Error('Support ticket could not be loaded')
    if (messageError || !message) throw new Error('Support message could not be loaded')

    const typedConversation = conversation as SupportConversation
    const typedMessage = message as SupportMessage
    if (typedMessage.is_internal) {
      await completeJob(client, job)
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
        notificationId: job.id, retry: job.attempt_count > 1,
        recipient: member.email,
        subject: 'Your EVERMONT support conversation',
        body: 'Your support team has replied. Sign in to the member portal and open Help & Support to read the reply.',
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

      }).eq('id', job.conversation_id)
      if (savedConversationError) throw new Error('Gmail delivery succeeded but the support thread could not be updated')
      await completeJob(client, job)
      return true
    }

    if (job.event_type === 'support_message' && typedMessage.sender_role.toLowerCase() === 'member') {
      // A saved outbox job survives navigation away from the member page.
      // The DB claim deduplicates this recovery with the immediate chat request.
      await assistMember(client, job.conversation_id, typedConversation.user_id).catch(()=>false)
      const { data: userData, error: userError } = await client.auth.admin.getUserById(typedConversation.user_id)
      if (userError) throw new Error('Member contact information could not be loaded')
      const metadata = userData.user?.user_metadata ?? {}
      const memberName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')
        || metadata.full_name
        || metadata.name
        || undefined

      const sent = await sendSupportEmail({
        ticketId: job.conversation_id,
        subject: job.payload?.handoff ? 'Human assistance requested: '+typedConversation.subject : typedConversation.subject,
        priority: typedConversation.priority,
        question: typedMessage.body, received: typedMessage.created_at, status:typedConversation.status,
        memberEmail: userData.user?.email_confirmed_at ? userData.user.email : undefined,
        memberName: typeof memberName === 'string' ? memberName.slice(0, 120) : undefined,
        notificationId: job.id,
      },job.attempt_count > 1)
      await completeJob(client, job, sent)
      return true
    }

    throw new Error('Support notification has an unsupported event type')
  } catch (error) {
    console.warn({event:'support.notification.failed',attempt:job.attempt_count})
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
  const overdueHours = process.env.SUPPORT_OVERDUE_HOURS?.trim()
  let overdueScanFailed = false
  if (overdueHours) {
    const hours = Number(overdueHours)
    if (!Number.isInteger(hours) || hours < 1 || hours > 2147483647) {
      overdueScanFailed = true
    } else {
      const { error } = await client.rpc('enqueue_overdue_support_alerts', { p_hours: hours })
      overdueScanFailed = Boolean(error)
    }
  }
  // Lease only the next job. A slow Gmail call must not consume the leases of waiting jobs.
  const limit = Math.max(1, Math.min(20, batchSize))
  let sent = 0
  let failed = 0
  for (let index = 0; index < limit; index++) {
    const { data, error } = await client.rpc('claim_support_notifications', { p_batch_size: 1 })
    if (error) throw new Error('Unable to claim support notifications')
    const job = (data as OutboxRow[] | null)?.[0]
    if (!job) break
    if (await deliverSupportNotification(client, job)) sent += 1
    else failed += 1
  }
  if (overdueScanFailed) throw new Error('Support overdue check failed')
  return { processed: sent + failed, sent, failed }
}
