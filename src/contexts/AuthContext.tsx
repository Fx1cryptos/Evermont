import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType, User } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DEMO_USER, DEMO_USER_ID } from '@/data/demoMember'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_SESSION_KEY = 'evermont_demo_session'

const isDemoSession = () => {
  try {
    return localStorage.getItem(DEMO_SESSION_KEY) === DEMO_USER_ID
  } catch {
    return false
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isDemoSession()) {
      setUser(DEMO_USER)
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            })
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          })
        }
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setError(null)
    if (!supabase) {
      setError('Supabase is not configured')
      throw new Error('Supabase is not configured')
    }
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
          },
        ])

        if (profileError) throw profileError
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    setError(null)
    if (!supabase) {
      setError('Supabase is not configured')
      throw new Error('Supabase is not configured')
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    }
  }

  const signInAsDemo = () => {
    setError(null)
    try {
      localStorage.setItem(DEMO_SESSION_KEY, DEMO_USER_ID)
    } catch {
      // storage unavailable — demo session just won't persist across reloads
    }
    setUser(DEMO_USER)
  }

  const signOut = async () => {
    setError(null)
    try {
      localStorage.removeItem(DEMO_SESSION_KEY)
    } catch {
      // ignore storage errors
    }
    if (!supabase) {
      setUser(null)
      return
    }
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
    if (!supabase) {
      setError('Supabase is not configured')
      throw new Error('Supabase is not configured')
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed'
      setError(message)
      throw err
    }
  }

  const updatePassword = async (token: string, password: string) => {
    setError(null)
    if (!supabase) {
      setError('Supabase is not configured')
      throw new Error('Supabase is not configured')
    }
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
        signInAsDemo,
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
