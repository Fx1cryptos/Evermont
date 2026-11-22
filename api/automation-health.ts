import { authenticateSupportUser, getBearerToken, getSupabaseAdmin, setJsonHeaders, type RequestLike, type ResponseLike } from './_lib/support.js'
import { getGmailConnectionStatus, supportMailbox } from './_lib/gmail.js'

type State = 'available' | 'unavailable' | 'not_configured'
type Check = { state: State; detail: string }
const unavailable = (detail: string): Check => ({state:'unavailable',detail})

async function geminiStatus(): Promise<Check> {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!key || !model) return {state:'not_configured',detail:'Gemini configuration is incomplete.'}
  if (!/^gemini-[a-z0-9.-]+$/.test(model)) return unavailable('Model configuration is invalid.')
  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}`, {
      headers:{'x-goog-api-key':key}, signal:AbortSignal.timeout(6000),
    })
    if (!result.ok) return unavailable('Model availability could not be verified.')
    const metadata = await result.json() as {supportedGenerationMethods?: string[]}
    return metadata.supportedGenerationMethods?.includes('generateContent')
      ? {state:'available',detail:'Model metadata supports generateContent; responses have not been checked.'}
      : unavailable('Model does not advertise generateContent.')
  } catch { return unavailable('Model availability could not be checked.') }
}

async function gmailStatus(): Promise<Check> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN || !process.env.GMAIL_FROM_EMAIL || !process.env.SUPPORT_NOTIFICATION_EMAIL) {
    return {state:'not_configured',detail:'Gmail configuration is incomplete.'}
  }
  try {
    const status = await getGmailConnectionStatus()
    if (!status.senderMatches || status.accountEmail !== supportMailbox || process.env.SUPPORT_NOTIFICATION_EMAIL.trim().toLowerCase() !== supportMailbox)
      return unavailable('The authorized support mailbox does not match the configured inbox.')
    return {state:'available',detail:'Mailbox access verified; message delivery has not been checked.'}
  } catch { return unavailable('Mailbox access could not be verified.') }
}

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  setJsonHeaders(response,'GET, OPTIONS')
  if (request.method === 'OPTIONS') { response.status(204).end(); return }
  if (request.method !== 'GET') { response.status(405).json({error:'Method not allowed.'}); return }
  if (!getBearerToken(request)) { response.status(401).json({error:'Sign in to continue.'}); return }
  try {
    const client = getSupabaseAdmin()
    const user = await authenticateSupportUser(client,request)
    if (!user) { response.status(401).json({error:'Sign in to continue.'}); return }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      response.status(403).json({error:'Administrator access required.'}); return
    }
    const [gemini,gmail,openTickets,failedMail,lastSync] = await Promise.all([
      geminiStatus(),gmailStatus(),
      client.from('support_conversations').select('id',{count:'exact',head:true}).in('status',['open','pending_support','pending_member']),
      client.from('support_notification_outbox').select('id',{count:'exact',head:true}).eq('status','failed'),
      client.from('support_gmail_sync_state').select('last_synced_at').eq('id',true).maybeSingle(),
    ])
    response.status(200).json({
      checkedAt:new Date().toISOString(),
      authentication:{state:'available',detail:'The administrator session was verified.'},
      database:{state:'available',detail:'The administrator role lookup succeeded.'},
      gemini,gmail,
      supportOpen: openTickets.error ? null : openTickets.count,
      failedNotifications: failedMail.error ? null : failedMail.count,
      lastMailboxSync: lastSync.error ? null : lastSync.data?.last_synced_at ?? null,
    })
  } catch {
    response.status(503).json({error:'Automation status is unavailable.'})
  }
}
