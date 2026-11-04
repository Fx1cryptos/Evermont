import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage'
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage'
import { ROUTES } from '@/constants/routes'

const AdminPage: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    const checkRole = async () => {
      if (!user) {
        if (active) setAuthorized(false)
        return
      }
      const { data } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle()
      if (active) setAuthorized(Boolean(data?.role))
    }
    if (!authLoading) void checkRole()
    return () => { active = false }
  }, [authLoading, user])

  if (authLoading || (user && authorized === null)) return <div className="min-h-screen bg-[#f3f6fc] p-8 text-slate-600" role="status" aria-live="polite">Verifying administrator access…</div>
  if (!user || !authorized) return <Navigate to={ROUTES.LOGIN} replace />
  return <>{children}</>
}

export const AdminRoutes: React.FC = () => {
  const { pathname } = useLocation()
  const content = pathname.startsWith('/admin/members/')
    ? <MemberDetailPage />
    : pathname.startsWith('/admin/accounts/')
      ? <AccountHistoryPage />
      : <AdminDashboardPage />

  return <AdminPage>{content}</AdminPage>
}

export default AdminRoutes
