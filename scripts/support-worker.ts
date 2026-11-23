// One bounded run for a private scheduler. Never expose this as a public HTTP route.
import { randomUUID } from 'node:crypto'
import { probePlatform } from '../api/_lib/platformHealth.js'
import { getSupabaseAdmin } from '../api/_lib/support.js'
import { processSupportNotificationBatch } from '../api/_lib/notifications.js'
import { syncSupportMailbox } from '../api/_lib/gmailSync.js'

if (process.argv[2] !== '--deliver-and-sync') {
  console.error('Delivery is disabled. Supply --deliver-and-sync only for an authorized mailbox run.')
  process.exitCode = 2
} else {
  const id = randomUUID()
  const started = new Date().toISOString()
  console.info({event:'support.worker.started', executionId:id})
  const client = getSupabaseAdmin()
  const [outbound] = await Promise.allSettled([processSupportNotificationBatch(client)])
  const [inbound] = await Promise.allSettled([syncSupportMailbox(client)])
  // Job rows and the Gmail cursor hold error details. Never print member messages.
  console.log('Outbox:', outbound.status === 'fulfilled' ? outbound.value : 'unavailable')
  console.log('Mailbox:', inbound.status === 'fulfilled' ? inbound.value : 'unavailable')
  const failed = []
  if (outbound.status === 'rejected' || outbound.value.failed > 0) failed.push('outbox')
  if (inbound.status === 'rejected') failed.push('mailbox_sync')
  if (process.argv.includes('--record-health')) {
    failed.push(...await probePlatform(client))
    const {error} = await client.from('support_worker_health').insert({
      id, started_at: started, finished_at: new Date().toISOString(), failed_checks: failed,
    }).abortSignal(AbortSignal.timeout(6000))
    if (error) {
      console.error({event:'support.worker.health_record_failed', executionId:id})
      process.exitCode = 1
    }
  }
  console.info({event:'support.worker.finished', executionId:id, failedChecks:failed})
  if (failed.length) process.exitCode = 1
}
