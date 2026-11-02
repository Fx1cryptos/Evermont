import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { LOGO_PATH, SITE_NAME } from '@/config/site'

export const PRIMARY_NAV = [
  { label: 'Banking', to: '/services/checking' },
  { label: 'Loans', to: '/loans' },
  { label: 'Wealth', to: '/services/wealth' },
  { label: 'Security', to: '/security' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const linkClass = ({ isActive }: { isActive: boolean }) => `transition-colors hover:text-[#0504AA] ${isActive ? 'text-[#0504AA]' : ''}`

export const SiteHeader: React.FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label={`${SITE_NAME} home`}>
          <img src={LOGO_PATH} alt={`${SITE_NAME} logo`} width={44} height={44} className="h-11 w-11 rounded-xl object-contain" />
          <span className="text-lg font-bold tracking-[-0.04em] text-[#101533]">{SITE_NAME}</span>
          <span className="hidden border-l border-slate-200 pl-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227] sm:block">Private Wealth</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Primary navigation">
          {PRIMARY_NAV.map(item => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link to="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#0504AA] transition-colors hover:bg-blue-50">Sign In</Link>
          <Link to="/register" className="rounded-full bg-[#0504AA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#0807c8]">Open an Account</Link>
        </div>
        <button type="button" className="rounded-lg p-2 text-[#0504AA] lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white px-5 py-4 lg:hidden" aria-label="Mobile navigation">
          {PRIMARY_NAV.map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50">{item.label}</Link>)}
          <Link to="/login" className="mt-2 rounded-lg border border-[#0504AA] px-3 py-3 text-center text-sm font-semibold text-[#0504AA]">Sign In</Link>
          <Link to="/register" className="rounded-lg bg-[#0504AA] px-3 py-3 text-center text-sm font-semibold text-white">Open an Account</Link>
        </nav>
      )}
    </header>
  )
}
