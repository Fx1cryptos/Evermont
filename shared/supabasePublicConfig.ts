const INTENDED_SUPABASE_REF = 'gdodqiwjcezdznzroupw'


type KeyKind = 'publishable' | 'anon' | 'rejected'

type FetchLike = (
  input: string,
  init?: { headers?: Record<string, string | undefined>; redirect?: 'manual'; signal?: AbortSignal },
) => Promise<{ status: number }>

function projectRefFromUrl(value: string | undefined): string | null {
  if (!value) return null
  const match = value.trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/)
  return match?.[1] ?? null
}

function decodeJwtPayload(segment: string): { role?: string; ref?: string } | null {
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (segment.length % 4)) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { role?: string; ref?: string }
  } catch {
    return null
  }
}

/**
 * Classifies a candidate client key. Service-role, secret, and other-project
 * anon keys are rejected before any network call. Publishable keys carry no
 * project ref, so the caller must ask the intended project to accept them.
 */
function classifyClientKey(key: string, ref: string): { kind: KeyKind; detail: string } {
  if (key.startsWith('sb_secret_')) return { kind: 'rejected', detail: 'secret key' }
  if (key.startsWith('sb_publishable_')) return { kind: 'publishable', detail: 'publishable key' }
  const parts = key.split('.')
  if (parts.length === 3 && parts[0].startsWith('eyJ')) {
    const payload = decodeJwtPayload(parts[1])
    if (!payload) return { kind: 'rejected', detail: 'unreadable JWT' }
    if (payload.role === 'service_role') return { kind: 'rejected', detail: 'service-role key' }
    if (payload.role !== 'anon') return { kind: 'rejected', detail: 'unexpected JWT role' }
    if (payload.ref !== ref) {
      return { kind: 'rejected', detail: 'other-project anon key' }
    }
    return { kind: 'anon', detail: 'anon key' }
  }
  return { kind: 'rejected', detail: 'not an anon or publishable key' }
}

async function probePublishableKey(url: string, key: string): Promise<'accepted' | 'rejected' | 'unreachable'> {
  const fetchFn = (globalThis as { fetch?: FetchLike }).fetch
  if (!fetchFn) return 'unreachable'
  try {
    const response = await fetchFn(`${url}/auth/v1/health`, {
      headers:{apikey:key}, redirect:'manual', signal:AbortSignal.timeout(10000)
    })
    return response.status === 200 ? 'accepted' : 'rejected'
  } catch {
    return 'unreachable'
  }
}

type TargetEnv = Record<string, string | undefined>

// A private scheduler may not receive Vercel metadata. Honor its staging pin too.
export function requiresStagingTarget(env: TargetEnv): boolean {
  return env.VERCEL_ENV === 'preview' ||
    (env.VERCEL_ENV !== 'production' && env.STAGING_SUPABASE_PROJECT_REF !== undefined)
}

export function resolveSupabaseUrl(env: Record<string, string | undefined>, requireBrowserUrl = false): string {
  if (requiresStagingTarget(env)) {
    const expected = env.STAGING_SUPABASE_PROJECT_REF?.trim()
    if (!expected || !/^[a-z0-9]+$/.test(expected) || expected === INTENDED_SUPABASE_REF)
      throw new Error('Preview requires a non-production STAGING_SUPABASE_PROJECT_REF.')
    if (projectRefFromUrl(env.VITE_SUPABASE_URL) !== expected ||
        projectRefFromUrl(env.SUPABASE_URL) !== expected ||
        (env.NEXT_PUBLIC_SUPABASE_URL !== undefined && projectRefFromUrl(env.NEXT_PUBLIC_SUPABASE_URL) !== expected))
      throw new Error('Preview Supabase URLs must all match the approved staging project.')
    return `https://${expected}.supabase.co`
  }
  if (requireBrowserUrl && !env.VITE_SUPABASE_URL?.trim()) throw new Error('Set VITE_SUPABASE_URL explicitly for this build.')
  const value = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
  const ref = projectRefFromUrl(value)
  if (!ref) throw new Error('Set VITE_SUPABASE_URL to a valid HTTPS Supabase project URL.')
  if (env.VERCEL_ENV === 'production' && ref !== INTENDED_SUPABASE_REF)
    throw new Error('Production Supabase target does not match the approved project.')
  for (const alternate of [env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL]) {
    if (alternate && projectRefFromUrl(alternate) !== ref)
      throw new Error('Frontend and server Supabase targets disagree.')
  }
  return `https://${ref}.supabase.co`
}

export async function resolveSupabaseAnonKey(env: Record<string, string | undefined>, supabaseUrl: string): Promise<string> {
  const ref = projectRefFromUrl(supabaseUrl)
  if (!ref) throw new Error('Invalid Supabase project URL.')
  const candidates = [
    ['VITE_SUPABASE_PUBLISHABLE_KEY', env.VITE_SUPABASE_PUBLISHABLE_KEY],
    ['VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY],
    ['SUPABASE_PUBLISHABLE_KEY', env.SUPABASE_PUBLISHABLE_KEY],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY],
    ['SUPABASE_API_2', env.SUPABASE_API_2],
    ['SUPABASE_API', env.SUPABASE_API],
  ] as const
  const notes: string[] = []
  const seen = new Set<string>()
  let unreachable = false

  for (const [name, raw] of candidates) {
    const key = raw?.trim()
    if (!key) continue
    if (seen.has(key)) {
      notes.push(`${name}: duplicate of a key already checked`)
      continue
    }
    seen.add(key)
    const classified = classifyClientKey(key,ref)
    if (classified.kind === 'rejected') {
      notes.push(`${name}: ${classified.detail}`)
      continue
    }
    if (classified.kind === 'anon') {
      console.warn(`[evermont] Using anon key from ${name} for project ${ref}.`)
      return key
    }
    const probe = await probePublishableKey(supabaseUrl, key)
    if (probe === 'accepted') {
      console.warn(`[evermont] Using publishable key from ${name} for project ${ref}.`)
      return key
    }
    if (probe === 'unreachable') unreachable = true
    notes.push(`${name}: publishable key ${probe === 'unreachable' ? 'could not be verified' : 'was rejected by the project'}`)
  }

  const summary = notes.length ? ` Checked: ${notes.join('; ')}.` : ' No public key variables were set.'
  const reason = unreachable
    ? `Could not verify a public Supabase key for project ${ref}.${summary}`
    : `No public anon or publishable key was accepted by project ${ref}.${summary}`
  console.error(`[evermont] ${reason}`)
  throw new Error(`[evermont] ${reason}`)
}
