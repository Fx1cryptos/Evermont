import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage'
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { MemberDashboardPage } from '@/pages/MemberDashboardPage'
import { ServicePage } from '@/pages/ServicePage'
import { ROUTES } from '@/constants/routes'

const PortalEntry: React.FC = () => {
  const { user, loading } = useAuth()
  if (loading) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading member portal...</main>
  return <Navigate to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalEntry />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.DASHBOARD} element={<MemberDashboardPage />} />
        <Route path="/services/:service" element={<ServicePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/members/:id" element={<MemberDetailPage />} />
        <Route path="/admin/accounts/:id" element={<AccountHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
