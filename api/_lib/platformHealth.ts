import type { SupabaseClient } from '@supabase/supabase-js'
import { getGmailConnectionStatus, supportMailbox } from './gmail.js'

type State = 'available' | 'unavailable' | 'not_configured'
type Check = { state: State; detail: string }
const unavailable = (detail: string): Check => ({state:'unavailable',detail})

export async function geminiStatus(): Promise<Check> {
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

export async function gmailStatus(): Promise<Check> {
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

async function authAvailable(): Promise<boolean> {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !key) return false
  try {
    const result = await fetch(new URL('/auth/v1/health', base), {
      headers: { apikey: key },
      redirect: 'error',
      signal: AbortSignal.timeout(6000),
    })
    if (!result.ok) return false
    const metadata = await result.json()
    return metadata?.name === 'GoTrue'
  } catch {
    return false
  }
}

export async function probePlatform(client: SupabaseClient): Promise<string[]> {
  const [gemini, gmail, auth, database] = await Promise.all([
    geminiStatus(),
    gmailStatus(),
    authAvailable(),
    client.from('support_notification_outbox').select('id', {head:true}).limit(1)
      .abortSignal(AbortSignal.timeout(6000)),
  ])
  const failed = []
  if (gemini.state !== 'available') failed.push('gemini')
  if (gmail.state !== 'available') failed.push('gmail')
  if (!auth) failed.push('authentication')
  if (database.error) failed.push('database')
  return failed
}
