import type { RequestLike, ResponseLike } from './_lib/support.js'
import { authenticateSupportUser, canManageSupport, canViewSupport, getQueryString, getString, getSupabaseAdmin, setJsonHeaders } from './_lib/support.js'
import { processConversationNotification } from './_lib/notifications.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function bodyRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  setJsonHeaders(response, 'GET, POST, PATCH, OPTIONS')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  let client
  try {
    client = getSupabaseAdmin()
    const user = await authenticateSupportUser(client, request)
    if (!user) {
      response.status(401).json({ error: 'Sign in to continue.' })
      return
    }

    if (request.method === 'GET') {
      if (!canViewSupport(user)) {
        response.status(403).json({ error: 'You do not have permission to view support tickets.' })
        return
      }
      const id = getQueryString(request, 'id')
      if (id) {
        if (!UUID_PATTERN.test(id)) {
          response.status(400).json({ error: 'Invalid ticket ID.' })
          return
        }
        const { data: conversation, error } = await client.from('support_conversations')
          .select('id,user_id,subject,status,priority,assigned_to,last_message_at,created_at,updated_at')
          .eq('id', id)
          .maybeSingle()
        if (error || !conversation) {
          response.status(404).json({ error: 'Support ticket not found.' })
          return
        }
        const [{ data: messages, error: messagesError }, { data: memberData }] = await Promise.all([
          client.from('support_messages')
            .select('id,conversation_id,sender_id,sender_role,body,is_internal,read_by_member,read_by_support,created_at')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true })
            .limit(500),
          client.auth.admin.getUserById(conversation.user_id),
        ])
        if (messagesError) throw new Error('Unable to load ticket messages')
        await client.from('support_messages')
          .update({ read_by_support: true })
          .eq('conversation_id', id)
          .eq('read_by_support', false)
          .eq('is_internal', false)
        const metadata = memberData.user?.user_metadata ?? {}
        const name = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')
          || metadata.full_name
          || metadata.name
          || null
        response.status(200).json({
          conversation,
          member: { name: typeof name === 'string' ? name : null, email: memberData.user?.email ?? null },
          messages: messages ?? [],
        })
        return
      }

      const status = getQueryString(request, 'status')
      const priority = getQueryString(request, 'priority')
      const query = getQueryString(request, 'q')?.toLocaleLowerCase() ?? ''
      let conversationsQuery = client.from('support_conversations')
        .select('id,user_id,subject,status,priority,assigned_to,last_message_at,created_at,updated_at')
        .order('last_message_at', { ascending: false })
        .limit(100)
      if (status && status !== 'all') conversationsQuery = conversationsQuery.eq('status', status)
      if (priority && priority !== 'all') conversationsQuery = conversationsQuery.eq('priority', priority)
      const { data: conversations, error } = await conversationsQuery
      if (error) throw new Error('Unable to load support tickets')
      const filtered = (conversations ?? []).filter(item => !query
        || item.subject.toLocaleLowerCase().includes(query)
        || item.id.toLocaleLowerCase().includes(query))
      const ids = filtered.map(item => item.id)
      const { data: messages, error: messagesError } = ids.length
        ? await client.from('support_messages')
          .select('conversation_id,body,sender_role,is_internal,read_by_support,created_at')
          .in('conversation_id', ids)
          .eq('is_internal', false)
          .order('created_at', { ascending: false })
          .limit(1000)
        : { data: [], error: null }
      if (messagesError) throw new Error('Unable to load support previews')
      const { data: handoffEvents, error: handoffEventsError } = ids.length
        ? await client.from('support_notification_outbox')
          .select('conversation_id')
          .in('conversation_id', ids)
          .eq('event_type', 'support_handoff')
        : { data: [], error: null }
      if (handoffEventsError) throw new Error('Unable to load human-support requests')
      const handoffConversationIds = new Set((handoffEvents ?? []).map(event => event.conversation_id))
      const messageSummary = new Map<string, { unread: number; latest: string | null; latestAt: string | null }>()
      for (const message of messages ?? []) {
        const summary = messageSummary.get(message.conversation_id) ?? { unread: 0, latest: null, latestAt: null }
        if (!message.read_by_support && message.sender_role.toLowerCase() === 'member') summary.unread += 1
        if (summary.latest === null) {
          summary.latest = message.body
          summary.latestAt = message.created_at
        }
        messageSummary.set(message.conversation_id, summary)
      }
      response.status(200).json({ conversations: filtered.map(item => ({
        ...item,
        unreadCount: messageSummary.get(item.id)?.unread ?? 0,
        preview: messageSummary.get(item.id)?.latest ?? '',
        humanRequested: item.status === 'pending_support' && handoffConversationIds.has(item.id),
      })) })
      return
    }

    if (request.method === 'POST') {
      const body = bodyRecord(request.body)
      const action = getString(body?.action, 20)
      const conversationId = getString(body?.conversationId, 36)
      if (action !== 'notify' && action !== 'handoff' && !canManageSupport(user)) {
        response.status(403).json({ error: 'You do not have permission to respond to support tickets.' })
        return
      }
      if (!conversationId || !UUID_PATTERN.test(conversationId)) {
        response.status(400).json({ error: 'A valid ticket ID is required.' })
        return
      }
      const { data: conversation, error: ticketError } = await client.from('support_conversations')
        .select('id,user_id')
        .eq('id', conversationId)
        .maybeSingle()
      if (ticketError || !conversation) {
        response.status(404).json({ error: 'Support ticket not found.' })
        return
      }

      if (action === 'notify') {
        if (conversation.user_id !== user.id) {
          response.status(403).json({ error: 'You cannot process notifications for another member.' })
          return
        }
        const result = await processConversationNotification(client, conversationId)
        response.status(202).json({ result })
        return
      }

      if (action === 'handoff') {
        if (conversation.user_id !== user.id) {
          response.status(403).json({ error: 'You cannot request support for another member.' })
          return
        }

        const { data: currentConversation, error: currentError } = await client.from('support_conversations')
          .select('status')
          .eq('id', conversationId)
          .maybeSingle()
        if (currentError || !currentConversation) throw new Error('Unable to read support ticket status')
        if (currentConversation.status === 'closed') {
          response.status(409).json({ error: 'This conversation is closed. Start a new request to contact support.' })
          return
        }

        const requestedAt = new Date().toISOString()
        const { data: updatedConversation, error: handoffError } = await client.from('support_conversations')
          .update({ status: 'pending_support', updated_at: requestedAt })
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .select('id,status,updated_at')
          .single()
        if (handoffError || !updatedConversation) throw new Error('Unable to confirm human support request')

        const { data: latestMemberMessage } = await client.from('support_messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .eq('sender_role', 'member')
          .eq('is_internal', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        let notificationQueued = false
        let notificationDelivered = false
        if (latestMemberMessage) {
          const { error: queueError } = await client.from('support_notification_outbox').upsert({
            conversation_id: conversationId,
            message_id: latestMemberMessage.id,
            event_type: 'support_handoff',
            dedupe_key: `support-handoff:${conversationId}:${latestMemberMessage.id}`,
            payload: {},
          }, { onConflict: 'dedupe_key', ignoreDuplicates: true })
          if (!queueError) {
            notificationQueued = true
            try {
              const result = await processConversationNotification(client, conversationId)
              notificationDelivered = result.sent > 0
            } catch {
              // The durable handoff and queued notification remain available to the scheduled worker.
            }
          }
        }

        response.status(200).json({
          handedOff: true,
          status: updatedConversation.status,
          requestedAt: updatedConversation.updated_at,
          notificationQueued,
          notificationDelivered,
        })
        return
      }

      if (action === 'reply') {
        const message = getString(body?.message, 4000)
        if (!message) {
          response.status(400).json({ error: 'Write a reply of 1–4,000 characters.' })
          return
        }
        const { data, error } = await client.from('support_messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_role: 'support',
          body: message,
          is_internal: false,
          read_by_member: false,
          read_by_support: true,
          delivery_status: 'queued',
        }).select('id,created_at,delivery_status').single()
        if (error) throw new Error('Unable to save the support reply')
        await client.from('support_conversations').update({
          last_message_at: data.created_at,
          updated_at: data.created_at,
        }).eq('id', conversationId)
        let notification = { sent: 0, failed: 0 }
        try {
          notification = await processConversationNotification(client, conversationId)
        } catch {
          // The persisted reply remains queued for the scheduled delivery worker.
        }
        response.status(201).json({ message: data, notification })
        return
      }

      if (action === 'retry') {
        const { error } = await client.from('support_notification_outbox').update({
          status: 'pending',
          attempt_count: 0,
          available_at: new Date().toISOString(),
          locked_at: null,
          last_error: null,
          updated_at: new Date().toISOString(),
        }).eq('conversation_id', conversationId).eq('status', 'failed')
        if (error) throw new Error('Unable to schedule notification retry')
        const result = await processConversationNotification(client, conversationId)
        response.status(200).json({ result })
        return
      }
      response.status(400).json({ error: 'Unsupported support action.' })
      return
    }

    if (request.method === 'PATCH') {
      if (!canManageSupport(user)) {
        response.status(403).json({ error: 'You do not have permission to update support tickets.' })
        return
      }
      const body = bodyRecord(request.body)
      const id = getString(body?.conversationId, 36)
      if (!id || !UUID_PATTERN.test(id)) {
        response.status(400).json({ error: 'A valid ticket ID is required.' })
        return
      }
      const updates: Record<string, string | null> = {}
      if (body?.status !== undefined) {
        const status = getString(body.status, 32)
        if (!status || !['open', 'pending_member', 'pending_support', 'resolved', 'closed'].includes(status)) {
          response.status(400).json({ error: 'Choose a valid ticket status.' })
          return
        }
        updates.status = status
      }
      if (body?.priority !== undefined) {
        const priority = getString(body.priority, 16)
        if (!priority || !['low', 'normal', 'high', 'urgent'].includes(priority)) {
          response.status(400).json({ error: 'Choose a valid ticket priority.' })
          return
        }
        updates.priority = priority
      }
      if (!Object.keys(updates).length) {
        response.status(400).json({ error: 'No ticket changes were provided.' })
        return
      }
      updates.updated_at = new Date().toISOString()
      const { data, error } = await client.from('support_conversations')
        .update(updates)
        .eq('id', id)
        .select('id,status,priority,updated_at')
        .maybeSingle()
      if (error || !data) throw new Error('Unable to update the support ticket')
      response.status(200).json({ conversation: data })
      return
    }

    response.setHeader('Allow', 'GET, POST, PATCH, OPTIONS')
    response.status(405).json({ error: 'Method not allowed.' })
  } catch {
    response.status(500).json({ error: 'The support service could not complete this request.' })
  }
}
