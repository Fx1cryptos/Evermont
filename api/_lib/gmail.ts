type SupportEmailContent = {
  ticketId: string
  subject: string
  memberName?: string
  memberEmail?: string
  body: string
  createdAt: string
  priority: string
  status: string
}

type GmailTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
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

function createRawMessage(content: SupportEmailContent, sender: string, recipient: string): string {
  const safeBody = redactSensitiveText(content.body)
  const ticket = content.ticketId.slice(0, 8).toUpperCase()
  const subject = `Evermont support [${ticket}]: ${content.subject}`
  const plainText = [
    'EVERMONT Credit Union — Support notification',
    `Ticket: ${ticket}`,
    `Member: ${content.memberName || 'Not provided'}`,
    `Email: ${content.memberEmail || 'Not available'}`,
    `Subject: ${content.subject}`,
    `Submitted: ${new Date(content.createdAt).toISOString()}`,
    `Priority: ${content.priority}`,
    `Status: ${content.status}`,
    '',
    'Customer message:',
    safeBody,
    '',
    `Open conversation: https://evermontcredit.online/admin/support/${encodeURIComponent(content.ticketId)}`,
  ].join('\n')
  const html = `<!doctype html><html><body style="margin:0;background:#f3f5f9;font-family:Arial,sans-serif;color:#07142D"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden"><tr><td style="background:#0504AA;padding:24px 28px;color:#fff"><div style="font-size:12px;letter-spacing:2px;font-weight:bold">EVERMONT CREDIT UNION</div><div style="margin-top:7px;color:#e9d38a;font-size:13px">Where Private Wealth Is Protected.</div></td></tr><tr><td style="padding:28px"><div style="font-size:12px;color:#64748b">SUPPORT TICKET · ${escapeHtml(ticket)}</div><h1 style="font-size:21px;margin:8px 0 18px;color:#07142D">${escapeHtml(content.subject)}</h1><table role="presentation" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.8;color:#334155"><tr><td style="padding-right:12px;color:#64748b">Member</td><td>${escapeHtml(content.memberName || 'Not provided')}</td></tr><tr><td style="padding-right:12px;color:#64748b">Email</td><td>${escapeHtml(content.memberEmail || 'Not available')}</td></tr><tr><td style="padding-right:12px;color:#64748b">Submitted</td><td>${escapeHtml(new Date(content.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }))} UTC</td></tr><tr><td style="padding-right:12px;color:#64748b">Priority</td><td>${escapeHtml(content.priority)}</td></tr><tr><td style="padding-right:12px;color:#64748b">Status</td><td>${escapeHtml(content.status)}</td></tr></table><div style="margin-top:22px;padding:18px;background:#f8fafc;border-left:3px solid #C9A227;border-radius:6px;white-space:pre-wrap;line-height:1.65">${escapeHtml(safeBody)}</div><p style="margin:24px 0 0"><a href="https://evermontcredit.online/admin/support/${encodeURIComponent(content.ticketId)}" style="display:inline-block;background:#0504AA;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Open secure support ticket</a></p><p style="font-size:11px;color:#64748b;margin-top:24px">Built on Integrity. Guided by Excellence.</p></td></tr></table></td></tr></table></body></html>`
  const boundary = `evermont_${crypto.randomUUID().replace(/-/g, '')}`
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`
  return [
    `From: EVERMONT Credit Union <${sender}>`,
    `To: ${recipient}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(plainText, 'utf8').toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf8').toString('base64'),
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

export async function sendSupportTestEmail(): Promise<void> {
  const sender = process.env.GMAIL_FROM_EMAIL
  const recipient = process.env.SUPPORT_NOTIFICATION_EMAIL
  if (!sender || !recipient) throw new Error('Support email configuration is incomplete')
  const accessToken = await getAccessToken()
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

export async function sendSupportEmail(content: SupportEmailContent): Promise<void> {
  const sender = process.env.GMAIL_FROM_EMAIL
  const recipient = process.env.SUPPORT_NOTIFICATION_EMAIL
  if (!sender || !recipient) throw new Error('Support email configuration is incomplete')

  const accessToken = await getAccessToken()
  const raw = base64Url(createRawMessage(content, sender, recipient))
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Gmail rejected the sender authorization or gmail.send scope')
    if (response.status === 429 || response.status >= 500) throw new Error('Gmail is temporarily unavailable; the notification will be retried')
    throw new Error(`Gmail rejected the notification (HTTP ${response.status})`)
  }
}
