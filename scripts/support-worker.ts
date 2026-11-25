// One bounded run for a private scheduler. Never expose this as a public HTTP route.
import { getSupabaseAdmin } from '../api/_lib/support.js'
import { processSupportNotificationBatch } from '../api/_lib/notifications.js'
import { assistMember } from '../api/_lib/assistant.js'
import { syncSupportMailbox } from '../api/_lib/gmailSync.js'

if (process.argv[2] !== '--deliver-and-sync') {
  console.error('Delivery is disabled. Supply --deliver-and-sync only for an authorized mailbox run.')
  process.exitCode = 2
} else {
  const client = getSupabaseAdmin()
  const recovery = await client.rpc('expired_support_turns')
  if (recovery.error) process.exitCode = 1
  for (const turn of recovery.data ?? []) {
    try { await assistMember(client,turn.ticket,turn.member,turn.message) }
    catch { console.warn({event:'support.ai.recovery_failed'}); process.exitCode = 1 }
  }
  const [outbound] = await Promise.allSettled([processSupportNotificationBatch(client)])
  const [inbound] = await Promise.allSettled([syncSupportMailbox(client)])
  // Job rows and the Gmail cursor hold error details. Never print member messages.
  console.log('Outbox:', outbound.status === 'fulfilled' ? outbound.value : 'unavailable')
  console.log('Mailbox:', inbound.status === 'fulfilled' ? inbound.value : 'unavailable')
  if (outbound.status === 'rejected' || inbound.status === 'rejected' || outbound.value.failed > 0)
    process.exitCode = 1
}
