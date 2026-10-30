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

const PUBLIC_SITE = 'https://evermontcredit.online'
const MEMBER_PORTAL = 'https://v0-evermont.vercel.app'
const MEMBER_PREFIXES = ['/login', '/sign-in', '/register', '/signup', '/dashboard', '/accounts', '/activation', '/transactions', '/insights', '/profile', '/settings', '/support', '/admin', '/forgot-password', '/reset-password']

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading member portal...</main>
  return user ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />
}

export const App: React.FC = () => {
  React.useEffect(() => {
    const host = window.location.hostname
    const path = window.location.pathname
    const onPublicDomain = host === 'evermontcredit.online' || host === 'www.evermontcredit.online'
    if (onPublicDomain && MEMBER_PREFIXES.some(route => path === route || path.startsWith(`${route}/`))) {
      window.location.replace(`${MEMBER_PORTAL}${path}${window.location.search}${window.location.hash}`)
      return
    }
    const isPrivate = MEMBER_PREFIXES.some(route => path === route || path.startsWith(`${route}/`))
    document.title = isPrivate ? 'Evermont Credit Union | Member Portal' : 'Evermont Credit Union | Secured Private Wealth Banking'
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots) }
    robots.setAttribute('content', isPrivate ? 'noindex, nofollow' : 'index, follow')
  }, [])
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

export { PUBLIC_SITE, MEMBER_PORTAL }
