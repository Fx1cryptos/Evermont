import { supabase } from '@/lib/supabase'

const descriptions = {
  activated: ['Active', 'Your membership activation has been verified.'],
  pending: ['Pending', 'Verification is in progress. Check back here for an update.'],
  action_required: ['Action required', 'Contact member support about the outstanding requirement.'],
  not_activated: ['Not activated', 'Your membership record shows activation is incomplete.'],
  missing: [
    'No activation record',
    'No activation record was returned for your membership. Contact support if you expected one.',
  ],
} as const

export function activationResult(value: unknown, missing = false) {
  const key = missing ? 'missing' : String(value ?? '').toLowerCase()
  if (!Object.prototype.hasOwnProperty.call(descriptions, key) || (!missing && key === 'missing')) {
    throw new Error('Your activation status is not recognized. Please contact support.')
  }
  const [label, detail] = descriptions[key as keyof typeof descriptions]
  return { activated: key === 'activated', label, detail }
}

export async function readActivation(expectedUser: string | undefined) {
  const { data, error: authError } = await supabase.auth.getUser()
  if (authError || !expectedUser || data.user?.id !== expectedUser) {
    throw new Error(
      authError?.name === 'AuthRetryableFetchError'
        ? 'The verification service is unreachable. Check your connection and retry.'
        : 'Your session could not be verified. Sign in again.',
    )
  }
  const owner = data.user.id
  // The view represents a membership. Account-specific operations separately enforce account ownership in RLS.
  const {
    data: rows,
    error,
    status,
  } = await supabase.from('user_activation_status').select('user_id,activation_status').eq('user_id', owner)
  if (error) {
    if (status === 401 || status === 403 || error.code === '42501')
      throw new Error('Access to your activation record was denied. Sign in again or contact support.')
    throw new Error(
      status === 0
        ? 'The verification service is unreachable. Check your connection and retry.'
        : 'The activation service is temporarily unavailable. Please retry.',
    )
  }
  if (!Array.isArray(rows) || rows.some((row) => row.user_id !== owner))
    throw new Error('Your activation record could not be verified.')
  if (!rows.length) return activationResult(null, true)
  const owned = await supabase.from('accounts').select('id,user_id').eq('user_id', owner).limit(1)
  if (owned.error)
    throw new Error(
      owned.status === 403
        ? 'Access to your account record was denied. Contact support.'
        : 'Account ownership could not be verified. Please retry.',
    )
  if (!owned.data?.length || owned.data[0].user_id !== owner)
    throw new Error('No owned account could be verified. Contact member support.')
  const states = new Set(rows.map((row) => String(row.activation_status ?? '').toLowerCase()))
  if (states.size !== 1)
    throw new Error('Your activation records have different statuses. Please contact member support.')
  return activationResult(rows[0].activation_status)
}
