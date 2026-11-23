import { complaintCategories } from '../../shared/supportCategories.js'

const staffAlerts = {
  handoff: 'Human support requested',
  high_priority: 'High-priority ticket',
  overdue: 'Ticket overdue',
  delivery_failure: 'Notification delivery failed',
}

type SupportEmailContent = {
  ticketId: string
  alert?: keyof typeof staffAlerts
  priority?: string
  subject: string
  memberEmail?: string
  question?: string
  received?: string
  status?: string
  memberName?: string
  notificationId: string
}

type GmailTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/\b(password|passcode|pin|cvv|cvc|otp|one[-\s]?time code|verification code)\b(\s*[:=]?\s*)([^\s,;]+)/gi, '$1$2[redacted]')
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[redacted card number]')
}

function base64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Gmail OAuth configuration is incomplete')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(10000),
  })
  const result = await response.json() as GmailTokenResponse
  if (!response.ok || !result.access_token) {
    const invalidAuthorization = result.error === 'invalid_grant' || result.error === 'invalid_client'
    throw new Error(invalidAuthorization ? 'Gmail authorization is unavailable; reconnect the authorized sender account' : 'Gmail token refresh failed')
  }
  return result.access_token
}

type GmailProfile = {
  emailAddress?: string
  historyId?: string
}

type GmailSendResult = {
  id?: string
  threadId?: string
}

export type GmailContext = {
  accessToken: string
  senderEmail: string
  accountEmail: string
  historyId: string | null
  senderMatches: boolean
}

export async function getGmailContext(): Promise<GmailContext> {
  const senderEmail = process.env.GMAIL_FROM_EMAIL?.trim().toLowerCase()
  if (!senderEmail) throw new Error('Gmail sender address is not configured')

  const accessToken = await getAccessToken()
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Gmail authorization needs the gmail.readonly scope. Re-authorize the support mailbox.')
    }
    throw new Error('Gmail mailbox verification is temporarily unavailable')
  }

  const profile = await response.json() as GmailProfile
  const accountEmail = profile.emailAddress?.trim().toLowerCase() || ''
  if (!accountEmail) throw new Error('Gmail did not return an authorized mailbox address')
  return {
    accessToken,
    senderEmail,
    accountEmail,
    historyId: profile.historyId || null,
    senderMatches: senderEmail === accountEmail,
  }
}

export async function getGmailConnectionStatus(): Promise<{
  senderEmail: string
  accountEmail: string
  senderMatches: boolean
  canReadInbox: true
}> {
  const context = await getGmailContext()
  return {
    senderEmail: context.senderEmail,
    accountEmail: context.accountEmail,
    senderMatches: context.senderMatches,
    canReadInbox: true,
  }
}

function assertGmailSenderMatches(context: GmailContext): void {
  if (!context.senderMatches) {
    throw new Error('The configured Gmail sender does not match the authorized Gmail account')
  }
}

function cleanHeader(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()
}

function encodeSubject(value: string): string {
  return `=?UTF-8?B?${Buffer.from(cleanHeader(value), 'utf8').toString('base64')}?=`
}

async function sendRawGmailMessage(accessToken: string, raw: string, threadId?: string): Promise<GmailSendResult> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64Url(raw), ...(threadId ? { threadId } : {}) }),
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Gmail rejected the sender authorization. Confirm that the OAuth grant includes gmail.send.')
    }
    if (response.status === 429 || response.status >= 500) {
      throw new Error('Gmail is temporarily unavailable; the message will be retried')
    }
    throw new Error(`Gmail rejected the message (HTTP ${response.status})`)
  }
  const result = await response.json() as GmailSendResult
  if (!result.id || !result.threadId) throw new Error('Gmail accepted the request without returning message identifiers')
  return result
}

export async function sendSupportReply(input: {
  notificationId: string
  retry: boolean
  recipient: string
  subject: string
  body: string
  threadId?: string | null
  inReplyTo?: string | null
  references?: string | null
}): Promise<GmailSendResult> {
  const recipient = input.recipient.trim().toLowerCase()
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient)) {
    throw new Error('The member email address is not valid')
  }
  const context = await getGmailContext()
  assertGmailSenderMatches(context)

  if (input.retry) {
    const previous = await previousNotification(context.accessToken,context.senderEmail,recipient,input.notificationId)
    if (previous) return previous
  }
  const headers = [
    `Message-ID: ${notificationReference(input.notificationId)}`,
    `From: EVERMONT Credit Union <${context.senderEmail}>`,
    `To: ${recipient}`,
    `Subject: ${encodeSubject(input.subject.startsWith('Re:') ? input.subject : `Re: ${input.subject}`)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
  ]
  const inReplyTo = input.inReplyTo ? cleanHeader(input.inReplyTo).slice(0, 500) : ''
  const references = input.references ? cleanHeader(input.references).slice(0, 1000) : ''
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`)
  if (references) headers.push(`References: ${references}`)
  const raw = [
    ...headers,
    '',
    Buffer.from(input.body, 'utf8').toString('base64'),
    '',
  ].join('\r\n')

  return sendRawGmailMessage(context.accessToken, raw, input.threadId || undefined)
}

export const supportMailbox = 'evermontcreditunion@gmail.com'
export function notificationReference(id: string) { return `<notice.${id}@evermontcredit.online>` }
export function createRawMessage(content: SupportEmailContent, sender: string, recipient: string): string {
  const safe = (value: string) => redactSensitiveText(cleanHeader(value)).replace(/\d(?:[ -]?\d){3,}/g, '[redacted]').slice(0,120)
  const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://v0-evermont.vercel.app'
  // Unrestricted member prose can contain secrets even without labels. Only forward
  // verbatim questions from a small, non-sensitive allowlist; keep the rest in the portal.
  const question = content.question?.trim() || ''
  const ticketCategory = complaintCategories.find((value) => content.subject.startsWith(value + ': '))
  const category = ticketCategory ?? (/statement/i.test(question) ? 'Statements' : /beneficiar/i.test(question) ? 'Beneficiaries' : /activation/i.test(question) ? 'Activation' : 'Member support')
  const excerpt = /^(where can i find my statements|how do i reset my password|how do i view my beneficiaries|how do i contact support)\??$/i.test(question) ? question : 'Member requested help. Read the original question and replies in the secure conversation.'
  const instructions = content.alert
    ? ['Open the staff portal to respond to this alert.']
    : [
        'To publish a member-visible reply, reply directly to this notification from the authorized inbox.',
        'Put MEMBER REPLY on its own line, followed by your reply, then END REPLY on its own line. Use the portal for internal notes.',
      ]
  const plain = [
    'EVERMONT • Member support',
    `Reference: ${content.ticketId}`,
    `Member: ${safe(content.memberName || 'Member')}`,
    content.alert && `Alert: ${staffAlerts[content.alert]}`,
    content.priority && ['low', 'normal', 'high', 'urgent'].includes(content.priority) && `Priority: ${content.priority}`,
    `Category: ${category}`,
    `Received: ${cleanHeader(content.received || '')}`,
    `Status: ${safe(content.status || 'Open')}`,
    `Contact: ${cleanHeader(content.memberEmail || 'See profile')}`,
    `Summary: ${excerpt}`,
    `Open securely: ${origin}/admin/support/${encodeURIComponent(content.ticketId)}`,
    ...instructions,
  ].filter(Boolean).join('\n')
  return [`From: EVERMONT Support <${sender}>`,`To: ${recipient}`,`Message-ID: ${notificationReference(content.notificationId)}`,
    `Subject: ${encodeSubject((content.alert ? staffAlerts[content.alert] : 'EVERMONT support') + ' · ' + content.ticketId + ' · ' + category)}`,
    'MIME-Version: 1.0','Content-Type: text/plain; charset="UTF-8"','Content-Transfer-Encoding: base64','', Buffer.from(plain).toString('base64')].join('\r\n')
}

export async function sendSupportTestEmail(): Promise<void> {
  const sender = process.env.GMAIL_FROM_EMAIL
  const recipient = process.env.SUPPORT_NOTIFICATION_EMAIL
  if (!sender || !recipient) throw new Error('Support email configuration is incomplete')
  const context = await getGmailContext()
  assertGmailSenderMatches(context)
  const accessToken = context.accessToken
  const subject = 'Evermont support email connection test'
  const message = [
    `From: EVERMONT Credit Union <${sender}>`,
    `To: ${recipient}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from('This is a test message from the Evermont support inbox. No member information is included. Gmail delivery is connected if you received this message.', 'utf8').toString('base64'),
    '',
  ].join('\r\n')
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64Url(message) }),
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Gmail rejected the sender authorization. Confirm that the OAuth grant includes gmail.send.')
    if (response.status === 429 || response.status >= 500) throw new Error('Gmail is temporarily unavailable. Try the connection test again later.')
    throw new Error(`Gmail rejected the test message (HTTP ${response.status})`)
  }
}

async function previousNotification(accessToken: string, sender: string, recipient: string, id: string) {
    const query = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages')
    query.searchParams.set('q', `in:sent from:${sender} to:${recipient} rfc822msgid:${notificationReference(id).slice(1,-1)}`)
    const response = await fetch(query, {headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.timeout(10000)})
    if (!response.ok) throw new Error('Unable to reconcile earlier Gmail notification delivery')
    const previous = (await response.json()).messages?.[0]
    if (previous?.id && previous.threadId) return {id:previous.id,threadId:previous.threadId}
    return null
}

export async function sendSupportEmail(content: SupportEmailContent, retry = false): Promise<GmailSendResult> {
  const context = await getGmailContext()
  assertGmailSenderMatches(context)
  if (context.senderEmail !== supportMailbox || process.env.SUPPORT_NOTIFICATION_EMAIL?.trim().toLowerCase() !== supportMailbox) {
    throw new Error('Support notification mailbox does not match the authorized inbox')
  }
  if (retry) {
    // Reconcile an accepted send whose outbox acknowledgement may have failed.
    const previous = await previousNotification(context.accessToken,supportMailbox,supportMailbox,content.notificationId)
    if (previous) return previous
  }
  return sendRawGmailMessage(context.accessToken,createRawMessage(content,supportMailbox,supportMailbox))
}
