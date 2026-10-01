import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { isSupabaseConfigured } from '@/lib/supabase'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import AccountsPage from '@/pages/AccountsPage'
import AccountDetailPage from '@/pages/AccountDetailPage'
import TransactionsPage from '@/pages/TransactionsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/components/ProtectedRoute'

const SupabaseBanner: React.FC = () => {
  if (isSupabaseConfigured) return null
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
      Supabase is not configured — set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
      <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to enable authentication and data.
    </div>
  )
}

const App: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col">
      <SupabaseBanner />
      <Routes>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCOUNTS}
          element={
            <ProtectedRoute>
              <AccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ACCOUNT_DETAIL}
          element={
            <ProtectedRoute>
              <AccountDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TRANSACTIONS}
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
