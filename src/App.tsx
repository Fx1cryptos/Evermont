import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage'
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { MemberDashboardPage } from '@/pages/MemberDashboardPage'
import { HomePage } from '@/pages/HomePage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { FinancialInsightsPage } from '@/pages/FinancialInsightsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { AccountsPage } from '@/pages/AccountsPage'
import { ActivationPage } from '@/pages/ActivationPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SupportPage } from '@/pages/SupportPage'
import { SupportThreadPage } from '@/pages/SupportThreadPage'
import { ServicePage } from '@/pages/ServicePage'
import { ROUTES } from '@/constants/routes'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading member portal...</main>
  return user ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><MemberDashboardPage /></ProtectedRoute>} />
        <Route path={ROUTES.ACCOUNTS} element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
        <Route path={ROUTES.ACTIVATION} element={<ProtectedRoute><ActivationPage /></ProtectedRoute>} />
        <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path={ROUTES.TRANSACTIONS} element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path={ROUTES.INSIGHTS} element={<ProtectedRoute><FinancialInsightsPage /></ProtectedRoute>} />
        <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path={`${ROUTES.SUPPORT}/:id`} element={<ProtectedRoute><SupportThreadPage /></ProtectedRoute>} />
        <Route path={ROUTES.SUPPORT} element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
        <Route path="/services/:service" element={<ServicePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/members/:id" element={<MemberDetailPage />} />
        <Route path="/admin/accounts/:id" element={<AccountHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
