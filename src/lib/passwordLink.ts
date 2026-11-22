// Parse only password-related landing pages. Keep one-time values in page memory;
// consume each once even across React Strict Mode remounts.
import type { SupabaseClient } from '@supabase/supabase-js'

export function capturePasswordLink(url: URL, clean: () => void) {
  const fragment = new URLSearchParams(url.hash.slice(1))
  const params = url.searchParams
  const type = fragment.get('type') ?? params.get('type')
  const isReset = url.pathname === '/reset-password'
  if (!isReset && !(url.pathname === '/auth/callback' && (type === 'invite' || type === 'recovery'))) return null
  const invalid = ['error','error_code','error_description'].some(k => fragment.has(k) || params.has(k))
  const hash = fragment.get('token_hash')
  const code = params.get('code')
  const access = fragment.get('access_token')
  if (!invalid && !hash && !code && !access) return null
  // The SDK handles implicit token fragments during client initialization.
  // Explicit OTP/PKCE exchange is owned here, so remove these before SDK initialization.
  if (hash || code || invalid) clean()
  let pending: Promise<string> | undefined
  let consumed = false
  async function verify(auth: SupabaseClient['auth']) {
    if (invalid || (type && type !== 'invite' && type !== 'recovery')) throw Error('Invalid password link')
    if (hash && (type === 'invite' || type === 'recovery')) {
      const { data, error } = await auth.verifyOtp({ token_hash: hash, type })
      if (!error && data.session) return data.session.user.id
    } else if (code) {
      const { data, error } = await auth.exchangeCodeForSession(code)
      if (!error && data.session) return data.session.user.id
    } else if (access && (type === 'invite' || type === 'recovery')) {
      const result = await auth.initialize()
      if (!result.error) {
        const { data } = await auth.getSession()
        if (data.session?.access_token === access) return data.session.user.id
      }
    }
    throw Error('Invalid password link')
  }
  return {
    type,
    verify(auth: SupabaseClient['auth']) {
      if (consumed) return Promise.reject(Error('Link already used'))
      return pending ??= verify(auth)
    },
    finish() { consumed = true; pending = undefined },
  }
}
