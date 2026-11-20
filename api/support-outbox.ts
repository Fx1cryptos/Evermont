import { timingSafeEqual } from 'node:crypto'
import type { RequestLike, ResponseLike } from './_lib/support'
import { getSupabaseAdmin, setJsonHeaders } from './_lib/support'
import { processNotificationBatch } from './_lib/notifications'

function authorized(request: RequestLike): boolean {
  const expected = process.env.CRON_SECRET
  const header = request.headers.authorization
  if (!expected || typeof header !== 'string' || !header.startsWith('Bearer ')) return false
  const supplied = Buffer.from(header.slice(7))
  const secret = Buffer.from(expected)
  return supplied.length === secret.length && timingSafeEqual(supplied, secret)
}

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  setJsonHeaders(response, 'GET, POST, OPTIONS')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST, OPTIONS')
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }
  if (!authorized(request)) {
    response.status(401).json({ error: 'Unauthorized.' })
    return
  }

  try {
    const result = await processNotificationBatch(getSupabaseAdmin())
    response.status(200).json(result)
  } catch {
    response.status(500).json({ error: 'Notification processing failed.' })
  }
}
