import { timingSafeEqual } from 'node:crypto'
import type { RequestLike, ResponseLike } from './_lib/support.js'
import { getSupabaseAdmin, setJsonHeaders } from './_lib/support.js'
import { processSupportNotificationBatch } from './_lib/notifications.js'

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  setJsonHeaders(response, 'POST')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const expected = process.env.CRON_SECRET
  const authorization = request.headers.authorization
  const supplied = typeof authorization === 'string' ? authorization.match(/^Bearer\s+(.+)$/i)?.[1] : undefined
  if (!expected || !supplied) {
    response.status(expected ? 401 : 503).json({ error: 'Worker authorization is unavailable.' })
    return
  }

  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    response.status(401).json({ error: 'Unauthorized.' })
    return
  }

  try {
    const result = await processSupportNotificationBatch(getSupabaseAdmin(), 20)
    response.status(200).json(result)
  } catch {
    response.status(503).json({ error: 'Support notification processing is temporarily unavailable.' })
  }
}
