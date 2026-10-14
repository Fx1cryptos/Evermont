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
import { ROUTES } from '@/constants/routes'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGN_IN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.SIGN_UP} element={<Register />} />
        <Route path={ROUTES.DASHBOARD} element={<MemberDashboardPage />} />
        <Route path={ROUTES.ACCOUNT} element={<MemberDashboardPage />} />
        <Route path="/checking" element={<ServicePage />} />
        <Route path="/savings" element={<ServicePage />} />
        <Route path="/cryptocurrency" element={<ServicePage />} />
        <Route path="/loans" element={<ServicePage />} />
        <Route path="/retirement" element={<ServicePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/members/:id" element={<MemberDetailPage />} />
        <Route path="/admin/accounts/:id" element={<AccountHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
