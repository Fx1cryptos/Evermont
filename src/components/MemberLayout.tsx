import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { DEMO_BADGE, DemoBanner } from '@/components/DemoBanner'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-gray-200 hover:bg-white/10'
  }`

const MemberLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(ROUTES.HOME)
  }

  return (
    <div className="min-h-screen bg-evermont-light">
      <header className="bg-evermont-blue text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <span className="text-xl font-bold">Evermont</span>
            <span className="text-evermont-gold text-xs font-medium hidden sm:inline">Credit Union</span>
            {DEMO_BADGE}
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>Dashboard</NavLink>
            <NavLink to={ROUTES.ACCOUNTS} className={navLinkClass}>Accounts</NavLink>
            <NavLink to={ROUTES.TRANSACTIONS} className={navLinkClass}>Transactions</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-200">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <DemoBanner />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

export default MemberLayout
