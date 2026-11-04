import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { legacyRedirects } from '@/content/publicPages'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ServicePage } from '@/pages/ServicePage'
import { PublicInfoPage } from '@/pages/PublicInfoPage'

const Login = lazy(() => import('@/pages/auth/Login').then(module => ({ default: module.Login })))
const Register = lazy(() => import('@/pages/auth/Register').then(module => ({ default: module.Register })))
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes').then(module => ({ default: module.AdminRoutes })))
const EvermontAssistant = lazy(() => import('@/components/EvermontAssistant').then(module => ({ default: module.EvermontAssistant })))

const LoadingFallback: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-white px-6 text-[#101533]" role="status" aria-live="polite">
    <div className="flex items-center gap-3 text-sm font-semibold"><span className="size-3 animate-pulse rounded-full bg-[#C9A227]" aria-hidden="true" />Loading Evermont…</div>
  </div>
)

const RouteAnalytics: React.FC = () => {
  const location = useLocation()
  useEffect(() => {
    const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void }
    analyticsWindow.gtag?.('event', 'page_view', { page_path: `${location.pathname}${location.search}`, page_location: window.location.href, page_title: document.title })
  }, [location.pathname, location.search])
  return null
}

const infoPaths = ['/security', '/contact', '/open-account', '/mission', '/membership', '/faq', '/privacy', '/terms', '/disclosures', '/accessibility', '/fraud-prevention']

export const AppRoutes: React.FC = () => (
  <>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/checking" element={<ServicePage />} />
        <Route path="/savings" element={<ServicePage />} />
        <Route path="/credit-card" element={<ServicePage />} />
        <Route path="/loans" element={<ServicePage />} />
        <Route path="/retirement" element={<ServicePage />} />
        <Route path="/cryptocurrency" element={<ServicePage />} />
        {infoPaths.map((path) => <Route key={path} path={path} element={<PublicInfoPage />} />)}
        {Object.entries(legacyRedirects).map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGN_IN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.SIGN_UP} element={<Register />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Suspense>
  </>
)

export const App: React.FC = () => (
  <BrowserRouter>
    <RouteAnalytics />
    <AppRoutes />
    <Suspense fallback={null}><EvermontAssistant /></Suspense>
  </BrowserRouter>
)
