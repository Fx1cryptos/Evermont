import type { SupabaseClient } from '@supabase/supabase-js'
import { canManageSupport } from './support.js'
import { getGmailContext, supportMailbox, notificationReference } from './gmail.js'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'
const MAX_MESSAGES_PER_RUN = 25

type GmailMessageRef = { id?: string; threadId?: string }
type GmailListResponse = { messages?: GmailMessageRef[]; nextPageToken?: string }
type GmailHistoryEntry = {
  messagesAdded?: Array<{ message?: GmailMessageRef }>
}
type GmailHistoryResponse = {
  history?: GmailHistoryEntry[]
  historyId?: string
  nextPageToken?: string
}
type GmailPayloadPart = {
  mimeType?: string
  body?: { data?: string }
  parts?: GmailPayloadPart[]
}
type GmailFullMessage = {
  labelIds?: string[]
  id?: string
  threadId?: string
  internalDate?: string
  snippet?: string
  payload?: {
    mimeType?: string
    headers?: Array<{ name?: string; value?: string }>
    body?: { data?: string }
    parts?: GmailPayloadPart[]
  }
}
type SyncState = {
  mailbox_email: string
  history_id: string | null
  bootstrap_history_id: string | null
  bootstrap_page_token: string | null
  history_page_token: string | null
}
type SyncResult = {
  imported: number
  ignored: number
  nextPagePending: boolean
  lastSyncedAt: string
}

class GmailApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf8')
}

function decodeMimeHeader(value: string): string {
  return value.replace(/=\?([^?]+)\?([bq])\?([^?]+)\?=/gi, (_match, _charset: string, encoding: string, content: string) => {
    try {
      if (encoding.toLowerCase() === 'b') return Buffer.from(content, 'base64').toString('utf8')
      const bytes = content.replace(/_/g, ' ').replace(/=([a-f\d]{2})/gi, (_hexMatch, hex: string) => String.fromCharCode(parseInt(hex, 16)))
      return Buffer.from(bytes, 'binary').toString('utf8')
    } catch {
      return content
    }
  }).trim()
}

function headerValue(headers: Array<{ name?: string; value?: string }>, name: string): string {
  return headers.find(header => header.name?.toLowerCase() === name.toLowerCase())?.value?.trim() || ''
}

function parseEmail(value: string): string | null {
  const bracketed = value.match(/<\s*([^<>\s]+@[^<>\s]+)\s*>/)
  const candidate = (bracketed?.[1] || value.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '').trim().toLowerCase()
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(candidate) ? candidate : null
}

function extractText(payload?: GmailFullMessage['payload']): string {
  if (!payload) return ''
  const findPart = (parts?: GmailPayloadPart[]): string => {
    if (!parts) return ''
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64Url(part.body.data)
      const nested = findPart(part.parts)
      if (nested) return nested
    }
    return ''
  }
  const plainText = payload.body?.data ? decodeBase64Url(payload.body.data) : findPart(payload.parts)
  if (plainText.trim()) return plainText.trim()

  const html = (payload.parts || []).find(part => part.mimeType === 'text/html' && part.body?.data)?.body?.data
  if (!html) return ''
  return decodeBase64Url(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?\s*>|<\/p\s*>|<\/div\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

function normalizedSubject(value: string): string {
  const subject = decodeMimeHeader(value).replace(/^(\s*(re|fw|fwd)\s*:\s*)+/i, '').trim()
  return (subject || 'Email support request').slice(0, 180)
}

function escapeLikeValue(value: string): string {
  return value.replace(/[\\%_]/g, character => `\\${character}`)
}

async function gmailGet<T>(url: URL, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GmailApiError(response.status, 'Gmail inbox access needs the gmail.readonly scope. Re-authorize the support mailbox.')
    }
    throw new GmailApiError(response.status, response.status === 429 || response.status >= 500
      ? 'Gmail is temporarily unavailable; inbox sync will retry.'
      : `Gmail inbox request failed (HTTP ${response.status}).`)
  }
  return await response.json() as T
}

async function getMessage(id: string, accessToken: string): Promise<GmailFullMessage | null> {
  const url = new URL(`${GMAIL_API}/messages/${encodeURIComponent(id)}`)
  url.searchParams.set('format', 'full')
  try {
    return await gmailGet<GmailFullMessage>(url, accessToken)
  } catch (error) {
    if (error instanceof GmailApiError && error.status === 404) return null
    throw error
  }
}

async function findVerifiedMember(client: SupabaseClient, email: string): Promise<string | null> {
  const { data: profiles, error } = await client.from('profiles')
    .select('id,email')
    .ilike('email', escapeLikeValue(email))
    .limit(2)
  if (error) throw new Error('Member email lookup failed')
  const profile = (profiles || []).find(row => row.email?.trim().toLowerCase() === email)
  if (!profile) return null

  const { data, error: authError } = await client.auth.admin.getUserById(profile.id)
  const authUser = data.user
  if (authError || !authUser?.email || authUser.email.trim().toLowerCase() !== email || !authUser.email_confirmed_at) {
    return null
  }
  return authUser.id
}

function messageReferenceIds(inReplyTo: string, references: string): string[] {
  return Array.from(new Set(`${references} ${inReplyTo}`.match(/<[^<>]+>/g) || [])).slice(-20)
}

async function conversationForThread(
  client: SupabaseClient,
  threadId: string,
  userId: string,
  subject: string,
  inReplyTo: string,
  referenceHeader: string,
): Promise<{ id: string; user_id: string } | null> {
  const { data: existing, error } = await client.from('support_conversations')
    .select('id,user_id')
    .eq('gmail_thread_id', threadId)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error('Gmail thread lookup failed')
  if (existing) return existing

  const referenceIds = messageReferenceIds(inReplyTo, referenceHeader)
  if (referenceIds.length) {
    const { data: priorMessage, error: referenceError } = await client.from('support_messages')
      .select('conversation_id')
      .in('gmail_rfc_message_id', referenceIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (referenceError) throw new Error('Gmail reply reference lookup failed')
    if (priorMessage) {
      const { data: priorConversation, error: priorConversationError } = await client.from('support_conversations')
        .select('id,user_id')
        .eq('id', priorMessage.conversation_id)
        .maybeSingle()
      if (priorConversationError) throw new Error('Gmail reply conversation lookup failed')
      if (priorConversation) return priorConversation
    }
  }

  const { data: created, error: createError } = await client.from('support_conversations')
    .insert({
      user_id: userId,
      subject,
      status: 'pending_support',
      priority: 'normal',
      gmail_thread_id: threadId,
    })
    .select('id,user_id')
    .single()
  if (!createError && created) return created

  if (createError?.code === '23505') {
    const { data: raced } = await client.from('support_conversations')
      .select('id,user_id')
      .eq('gmail_thread_id', threadId)
      .limit(1)
      .maybeSingle()
    return raced || null
  }
  throw new Error('Gmail support conversation could not be created')
}

export function publishedReply(text: string): string | null {
  const match = /^MEMBER REPLY[ \t]*\r?\n([\s\S]{1,4000}?)\r?\nEND REPLY[ \t]*(?:\r?\n|$)/.exec(text.trimStart())
  return match?.[1].trim() || null
}
function plainReply(part: GmailPayloadPart): string {
  if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64Url(part.body.data)
  return part.mimeType?.startsWith('multipart/') ? (part.parts || []).map(plainReply).find(Boolean) || '' : ''
}

export async function importMessage(client: SupabaseClient, ref: GmailMessageRef, mailbox: string, accessToken: string): Promise<'imported' | 'ignored'> {
  if (!ref.id || !ref.threadId) return 'ignored'
  const { data: existing, error: existingError } = await client.from('support_messages')
    .select('id')
    .eq('gmail_message_id', ref.id)
    .maybeSingle()
  if (existingError) throw new Error('Gmail message deduplication lookup failed')
  if (existing) return 'ignored'

  const gmailMessage = await getMessage(ref.id, accessToken)
  if (!gmailMessage?.payload) return 'ignored'
  const headers = gmailMessage.payload.headers || []
  const senderEmail = parseEmail(headerValue(headers, 'From'))
  if (!senderEmail) return 'ignored'
  const recipient = headerValue(headers,'To')
  if (parseEmail(recipient) !== mailbox || /[,;]/.test(recipient)) return 'ignored'
  if (senderEmail === mailbox) {
    if (mailbox !== supportMailbox || !gmailMessage.labelIds?.includes('SENT') || headerValue(headers,'Cc') || headerValue(headers,'Bcc')) return 'ignored'
    const body = publishedReply(plainReply(gmailMessage.payload))
    if (!body) return 'ignored'
    const parent = headerValue(headers,'In-Reply-To')
    const noticeId = /^<notice\.([a-f0-9-]{36})@evermontcredit\.online>$/i.exec(parent)?.[1]
    if (!noticeId || parent !== notificationReference(noticeId)) return 'ignored'
    const {data:notice,error} = await client.from('support_notification_outbox').select('conversation_id').eq('id',noticeId)
      .eq('event_type','support_message').eq('status','sent').eq('payload->>notification_thread',ref.threadId).maybeSingle()
    if (error) throw new Error('Notification reference lookup failed')
    if (!notice) return 'ignored'
    const staff = await findVerifiedMember(client,mailbox)
    if (!staff) return 'ignored'
    const role = await client.from('admin_roles').select('role').eq('user_id',staff).maybeSingle()
    if (role.error) throw new Error('Staff permission lookup failed')
    if (!canManageSupport({id:staff,role:role.data?.role})) return 'ignored'
    const saved = await client.from('support_messages').insert({conversation_id:notice.conversation_id,sender_id:staff,
      sender_role:'support',source:'gmail',body,is_internal:false,read_by_support:true,read_by_member:false,
      delivery_status:'received',gmail_message_id:ref.id,gmail_thread_id:ref.threadId})
    if (saved.error?.code === '23505') return 'ignored'
    if (saved.error) throw new Error('Staff reply could not be saved')
    return 'imported'
  }

  const memberId = await findVerifiedMember(client, senderEmail)
  if (!memberId) return 'ignored'

  const messageBody = (extractText(gmailMessage.payload) || gmailMessage.snippet || '').trim().slice(0, 20000)
  if (!messageBody) return 'ignored'

  const inReplyTo = headerValue(headers, 'In-Reply-To')
  const rawReferences = headerValue(headers, 'References')
  const conversation = await conversationForThread(
    client,
    ref.threadId,
    memberId,
    normalizedSubject(headerValue(headers, 'Subject')),
    inReplyTo,
    rawReferences,
  )
  if (!conversation || conversation.user_id !== memberId) return 'ignored'

  const createdAt = gmailMessage.internalDate && Number.isFinite(Number(gmailMessage.internalDate))
    ? new Date(Number(gmailMessage.internalDate)).toISOString()
    : new Date().toISOString()
  const rfcMessageId = headerValue(headers, 'Message-ID').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 998) || null
  const references = `${rawReferences} ${inReplyTo}`.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 2000) || null

  const { error: insertError } = await client.from('support_messages').insert({
    conversation_id: conversation.id,
    sender_id: memberId,
    sender_role: 'member',
    body: messageBody,
    is_internal: false,
    read_by_member: true,
    read_by_support: false,
    source: 'gmail',
    gmail_message_id: ref.id,
    gmail_thread_id: ref.threadId,
    gmail_rfc_message_id: rfcMessageId,
    gmail_references: references,
    delivery_status: 'received',
  })
  if (insertError?.code === '23505') return 'ignored'
  if (insertError) throw new Error('Gmail message could not be stored')

  const { error: conversationError } = await client.from('support_conversations')
    .update({ status: 'pending_support', last_message_at: createdAt, updated_at: createdAt })
    .eq('id', conversation.id)
  if (conversationError) throw new Error('Support conversation could not be updated')
  return 'imported'
}

async function processReferences(
  client: SupabaseClient,
  refs: GmailMessageRef[],
  mailbox: string,
  accessToken: string,
): Promise<{ imported: number; ignored: number }> {
  let imported = 0
  let ignored = 0
  for (let index = 0; index < refs.length; index += 5) {
    const results = await Promise.all(refs.slice(index, index + 5).map(ref => importMessage(client, ref, mailbox, accessToken)))
    imported += results.filter(result => result === 'imported').length
    ignored += results.filter(result => result === 'ignored').length
  }
  return { imported, ignored }
}

async function updateSyncState(client: SupabaseClient, values: Record<string, string | null>): Promise<void> {
  const { error } = await client.from('support_gmail_sync_state')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', true)
  if (error) throw new Error('Gmail sync cursor could not be saved')
}

async function listMailboxPage(accessToken: string, mailbox: string, pageToken: string | null): Promise<GmailListResponse> {
  const url = new URL(`${GMAIL_API}/messages`)
  url.searchParams.set('maxResults', String(MAX_MESSAGES_PER_RUN))
  url.searchParams.set('q', `to:${mailbox} newer_than:30d`)
  if (pageToken) url.searchParams.set('pageToken', pageToken)
  return gmailGet<GmailListResponse>(url, accessToken)
}

async function bootstrapMailbox(
  client: SupabaseClient,
  state: SyncState,
  accessToken: string,
  mailbox: string,
  currentHistoryId: string,
): Promise<{ imported: number; ignored: number; nextPagePending: boolean }> {
  const baseline = state.bootstrap_history_id || currentHistoryId
  const page = await listMailboxPage(accessToken, mailbox, state.bootstrap_page_token)
  const processed = await processReferences(client, page.messages || [], mailbox, accessToken)
  const now = new Date().toISOString()
  if (page.nextPageToken) {
    await updateSyncState(client, {
      bootstrap_history_id: baseline,
      bootstrap_page_token: page.nextPageToken,
      last_error: null,
      last_synced_at: now,
      locked_until: null,
    })
    return { ...processed, nextPagePending: true }
  }

  await updateSyncState(client, {
    history_id: baseline,
    bootstrap_history_id: null,
    bootstrap_page_token: null,
    history_page_token: null,
    last_error: null,
    last_synced_at: now,
    locked_until: null,
  })
  return { ...processed, nextPagePending: false }
}

async function pollHistory(
  client: SupabaseClient,
  state: SyncState,
  accessToken: string,
  mailbox: string,
  currentHistoryId: string,
): Promise<{ imported: number; ignored: number; nextPagePending: boolean }> {
  const url = new URL(`${GMAIL_API}/history`)
  url.searchParams.set('startHistoryId', state.history_id || '')
  url.searchParams.set('historyTypes', 'messageAdded')
  url.searchParams.set('maxResults', String(MAX_MESSAGES_PER_RUN))
  if (state.history_page_token) url.searchParams.set('pageToken', state.history_page_token)

  let page: GmailHistoryResponse
  try {
    page = await gmailGet<GmailHistoryResponse>(url, accessToken)
  } catch (error) {
    if (!(error instanceof GmailApiError) || error.status !== 404) throw error
    await updateSyncState(client, {
      history_id: null,
      history_page_token: null,
      bootstrap_history_id: currentHistoryId,
      bootstrap_page_token: null,
      last_error: null,
    })
    const resetState: SyncState = {
      ...state,
      history_id: null,
      history_page_token: null,
      bootstrap_history_id: currentHistoryId,
      bootstrap_page_token: null,
    }
    return bootstrapMailbox(client, resetState, accessToken, mailbox, currentHistoryId)
  }

  const refs = Array.from(new Map((page.history || [])
    .flatMap(entry => entry.messagesAdded || [])
    .map(item => item.message)
    .filter((message): message is GmailMessageRef => Boolean(message?.id && message.threadId))
    .map(message => [message.id as string, message])).values())
  const processed = await processReferences(client, refs, mailbox, accessToken)
  const now = new Date().toISOString()
  if (page.nextPageToken) {
    await updateSyncState(client, {
      history_page_token: page.nextPageToken,
      last_error: null,
      last_synced_at: now,
      locked_until: null,
    })
    return { ...processed, nextPagePending: true }
  }

  await updateSyncState(client, {
    history_id: page.historyId || currentHistoryId,
    history_page_token: null,
    last_error: null,
    last_synced_at: now,
    locked_until: null,
  })
  return { ...processed, nextPagePending: false }
}

export async function syncSupportMailbox(client: SupabaseClient): Promise<SyncResult> {
  const context = await getGmailContext()
  if (!context.senderMatches) {
    throw new Error('The configured Gmail sender does not match the authorized Gmail account')
  }
  if (!context.historyId) throw new Error('Gmail did not provide a sync cursor')

  const { data, error } = await client.rpc('claim_support_gmail_sync', {
    p_mailbox_email: context.senderEmail,
    p_lock_seconds: 240,
  })
  if (error) throw new Error('Gmail sync lock could not be acquired; apply the support Gmail migration first')
  const state = (data as SyncState[] | null)?.[0]
  if (!state) throw new Error('Gmail sync is already running or the configured sender changed')

  try {
    const result = state.history_id
      ? await pollHistory(client, state, context.accessToken, context.senderEmail, context.historyId)
      : await bootstrapMailbox(client, state, context.accessToken, context.senderEmail, context.historyId)
    return { ...result, lastSyncedAt: new Date().toISOString() }
  } catch (error) {
    const safeError = error instanceof Error ? error.message : 'Gmail inbox sync failed'
    await updateSyncState(client, {
      last_error: safeError.slice(0, 300),
      locked_until: null,
    }).catch(() => undefined)
    throw error
  }
}
