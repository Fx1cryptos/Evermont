import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/constants/routes'
import type { AdminRole } from '@/types/admin'

/**
 * Client-side gate for /admin. Reads the signed-in user's row in public.admin_roles
 * (existing table; RLS unchanged). If RLS hides the row or none exists, access is denied.
 * This is UX only — real protection must remain server-side (RLS).
 */
export const AdminRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth()
  const [role, setRole] = useState<AdminRole | null | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    let active = true
    void supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => { if (active) setRole(error || !data ? null : (data.role as AdminRole)) })
    return () => { active = false }
  }, [user])

  if (loading || (user && role === undefined)) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Checking staff access…</main>
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (!role) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center text-[#101533]">
      <h1 className="text-2xl font-semibold">Staff access required</h1>
      <p className="max-w-md text-sm text-slate-600">Your account does not have an administrative role.</p>
      <Link to={ROUTES.DASHBOARD} className="rounded-full bg-[#0504AA] px-5 py-2.5 text-sm font-semibold text-white">Go to member dashboard</Link>
    </main>
  )
  return <AdminAuthProvider role={role}>{children}</AdminAuthProvider>
}
