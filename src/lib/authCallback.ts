/**
 * Read once, before the Supabase client clears the URL.
 * Tokens are not stored here and must not be rendered.
 */
import React from 'react'

export type AuthLink = {
  type: string | null
  errorCode: string | null
  hasCode: boolean
  hasAccessToken: boolean
  hasError: boolean
}

export function readAuthLink(): AuthLink {
  if (typeof window === 'undefined') {
    return { type: null, errorCode: null, hasCode: false, hasAccessToken: false, hasError: false }
  }
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const query = new URLSearchParams(window.location.search)
  const pick = (key: string) => hash.get(key) || query.get(key)
  const errorCode = pick('error_code')
  const error = pick('error') || pick('error_description')
  return {
    type: pick('type'),
    errorCode,
    hasCode: Boolean(pick('code')),
    hasAccessToken: Boolean(pick('access_token')),
    hasError: Boolean(error || errorCode),
  }
}

export const authLink: AuthLink = readAuthLink()

/** Prefer a link parsed before Supabase clears the URL, then any later hash. */
export function useAuthLink(): AuthLink {
  const [link, setLink] = React.useState(authLink)
  React.useEffect(() => {
    const update = () => {
      const next = readAuthLink()
      if (next.hasError || next.hasCode || next.hasAccessToken || next.type) setLink(next)
    }
    update()
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return link
}

const RECOVERY_FLAG = 'evermont-password-recovery'

export function markPasswordRecovery() {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(RECOVERY_FLAG, '1')
}

export function hasPasswordRecovery() {
  if (typeof window === 'undefined') return false
  return window.sessionStorage.getItem(RECOVERY_FLAG) === '1'
}

export function clearPasswordRecovery() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(RECOVERY_FLAG)
}

export function authLinkMessage(link: AuthLink = authLink): string {
  if (link.errorCode === 'otp_expired') return 'This link has expired. Request a new one.'
  if (link.hasError) return 'This link is invalid or has already been used. Request a new one.'
  return 'We could not use this link. Request a new one.'
}
