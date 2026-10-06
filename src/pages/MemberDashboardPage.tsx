import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'

export const MemberDashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-evermont-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to={ROUTES.HOME} className="text-lg font-bold text-evermont-blue">EVERMONT</Link>
          <button type="button" onClick={() => void signOut()} className="text-sm font-medium text-evermont-blue hover:underline">Sign out</button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-medium text-evermont-blue">Member dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Welcome{user?.firstName ? `, ${user.firstName}` : ''}.</h1>
        <div className="mt-8 rounded-lg border border-evermont-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your Evermont membership</h2>
          <p className="mt-2 text-sm text-gray-600">Your account is ready. Account details and balances will appear here once they are available.</p>
        </div>
      </section>
    </main>
  )
}
