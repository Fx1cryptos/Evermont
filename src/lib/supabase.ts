import { createClient } from '@supabase/supabase-js'
import { authLink } from '@/lib/authCallback'
import { authStorage } from '@/lib/authStorage'

// Capture the email or recovery redirect before the client removes it from the URL.
void authLink

/** Intended Supabase project. Public client keys for any other project are ignored. */
export const INTENDED_SUPABASE_REF = 'gdodqiwjcezdznzroupw'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function projectRefFromUrl(url: string | undefined): string | null {
  if (!url) return null
  const match = url.trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/)
  return match?.[1] ?? null
}

function decodeJwtPayload(segment: string): { role?: string; ref?: string } | null {
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (segment.length % 4)) % 4)
    const payload = JSON.parse(atob(padded)) as { role?: string; ref?: string }
    return payload
  } catch {
    return null
  }
}

/**
 * True only for a public anon JWT or publishable key that belongs with the
 * intended project. Secret keys, service-role JWTs, and other projects are rejected.
 */
export function isPublicClientKey(key: string | undefined, projectRef: string | null): boolean {
  if (!key || key === 'placeholder-anon-key') return false
  if (projectRef !== INTENDED_SUPABASE_REF) return false
  if (key.startsWith('sb_secret_')) return false
  if (key.startsWith('sb_publishable_')) return true
  const parts = key.split('.')
  if (parts.length !== 3 || !parts[0].startsWith('eyJ')) return false
  const payload = decodeJwtPayload(parts[1])
  return payload?.role === 'anon' && payload.ref === INTENDED_SUPABASE_REF
}

/**
 * Only the publishable/anon key may be exposed to this browser client.
 * A service-role key must never be supplied through VITE_* variables.
 */
export const isSupabaseConfigured = isPublicClientKey(supabaseAnonKey, projectRefFromUrl(supabaseUrl))

if (!isSupabaseConfigured) {
  console.error(
    `[evermont] Supabase client is not configured with a public anon or publishable key for project ${INTENDED_SUPABASE_REF}. Member sign-in is unavailable.`,
  )
}

export const supabase = createClient(
  isSupabaseConfigured && supabaseUrl ? supabaseUrl : 'https://placeholder.invalid',
  isSupabaseConfigured && supabaseAnonKey ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: authStorage,
    },
  },
)
