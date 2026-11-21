import type { RequestLike, ResponseLike } from './_lib/support.js'
import { authenticateSupportUser, canManageSupport, canViewSupport, getSupabaseAdmin, setJsonHeaders } from './_lib/support.js'
import { getGmailConnectionStatus } from './_lib/gmail.js'
import { syncSupportMailbox } from './_lib/gmailSync.js'

type SyncState = {
  mailbox_email: string
  last_synced_at: string | null
  last_error: string | null
  locked_until: string | null
}

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  setJsonHeaders(response, 'GET, POST, OPTIONS')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  try {
    const client = getSupabaseAdmin()
    const user = await authenticateSupportUser(client, request)
    if (!user) {
      response.status(401).json({ error: 'Sign in to continue.' })
      return
    }

    if (request.method === 'GET') {
      if (!canViewSupport(user)) {
        response.status(403).json({ error: 'You do not have permission to view Gmail status.' })
        return
      }
      const [{ data, error }, connection] = await Promise.all([
        client.from('support_gmail_sync_state')
          .select('mailbox_email,last_synced_at,last_error,locked_until')
          .eq('id', true)
          .maybeSingle(),
        getGmailConnectionStatus(),
      ])
      if (error) throw new Error('Unable to load Gmail sync status')
      const state = data as SyncState | null
      response.status(200).json({
        connection,
        sync: state ? {
          lastSyncedAt: state.last_synced_at,
          lastError: state.last_error,
          isRunning: Boolean(state.locked_until && new Date(state.locked_until).getTime() > Date.now()),
        } : { lastSyncedAt: null, lastError: null, isRunning: false },
      })
      return
    }

    if (request.method === 'POST') {
      if (!canManageSupport(user)) {
        response.status(403).json({ error: 'You do not have permission to sync the support mailbox.' })
        return
      }
      const result = await syncSupportMailbox(client)
      response.status(200).json({ result })
      return
    }

    response.setHeader('Allow', 'GET, POST, OPTIONS')
    response.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The Gmail service could not complete this request.'
    response.status(500).json({ error: message })
  }
}
