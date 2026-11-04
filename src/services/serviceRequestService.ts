import { supabase } from '@/lib/supabase'

const TABLE = 'service_requests'
const BUCKET = 'service-request-images'

export type ServiceRequestDraft = {
  serviceType: 'ach' | 'mobile_deposit' | 'check_deposit' | 'wire'
  amount: number
  summary: string
  accountLast4?: string | null
  depositAccountId?: string | null
}

function missingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const code = error.code || ''
  const message = (error.message || '').toLowerCase()
  return code === 'PGRST205' || code === '42P01' || message.includes('schema cache') || message.includes('does not exist') || message.includes('bucket not found') || message.includes('not found')
}

/** True only when the unapplied migration's table is actually present. */
export async function serviceRequestTableReady(): Promise<boolean> {
  const { error } = await supabase.from(TABLE).select('id').limit(1)
  if (!error) return true
  if (missingRelation(error)) return false
  throw error
}

export async function serviceImageBucketReady(): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET).list('', { limit: 1 })
  if (!error) return true
  if (missingRelation(error)) return false
  throw error
}

/**
 * Inserts a pending request. Callers must already know the table exists.
 * Full account numbers are never sent. This does not write ledger rows.
 */
export async function insertPendingServiceRequest(memberId: string, draft: ServiceRequestDraft): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    member_id: memberId,
    created_by: memberId,
    service_type: draft.serviceType,
    status: 'pending',
    amount: draft.amount,
    currency: 'USD',
    summary: draft.summary,
    account_last4: draft.accountLast4 ?? null,
    deposit_account_id: draft.depositAccountId ?? null,
  })
  if (error) throw error
}
