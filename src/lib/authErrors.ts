/** Shown when the member typed a name instead of an email address. */
export const SIGN_IN_EMAIL_REQUIRED = 'Sign in with the email on the account, not the member name.'

const INCORRECT_CREDENTIALS = 'Incorrect email or password.'
const VERIFY_EMAIL = 'Please verify your email before signing in.'
const CONTACT_SUPPORT = 'This account cannot sign in. Please contact support.'
const CONNECTION_FAILED = 'Connection failed. Check your internet connection and try again.'
const TEMPORARILY_UNAVAILABLE = 'Sign-in is temporarily unavailable. Please try again later.'
const RATE_LIMITED = 'Too many sign-in attempts. Please wait a moment and try again.'

type AuthShape = {
  name: string
  message: string
  status?: number
  code?: string
}

function readAuth(err: unknown): AuthShape {
  if (typeof err !== 'object' || err === null) return { name: '', message: '' }
  const value = err as { name?: unknown; message?: unknown; status?: unknown; code?: unknown }
  return {
    name: typeof value.name === 'string' ? value.name : '',
    message: typeof value.message === 'string' ? value.message : '',
    status: typeof value.status === 'number' ? value.status : undefined,
    code: typeof value.code === 'string' ? value.code : undefined,
  }
}

/**
 * Maps a Supabase Auth failure to a member-facing message.
 * Credential failures are the only path that says the email or password is wrong.
 */
export function mapSignInError(err: unknown): Error {
  if (err instanceof Error && err.message === SIGN_IN_EMAIL_REQUIRED) return err

  const { name, message, status, code } = readAuth(err)
  const normalizedCode = (code || '').toLowerCase()
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedCode === 'invalid_credentials' ||
    normalizedCode === 'user_not_found' ||
    normalizedMessage === 'invalid login credentials'
  ) {
    return new Error(INCORRECT_CREDENTIALS)
  }

  if (normalizedCode === 'email_not_confirmed' || normalizedMessage.includes('email not confirmed')) {
    return new Error(VERIFY_EMAIL)
  }

  if (
    normalizedCode === 'user_banned' ||
    normalizedCode === 'user_disabled' ||
    normalizedMessage.includes('user is banned') ||
    normalizedMessage.includes('user is disabled')
  ) {
    return new Error(CONTACT_SUPPORT)
  }

  if (normalizedCode === 'over_request_rate_limit' || normalizedMessage.includes('rate limit')) {
    return new Error(RATE_LIMITED)
  }

  const invalidClientKey =
    normalizedMessage.includes('invalid api key') ||
    normalizedMessage.includes('no api key') ||
    normalizedCode.includes('invalid_api_key')

  const serverFailure =
    (typeof status === 'number' && status >= 500) ||
    normalizedCode === 'unexpected_failure' ||
    invalidClientKey

  const connectionFailure =
    status === 0 ||
    name === 'TypeError' ||
    (name === 'AuthRetryableFetchError' && (status === undefined || status === 0)) ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('networkerror') ||
    normalizedMessage.includes('network request failed') ||
    normalizedMessage.includes('load failed')

  if (connectionFailure && !serverFailure) return new Error(CONNECTION_FAILED)
  return new Error(TEMPORARILY_UNAVAILABLE)
}
