import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const INTENDED_SUPABASE_REF = 'gdodqiwjcezdznzroupw'
const INTENDED_SUPABASE_URL = `https://${INTENDED_SUPABASE_REF}.supabase.co`

type KeyKind = 'publishable' | 'anon' | 'rejected'

type FetchLike = (
  input: string,
  init?: { headers?: Record<string, string>; redirect?: 'manual' },
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
function classifyClientKey(key: string): { kind: KeyKind; detail: string } {
  if (key.startsWith('sb_secret_')) return { kind: 'rejected', detail: 'secret key' }
  if (key.startsWith('sb_publishable_')) return { kind: 'publishable', detail: 'publishable key' }
  const parts = key.split('.')
  if (parts.length === 3 && parts[0].startsWith('eyJ')) {
    const payload = decodeJwtPayload(parts[1])
    if (!payload) return { kind: 'rejected', detail: 'unreadable JWT' }
    if (payload.role === 'service_role') return { kind: 'rejected', detail: 'service-role key' }
    if (payload.role !== 'anon') return { kind: 'rejected', detail: `JWT role ${payload.role || 'unknown'}` }
    if (payload.ref !== INTENDED_SUPABASE_REF) {
      return { kind: 'rejected', detail: `anon key for project ${payload.ref || 'unknown'}` }
    }
    return { kind: 'anon', detail: 'anon key' }
  }
  return { kind: 'rejected', detail: 'not an anon or publishable key' }
}

async function probePublishableKey(url: string, key: string): Promise<'accepted' | 'rejected' | 'unreachable'> {
  const fetchFn = (globalThis as { fetch?: FetchLike }).fetch
  if (!fetchFn) return 'unreachable'
  try {
    const response = await Promise.race([
      fetchFn(`${url}/auth/v1/health`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        redirect: 'manual',
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 10000)
      }),
    ])
    return response.status === 200 ? 'accepted' : 'rejected'
  } catch {
    return 'unreachable'
  }
}

function resolveSupabaseUrl(env: Record<string, string>): string {
  const candidates: Array<[string, string | undefined]> = [
    ['VITE_SUPABASE_URL', env.VITE_SUPABASE_URL],
    ['NEXT_PUBLIC_SUPABASE_URL', env.NEXT_PUBLIC_SUPABASE_URL],
    ['SUPABASE_URL', env.SUPABASE_URL],
  ]
  for (const [name, value] of candidates) {
    if (!value?.trim()) continue
    const ref = projectRefFromUrl(value)
    if (ref === INTENDED_SUPABASE_REF) return INTENDED_SUPABASE_URL
    console.warn(
      `[evermont] Ignoring ${name}: project ref ${ref || 'unrecognized'} is not ${INTENDED_SUPABASE_REF}.`,
    )
  }
  return INTENDED_SUPABASE_URL
}

async function resolveSupabaseAnonKey(env: Record<string, string>, supabaseUrl: string): Promise<string> {
  // Named public vars first. SUPABASE_API / SUPABASE_API_2 are last because
  // those names are ambiguous, but they are still classified and probed:
  // only a publishable key the intended project accepts can be embedded.
  // Service-role, secret, JWT secret, and Postgres variables are never read.
  const candidates: Array<[string, string | undefined]> = [
    ['VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY],
    ['SUPABASE_PUBLISHABLE_KEY', env.SUPABASE_PUBLISHABLE_KEY],
    ['SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY],
    ['SUPABASE_API_2', env.SUPABASE_API_2],
    ['SUPABASE_API', env.SUPABASE_API],
  ]
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
    const classified = classifyClientKey(key)
    if (classified.kind === 'rejected') {
      notes.push(`${name}: ${classified.detail}`)
      continue
    }
    if (classified.kind === 'anon') {
      console.warn(`[evermont] Using anon key from ${name} for project ${INTENDED_SUPABASE_REF}.`)
      return key
    }
    const probe = await probePublishableKey(supabaseUrl, key)
    if (probe === 'accepted') {
      console.warn(`[evermont] Using publishable key from ${name} for project ${INTENDED_SUPABASE_REF}.`)
      return key
    }
    if (probe === 'unreachable') unreachable = true
    notes.push(`${name}: publishable key ${probe === 'unreachable' ? 'could not be verified' : 'was rejected by the project'}`)
  }

  const summary = notes.length ? ` Checked: ${notes.join('; ')}.` : ' No public key variables were set.'
  const reason = unreachable
    ? `Could not verify a public Supabase key for project ${INTENDED_SUPABASE_REF}.${summary}`
    : `No public anon or publishable key was accepted by project ${INTENDED_SUPABASE_REF}.${summary}`
  console.error(`[evermont] ${reason}`)
  throw new Error(`[evermont] ${reason}`)
}

export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = resolveSupabaseUrl(env)
  const supabaseAnonKey = await resolveSupabaseAnonKey(env, supabaseUrl)

  return {
    plugins: [react()],
    ssr: { noExternal: ['react-helmet-async'] },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      allowedHosts: true,
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})
