import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })))
const Login = lazy(() => import('@/pages/auth/Login').then(module => ({ default: module.Login })))
const Register = lazy(() => import('@/pages/auth/Register').then(module => ({ default: module.Register })))
const ServicePage = lazy(() => import('@/pages/ServicePage').then(module => ({ default: module.ServicePage })))
const OpenCheckingPage = lazy(() => import('@/pages/OpenCheckingPage').then(module => ({ default: module.OpenCheckingPage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })))
const ProductPage = lazy(() => import('@/pages/ProductPage').then(module => ({ default: module.ProductPage })))
const PublicInfoPage = lazy(() => import('@/pages/PublicInfoPage').then(module => ({ default: module.PublicInfoPage })))
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes').then(module => ({ default: module.AdminRoutes })))
const EvermontAssistant = lazy(() => import('@/components/EvermontAssistant').then(module => ({ default: module.EvermontAssistant })))

const PublicPage: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>

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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <RouteAnalytics />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<PublicPage><HomePage /></PublicPage>} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGN_IN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.SIGN_UP} element={<Register />} />
        <Route path={ROUTES.OPEN_CHECKING} element={<PublicPage><OpenCheckingPage /></PublicPage>} />
        <Route path={ROUTES.ABOUT} element={<PublicPage><AboutPage /></PublicPage>} />
        <Route path="/checking" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/savings" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/cryptocurrency" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/loans" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/retirement" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/credit-card" element={<PublicPage><ProductPage /></PublicPage>} />
        <Route path="/security" element={<PublicInfoPage />} />
        <Route path="/contact" element={<PublicInfoPage />} />
        <Route path="/open-account" element={<PublicInfoPage />} />
        {['/mission','/membership','/faq','/privacy','/terms','/disclosures','/accessibility','/fraud-prevention'].map(path => <Route key={path} path={path} element={<PublicInfoPage />} />)}
        {['/banking/private-checking','/banking/private-savings','/banking/credit-card','/banking/retirement-401k','/loans/personal','/loans/auto','/banking/digital-asset-lending'].map(path => <Route key={path} path={path} element={<ProductPage />} />)}
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}><EvermontAssistant /></Suspense>
    </BrowserRouter>
  )
}
