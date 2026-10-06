import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, Bell, HelpCircle, ChevronDown, LogOut, User, LifeBuoy, ShieldQuestion, MessageSquare } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/brand/Logo'
import { DEMO_BADGE } from '@/components/DemoBanner'
import { Button } from '@/components/ui/Button'

interface DemoNotification {
  id: string
  title: string
  message: string
  read: boolean
  time: string
}

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: 'n1', title: 'Direct deposit received', message: 'Payroll of $3,200.00 posted to Evermont Checking.', read: false, time: '1d ago' },
  { id: 'n2', title: 'Savings transfer completed', message: '$500.00 moved to High-Yield Savings (auto-save).', read: false, time: '7d ago' },
  { id: 'n3', title: 'New statement available', message: 'Your monthly statement is ready to view.', read: true, time: '12d ago' },
  { id: 'n4', title: 'Security update', message: 'A new device signed in to your account.', read: true, time: '20d ago' },
]

const useClickOutside = (onAway: () => void) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onAway])
  return ref
}

const MemberHeader: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<'notifications' | 'help' | 'profile' | null>(null)
  const [search, setSearch] = useState('')
  const menuRef = useClickOutside(() => setOpenMenu(null))

  const unread = DEMO_NOTIFICATIONS.filter((n) => !n.read).length

  const handleSignOut = async () => {
    setOpenMenu(null)
    await signOut()
    navigate(ROUTES.HOME)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(ROUTES.TRANSACTIONS)
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive ? 'bg-white text-evermont-blue font-semibold' : 'text-gray-200 hover:bg-white/10 hover:text-white'
    }`

  return (
    <header className="bg-evermont-blue text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16 lg:h-[72px]">
          <NavLink to={ROUTES.DASHBOARD} className="shrink-0">
            <Logo variant="dark" size="sm" />
          </NavLink>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md ml-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions, payments…"
                aria-label="Search"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-evermont-gold focus:bg-white/20 transition"
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <span className="hidden sm:inline-flex">{DEMO_BADGE}</span>

            {/* Notifications */}
            <div className="relative" ref={openMenu === 'notifications' ? menuRef : undefined}>
              <button
                onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
                aria-label="Notifications"
                className="relative p-2.5 rounded-full hover:bg-white/10 transition"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-evermont-gold text-[9px] font-bold text-[#1a1a2e] flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              {openMenu === 'notifications' && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-evermont-border text-evermont-dark overflow-hidden">
                  <div className="px-4 py-3 border-b border-evermont-border flex items-center justify-between">
                    <p className="text-sm font-bold">Notifications</p>
                    <span className="text-[10px] font-semibold uppercase text-evermont-muted">Demo</span>
                  </div>
                  {DEMO_NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-evermont-border last:border-0 hover:bg-blue-50/50">
                      <div className="flex items-start gap-2.5">
                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-evermont-blue shrink-0" />}
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${n.read ? 'text-evermont-muted' : 'font-semibold'}`}>{n.title}</p>
                          <p className="text-xs text-evermont-muted mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Help */}
            <div className="relative" ref={openMenu === 'help' ? menuRef : undefined}>
              <button
                onClick={() => setOpenMenu(openMenu === 'help' ? null : 'help')}
                aria-label="Help and support"
                className="p-2.5 rounded-full hover:bg-white/10 transition"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              {openMenu === 'help' && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-evermont-border text-evermont-dark p-2">
                  {[
                    { Icon: LifeBuoy, label: 'Help Center' },
                    { Icon: MessageSquare, label: 'Secure Message a Rep' },
                    { Icon: ShieldQuestion, label: 'Report Fraud' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setOpenMenu(null)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-blue-50 text-left"
                    >
                      <item.Icon className="h-4 w-4 text-evermont-blue" />
                      {item.label}
                    </button>
                  ))}
                  <p className="px-3 py-2 text-[11px] text-evermont-muted">Support is simulated in demo mode.</p>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={openMenu === 'profile' ? menuRef : undefined}>
              <button
                onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
                aria-label="Member profile menu"
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full hover:bg-white/10 transition"
              >
                <span className="h-8 w-8 rounded-full bg-evermont-gold text-[#1a1a2e] text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm font-medium max-w-[110px] truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-300" />
              </button>
              {openMenu === 'profile' && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-evermont-border text-evermont-dark overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-evermont-border">
                    <p className="text-sm font-bold">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-evermont-muted truncate mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wide bg-blue-50 text-evermont-blue rounded px-1.5 py-0.5">
                      Premium Member • Demo
                    </span>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => setOpenMenu(null)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-blue-50 text-left"
                    >
                      <User className="h-4 w-4 text-evermont-blue" /> Profile & Settings
                    </button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full mt-1 justify-start gap-3"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
          <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>Dashboard</NavLink>
          <NavLink to={ROUTES.ACCOUNTS} className={navLinkClass}>Accounts</NavLink>
          <NavLink to={ROUTES.TRANSACTIONS} className={navLinkClass}>Transactions</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default MemberHeader
