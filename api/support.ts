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
        const [
          { data: messages, error: messagesError },
          { data: memberData },
          { data: failedNotifications, error: notificationError },
        ] = await Promise.all([
          client.from('support_messages')
            .select('id,conversation_id,sender_id,sender_role,body,is_internal,read_by_member,read_by_support,delivery_status,delivery_error,created_at')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true })
            .limit(500),
          client.auth.admin.getUserById(conversation.user_id),
          client.from('support_notification_outbox')
            .select('id,event_type,attempt_count,last_error,updated_at')
            .eq('conversation_id', id)
            .eq('status', 'failed')
            .order('updated_at', { ascending: false })
            .limit(50),
        ])
        if (messagesError) throw new Error('Unable to load ticket messages')
        if (notificationError) throw new Error('Unable to load notification delivery status')
        const loadedMemberMessageIds = (messages ?? [])
          .filter(message => message.sender_role.toLowerCase() === 'member' && !message.is_internal)
          .map(message => message.id)
        let readBySupportIds: string[] = []
        if (loadedMemberMessageIds.length) {
          const { data: readRows } = await client.from('support_messages')
            .update({ read_by_support: true })
            .eq('conversation_id', id)
            .eq('read_by_support', false)
            .eq('is_internal', false)
            .in('id', loadedMemberMessageIds)
            .select('id')
          readBySupportIds = (readRows ?? []).map(row => row.id)
        }
        const messageIdsReadBySupport = new Set(readBySupportIds)
        const messagesWithReadReceipts = (messages ?? []).map(message => ({
          ...message,
          read_by_support: message.read_by_support || messageIdsReadBySupport.has(message.id),
        }))
        const metadata = memberData.user?.user_metadata ?? {}
        const name = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')
          || metadata.full_name
          || metadata.name
          || null
        response.status(200).json({
          conversation,
          member: { name: typeof name === 'string' ? name : null, email: memberData.user?.email ?? null },
          messages: messagesWithReadReceipts,
          failedNotifications: failedNotifications ?? [],
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
      if (action !== 'notify' && action !== 'handoff' && action !== 'read' && !canManageSupport(user)) {
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

      if (action === 'read') {
        if (conversation.user_id !== user.id) {
          response.status(403).json({ error: 'You cannot update receipts for another member.' })
          return
        }
        const requestedIds = Array.isArray(body?.messageIds)
          ? [...new Set(body.messageIds.filter((value): value is string => typeof value === 'string' && UUID_PATTERN.test(value)))].slice(0, 500)
          : []
        if (!requestedIds.length) {
          response.status(400).json({ error: 'Loaded support message IDs are required.' })
          return
        }
        const { data: loadedMessages, error: loadedMessagesError } = await client.from('support_messages')
          .select('id')
          .eq('conversation_id', conversationId)
          .eq('sender_role', 'support')
          .eq('is_internal', false)
          .in('id', requestedIds)
        if (loadedMessagesError) throw new Error('Unable to verify loaded support messages')
        const verifiedIds = (loadedMessages ?? []).map(message => message.id)
        if (!verifiedIds.length) {
          response.status(200).json({ readMessageIds: [] })
          return
        }
        const { error: receiptError } = await client.from('support_messages')
          .update({ read_by_member: true })
          .eq('conversation_id', conversationId)
          .eq('read_by_member', false)
          .in('id', verifiedIds)
        if (receiptError) throw new Error('Unable to update support read receipts')
        response.status(200).json({ readMessageIds: verifiedIds })
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

        const requestedAt = new Date().toISOString()
        const { data: updatedConversation, error: handoffError } = await client.from('support_conversations')
          .update({ status: 'pending_support', updated_at: requestedAt })
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .neq('status', 'closed')
          .select('id,status,updated_at')
          .maybeSingle()
        if (handoffError) throw new Error('Unable to confirm human support request')
        if (!updatedConversation) {
          const { data: currentConversation } = await client.from('support_conversations')
            .select('status')
            .eq('id', conversationId)
            .eq('user_id', user.id)
            .maybeSingle()
          if (currentConversation?.status === 'closed') {
            response.status(409).json({ error: 'This conversation is closed and cannot be reopened by a support request.' })
            return
          }
          throw new Error('Unable to confirm human support request')
        }

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
        const messageId = getString(body?.messageId, 36)
        if (!message) {
          response.status(400).json({ error: 'Write a reply of 1–4,000 characters.' })
          return
        }
        if (!messageId || !UUID_PATTERN.test(messageId)) {
          response.status(400).json({ error: 'A valid reply request ID is required.' })
          return
        }
        const { data: existingMessage, error: existingError } = await client.from('support_messages')
          .select('id,body,created_at,delivery_status')
          .eq('id', messageId)
          .eq('conversation_id', conversationId)
          .eq('sender_id', user.id)
          .eq('sender_role', 'support')
          .maybeSingle()
        if (existingError) throw new Error('Unable to verify the support reply request')
        if (existingMessage && existingMessage.body !== message) {
          response.status(409).json({ error: 'This reply request ID was already used for different content.' })
          return
        }
        let savedMessage = existingMessage
        if (!savedMessage) {
          const { data: insertedMessage, error: insertError } = await client.from('support_messages').insert({
            id: messageId,
            conversation_id: conversationId,
            sender_id: user.id,
            sender_role: 'support',
            body: message,
            is_internal: false,
            read_by_member: false,
            read_by_support: true,
            delivery_status: 'queued',
          }).select('id,body,created_at,delivery_status').single()
          if (insertError || !insertedMessage) {
            const { data: retryMessage, error: retryError } = await client.from('support_messages')
              .select('id,body,created_at,delivery_status')
              .eq('id', messageId)
              .eq('conversation_id', conversationId)
              .eq('sender_id', user.id)
              .eq('sender_role', 'support')
              .maybeSingle()
            if (retryError || !retryMessage || retryMessage.body !== message) throw new Error('Unable to save the support reply')
            savedMessage = retryMessage
          } else {
            savedMessage = insertedMessage
          }
        }
        await client.from('support_conversations').update({
          last_message_at: savedMessage.created_at,
          updated_at: savedMessage.created_at,
        }).eq('id', conversationId)
        let notification = { sent: 0, failed: 0 }
        try {
          notification = await processConversationNotification(client, conversationId)
        } catch {
          // The persisted reply remains queued for the scheduled delivery worker.
        }
        response.status(existingMessage ? 200 : 201).json({ message: savedMessage, notification })
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
