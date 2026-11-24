import { supabase } from '@/lib/supabase'

export async function markLoadedSupportRepliesRead(conversationId: string, messageIds: string[]): Promise<string[]> {
  const uniqueMessageIds = [...new Set(messageIds)].slice(0, 500)
  if (!conversationId || uniqueMessageIds.length === 0) return []

  const { data, error } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token
  if (error || !accessToken) throw new Error('Sign in again to update support read receipts.')

  const response = await fetch('/api/support', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'read', conversationId, messageIds: uniqueMessageIds }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Unable to update support read receipts.')

  const result = await response.json() as { readMessageIds?: string[] }
  return Array.isArray(result.readMessageIds) ? result.readMessageIds : []
}
