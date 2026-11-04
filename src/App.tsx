import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage'
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage'
import { AdminComingSoonPage } from '@/pages/admin/AdminComingSoonPage'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { EmailConfirmedPage } from '@/pages/auth/EmailConfirmedPage'
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
import { MemberBankingServicePage } from '@/pages/member/MemberBankingServicePage'
import { ContentPage } from '@/pages/public/ContentPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { PAGES } from '@/pages/public/content'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { NoIndex } from '@/components/Seo'
import { ROUTES } from '@/constants/routes'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading member portal...</main>
  return user ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />
}

/** Private screens: protected + noindex. */
const Private: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <><NoIndex title={title} /><ProtectedRoute>{children}</ProtectedRoute></>
const Auth: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <><NoIndex title={title} />{children}</>
const Admin: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <><NoIndex title={title} /><AdminRoute>{children}</AdminRoute></>

const ADMIN_SOON = ['members', 'accounts', 'transactions', 'support', 'audit-logs', 'security', 'settings']

/** Router-agnostic route table, shared by the browser app and the build-time prerenderer. */
export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    {Object.keys(PAGES).map(path => <Route key={path} path={path} element={<ContentPage />} />)}
    <Route path="/services/ach" element={<Private title="ACH Transfer"><MemberBankingServicePage service="ach" /></Private>} />
    <Route path="/services/mobile-deposit" element={<Private title="Mobile Deposit"><MemberBankingServicePage service="mobile" /></Private>} />
    <Route path="/services/check-deposit" element={<Private title="Check Deposit"><MemberBankingServicePage service="check" /></Private>} />
    <Route path="/services/wire" element={<Private title="Wire Transfer"><MemberBankingServicePage service="wire" /></Private>} />
    <Route path="/services/:service" element={<ServicePage />} />

    <Route path="/sign-in" element={<Navigate to={ROUTES.LOGIN} replace />} />
    <Route path="/signup" element={<Navigate to={ROUTES.REGISTER} replace />} />
    <Route path={ROUTES.LOGIN} element={<Auth title="Member Sign In"><Login /></Auth>} />
    <Route path={ROUTES.REGISTER} element={<Auth title="Open an Account"><Register /></Auth>} />
    <Route path={ROUTES.FORGOT_PASSWORD} element={<Auth title="Forgot Password"><ForgotPasswordPage /></Auth>} />
    <Route path={ROUTES.RESET_PASSWORD} element={<Auth title="Reset Password"><ResetPasswordPage /></Auth>} />
    <Route path="/auth/callback" element={<Auth title="Email confirmed"><EmailConfirmedPage /></Auth>} />

    <Route path={ROUTES.DASHBOARD} element={<Private title="Dashboard"><MemberDashboardPage /></Private>} />
    <Route path={ROUTES.ACCOUNTS} element={<Private title="My Accounts"><AccountsPage /></Private>} />
    <Route path={ROUTES.ACTIVATION} element={<Private title="Activation"><ActivationPage /></Private>} />
    <Route path={ROUTES.SETTINGS} element={<Private title="Settings"><SettingsPage /></Private>} />
    <Route path={ROUTES.TRANSACTIONS} element={<Private title="Transactions"><TransactionsPage /></Private>} />
    <Route path={ROUTES.INSIGHTS} element={<Private title="Insights"><FinancialInsightsPage /></Private>} />
    <Route path={ROUTES.PROFILE} element={<Private title="Profile"><ProfilePage /></Private>} />
    <Route path={`${ROUTES.SUPPORT}/:id`} element={<Private title="Support"><SupportThreadPage /></Private>} />
    <Route path={ROUTES.SUPPORT} element={<Private title="Help & Support"><SupportPage /></Private>} />

    <Route path="/admin" element={<Admin title="Admin"><AdminDashboardPage /></Admin>} />
    <Route path="/admin/members/:id" element={<Admin title="Member Detail"><MemberDetailPage /></Admin>} />
    <Route path="/admin/accounts/:id" element={<Admin title="Account History"><AccountHistoryPage /></Admin>} />
    {ADMIN_SOON.map(s => <Route key={s} path={`/admin/${s}`} element={<Admin title="Admin"><AdminComingSoonPage section={s} /></Admin>} />)}

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export const App: React.FC = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
