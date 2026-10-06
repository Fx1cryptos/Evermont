import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import Logo from '@/components/brand/Logo'
import { DEMO_BADGE } from '@/components/DemoBanner'

const navItems = [
  { label: 'Accounts', href: '#accounts' },
  { label: 'Lending', href: '#lending' },
  { label: 'Investing', href: '#investing' },
  { label: 'Crypto', href: '#crypto' },
  { label: 'Security', href: '#security' },
]

const LandingHeader: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-evermont-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <Logo size="md" />
            <span className="lg:hidden">{DEMO_BADGE}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-evermont-blue rounded-md hover:bg-blue-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <span className="mr-1">{DEMO_BADGE}</span>
            <Link
              to={ROUTES.LOGIN}
              className="px-4 py-2 text-sm font-semibold text-evermont-blue hover:bg-blue-50 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-evermont-blue hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              Open Account
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-evermont-blue"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-evermont-border bg-white px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50"
            >
              {item.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-evermont-border">
            <Link
              to={ROUTES.LOGIN}
              className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-evermont-blue border border-evermont-blue rounded-lg"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-evermont-blue rounded-lg"
            >
              Open Account
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default LandingHeader
