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
import { ProductPage } from '@/pages/ProductPage'
import { EvermontAssistant } from '@/components/EvermontAssistant'
import { SEO } from '@/components/SEO'
import { PublicInfoPage } from '@/pages/PublicInfoPage'

const PrivatePage: React.FC<React.PropsWithChildren> = ({ children }) => <><SEO title="Member Portal" description="Secure Evermont member area" noIndex />{children}</>
const PublicPage: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>

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
        <Route path={ROUTES.DASHBOARD} element={<PrivatePage><MemberDashboardPage /></PrivatePage>} />
        <Route path={ROUTES.ACCOUNT} element={<PrivatePage><MemberDashboardPage /></PrivatePage>} />
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
        <Route path="/admin" element={<PrivatePage><AdminDashboardPage /></PrivatePage>} />
        <Route path="/admin/members/:id" element={<PrivatePage><MemberDetailPage /></PrivatePage>} />
        <Route path="/admin/accounts/:id" element={<PrivatePage><AccountHistoryPage /></PrivatePage>} />
      </Routes>
      <EvermontAssistant />
    </BrowserRouter>
  )
}
