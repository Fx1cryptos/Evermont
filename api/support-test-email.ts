import type { RequestLike, ResponseLike } from './_lib/support.js'
import { getBearerToken, authenticateSupportUser, canManageSupport, getSupabaseAdmin, setJsonHeaders } from './_lib/support.js'
import { sendSupportTestEmail } from './_lib/gmail.js'

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  setJsonHeaders(response, 'POST, OPTIONS')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS')
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }
  if (!getBearerToken(request)) {
    response.status(401).json({ error: 'Sign in to continue.' })
    return
  }
  try {
    const client = getSupabaseAdmin()
    const user = await authenticateSupportUser(client, request)
    if (!user) {
      response.status(401).json({ error: 'Sign in to continue.' })
      return
    }
    if (!canManageSupport(user)) {
      response.status(403).json({ error: 'Only authorized support staff can send a test email.' })
      return
    }
    await sendSupportTestEmail()
    response.status(200).json({ sent: true, message: 'Test email sent to the configured support notification address.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail test failed.'
    const publicMessage = message.includes('gmail.send')
      ? message
      : message.includes('configuration is incomplete')
        ? 'Gmail sender or notification recipient is not configured.'
        : 'Gmail could not send the test email. Check the sender authorization and retry.'
    response.status(502).json({ error: publicMessage })
  }
}
