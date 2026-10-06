import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { MemberDetailPage } from '@/pages/admin/MemberDetailPage'
import { AccountHistoryPage } from '@/pages/admin/AccountHistoryPage'
import { Login } from '@/pages/auth/Login'
import { HomePage } from '@/pages/HomePage'
import { ROUTES } from '@/constants/routes'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/members/:id" element={<MemberDetailPage />} />
        <Route path="/admin/accounts/:id" element={<AccountHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
