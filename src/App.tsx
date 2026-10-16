import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage'
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { MemberDashboardPage } from '@/pages/MemberDashboardPage'
import { HomePage } from '@/pages/HomePage'
import { ServicePage } from '@/pages/ServicePage'
import { OpenCheckingPage } from '@/pages/OpenCheckingPage'
import { AboutPage } from '@/pages/AboutPage'
import { ROUTES } from '@/constants/routes'
import { PublicTrustBanner } from '@/components/PublicTrustBanner'

const PublicPage: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>
    {children}
    <PublicTrustBanner />
  </>
)

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage><HomePage /></PublicPage>} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGN_IN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.SIGN_UP} element={<Register />} />
        <Route path={ROUTES.OPEN_CHECKING} element={<PublicPage><OpenCheckingPage /></PublicPage>} />
        <Route path={ROUTES.ABOUT} element={<PublicPage><AboutPage /></PublicPage>} />
        <Route path={ROUTES.DASHBOARD} element={<MemberDashboardPage />} />
        <Route path={ROUTES.ACCOUNT} element={<MemberDashboardPage />} />
        <Route path="/checking" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/savings" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/cryptocurrency" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/loans" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/retirement" element={<PublicPage><ServicePage /></PublicPage>} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/members/:id" element={<MemberDetailPage />} />
        <Route path="/admin/accounts/:id" element={<AccountHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
