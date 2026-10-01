import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTES.HOME)
  }

  return (
    <div className="min-h-screen bg-evermont-light">
      {/* Top bar */}
      <header className="bg-evermont-blue text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Evermont</span>
            <span className="text-evermont-gold text-xs font-medium">Credit Union</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-200">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-evermont-dark mb-1">
          Welcome, {user?.firstName || 'Member'}
        </h1>
        <p className="text-evermont-muted text-sm mb-8">Here's your account overview.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <p className="text-sm text-evermont-muted mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-evermont-blue">$0.00</p>
            <p className="text-xs text-evermont-muted mt-2">Checking • ••••0000</p>
          </Card>
          <Card>
            <p className="text-sm text-evermont-muted mb-1">Savings</p>
            <p className="text-3xl font-bold text-evermont-blue">$0.00</p>
            <p className="text-xs text-evermont-muted mt-2">Savings • ••••0001</p>
          </Card>
          <Card>
            <p className="text-sm text-evermont-muted mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-evermont-blue">$0.00</p>
            <p className="text-xs text-evermont-muted mt-2">Across all accounts</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-evermont-dark mb-4">Recent Transactions</h2>
          <div className="text-center py-8 text-evermont-muted">
            <p>No transactions yet.</p>
            <p className="text-sm mt-1">Your recent activity will appear here.</p>
          </div>
        </Card>
      </main>
    </div>
  )
}

export default DashboardPage
