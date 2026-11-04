/**
 * Session persistence chosen on the sign-in form.
 * "Remember me" uses localStorage. Leaving it unchecked uses sessionStorage,
 * so the session ends when the browser closes. Tokens are never placed in the URL.
 */
const REMEMBER_KEY = 'evermont-remember-me'

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getRememberMe(): boolean {
  if (!canUseBrowserStorage()) return true
  return window.localStorage.getItem(REMEMBER_KEY) !== '0'
}

export function setRememberMe(remember: boolean) {
  if (!canUseBrowserStorage()) return
  window.localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
}

/** PKCE verifiers must survive closing the tab so email links can be completed. */
function isVerifierKey(key: string) {
  return key.includes('code-verifier')
}

function primaryStore() {
  return getRememberMe() ? window.localStorage : window.sessionStorage
}

function secondaryStore() {
  return getRememberMe() ? window.sessionStorage : window.localStorage
}

/** Storage adapter for supabase-js. Keeps the default auth key and swaps the browser store. */
export const authStorage = {
  getItem(key: string) {
    if (!canUseBrowserStorage()) return null
    if (isVerifierKey(key)) return window.localStorage.getItem(key)
    return primaryStore().getItem(key) ?? secondaryStore().getItem(key)
  },
  setItem(key: string, value: string) {
    if (!canUseBrowserStorage()) return
    if (isVerifierKey(key)) {
      window.localStorage.setItem(key, value)
      return
    }
    secondaryStore().removeItem(key)
    primaryStore().setItem(key, value)
  },
  removeItem(key: string) {
    if (!canUseBrowserStorage()) return
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}
