import { authenticateSupportUser, getBearerToken, getSupabaseAdmin, setJsonHeaders, type RequestLike, type ResponseLike } from './_lib/support.js'
import { geminiStatus, gmailStatus } from './_lib/platformHealth.js'

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
    const [gemini,gmail,openTickets,failedMail,lastSync,recentJobs,latestRun,lastHealthy,failures] = await Promise.all([
      geminiStatus(),gmailStatus(),
      client.from('support_conversations').select('id',{count:'exact',head:true}).in('status',['open','pending_support','pending_member']),
      client.from('support_notification_outbox').select('id',{count:'exact',head:true}).eq('status','failed'),
      client.from('support_gmail_sync_state').select('last_synced_at').eq('id',true).maybeSingle(),
      client.from('support_notification_outbox')
        .select('status,attempt_count,updated_at')
        .in('status', ['sent', 'failed'])
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(10),
      client.from('support_worker_health')
        .select('id,finished_at,failed_checks').order('finished_at', {ascending:false}).limit(1).maybeSingle(),
      client.from('support_worker_health')
        .select('finished_at').eq('healthy', true).order('finished_at', {ascending:false}).limit(1).maybeSingle(),
      client.from('support_worker_health')
        .select('id,finished_at,failed_checks').eq('healthy', false).order('finished_at', {ascending:false}).limit(5),
    ])
    response.status(200).json({
      checkedAt:new Date().toISOString(),
      authentication:{state:'available',detail:'The administrator session was verified.'},
      database:{state:'available',detail:'The administrator role lookup succeeded.'},
      gemini,gmail,
      workerHealth: latestRun.error || lastHealthy.error || failures.error ? null : {
        latest: latestRun.data,
        lastSuccess: lastHealthy.data?.finished_at ?? null,
        recentFailures: failures.data ?? [],
      },
      supportOpen: openTickets.error ? null : openTickets.count,
      failedNotifications: failedMail.error ? null : failedMail.count,
      recentNotifications: recentJobs.error ? null : recentJobs.data?.map(job => ({
        status: job.status,
        attempts: job.attempt_count,
        updatedAt: job.updated_at,
      })) ?? null,
      lastMailboxSync: lastSync.error ? null : lastSync.data?.last_synced_at ?? null,
    })
  } catch {
    response.status(503).json({error:'Automation status is unavailable.'})
  }
}
