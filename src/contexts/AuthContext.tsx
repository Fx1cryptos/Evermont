import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType, User } from '@/types'
import { mapSignInError, SIGN_IN_EMAIL_REQUIRED } from '@/lib/authErrors'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type SessionUser = {
  id: string
  email?: string | null
  created_at?: string
  updated_at?: string
  user_metadata?: Record<string, unknown>
}

function textMeta(meta: Record<string, unknown> | undefined, key: string) {
  const value = meta?.[key]
  return typeof value === 'string' ? value.trim() : ''
}

function memberFromRow(profile: {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  created_at: string
  updated_at: string
}): User {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

/**
 * Reads the member profile. If the auth user has no profile yet, associates
 * one using only existing profiles columns. Never writes admin roles, accounts,
 * or balances.
 */
async function resolveMember(sessionUser: SessionUser): Promise<User> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, created_at, updated_at')
    .eq('id', sessionUser.id)
    .maybeSingle()

  if (profile) return memberFromRow(profile)

  const phone = textMeta(sessionUser.user_metadata, 'phone')
  const row: { id: string; email: string; first_name: string; last_name: string; phone?: string } = {
    id: sessionUser.id,
    email: sessionUser.email || '',
    first_name: textMeta(sessionUser.user_metadata, 'first_name'),
    last_name: textMeta(sessionUser.user_metadata, 'last_name'),
  }
  if (phone) row.phone = phone

  const { data: saved } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('id, email, first_name, last_name, created_at, updated_at')
    .maybeSingle()

  if (saved) return memberFromRow(saved)

  const createdAt = sessionUser.created_at || new Date().toISOString()
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt,
    updatedAt: sessionUser.updated_at || createdAt,
  }
}

function authRedirect(path: string) {
  return `${window.location.origin}${path}`
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) setUser(await resolveMember(session.user))
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) setUser(await resolveMember(session.user))
      else setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    setError(null)
    if (!isSupabaseConfigured) throw new Error('Member registration is temporarily unavailable. Please try again later.')

    try {
      const metadata: { first_name: string; last_name: string; phone?: string; terms_accepted_at: string } = {
        first_name: firstName,
        last_name: lastName,
        terms_accepted_at: new Date().toISOString(),
      }
      if (phone) metadata.phone = phone

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authRedirect('/auth/callback'),
          data: metadata,
        },
      })

      if (signUpError) {
        const code = 'code' in signUpError && typeof signUpError.code === 'string' ? signUpError.code : ''
        const detail = signUpError.message.toLowerCase()
        if (code === 'user_already_exists' || detail.includes('already registered') || detail.includes('already been registered')) {
          throw new Error('An account with this email already exists. Try signing in instead.')
        }
        if (detail.includes('password')) throw new Error('Please choose a stronger password and try again.')
        throw new Error('We could not create your account. Please check your details and try again.')
      }

      const identities = data.user?.identities
      if (data.user && Array.isArray(identities) && identities.length === 0) {
        throw new Error('An account with this email already exists. Try signing in instead.')
      }

      if (data.user && data.session) {
        const row: { id: string; email: string; first_name: string; last_name: string; phone?: string } = {
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
        }
        if (phone) row.phone = phone
        const { error: profileError } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
        if (profileError) throw new Error('Your account was created, but we could not finish your member profile. Sign in after you verify your email.')
      }

      return { user: data.user, session: data.session }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    }
  }

  const signIn = async (identifier: string, password: string) => {
    setError(null)
    try {
      const email = identifier.trim()
      if (!email.includes('@')) throw new Error(SIGN_IN_EMAIL_REQUIRED)
      if (!isSupabaseConfigured) {
        throw new Error('Sign-in is temporarily unavailable. Please try again later.')
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      const mapped = mapSignInError(err)
      setError(mapped.message)
      throw mapped
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    if (!isSupabaseConfigured) throw new Error('Password reset is temporarily unavailable. Please try again later.')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirect('/reset-password') })
      if (!error) return
      const code = error.code || ''
      if (code === 'over_request_rate_limit' || error.status === 429) {
        throw new Error('Too many reset attempts. Please wait a moment and try again.')
      }
      if (error.status === 0 || error.name === 'AuthRetryableFetchError') {
        throw new Error('Connection failed. Check your internet connection and try again.')
      }
      if ((error.status || 0) >= 500) throw new Error('Password reset is temporarily unavailable. Please try again later.')
      // A redirect-allowlist or unknown-user response must not reveal whether the email exists.
      console.error('Password reset was not accepted', code || error.name)
      throw new Error('Password reset is temporarily unavailable. Please try again later.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed'
      setError(message)
      throw err
    }
  }

  const updatePassword = async (_token: string, password: string) => {
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password update failed'
      setError(message)
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
