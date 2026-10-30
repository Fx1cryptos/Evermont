import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'

const nav = [{ label: 'Checking', href: '/checking' }, { label: 'Savings', href: '/savings' }, { label: 'Credit Card', href: '/credit-card' }, { label: 'Loans', href: '/loans' }, { label: 'Retirement', href: '/retirement' }, { label: 'Security', href: '/security' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]

export const PublicChrome: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)
  return <div className="min-h-screen bg-[#f8fafc] text-[#101533]">
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Public site header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Evermont home"><img src="/images/evermont-logo.jpeg" alt="Evermont logo" className="h-10 w-10 object-contain" /><span className="font-bold tracking-tight">EVERMONT</span></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">{nav.map(item => <Link key={item.href} to={item.href} className="hover:text-[#0504AA]">{item.label}</Link>)}</nav>
        <div className="hidden items-center gap-3 sm:flex"><a href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-[#0504AA]">Sign In</a><Link to="/open-account" className="rounded-full bg-[#0504AA] px-4 py-2 text-sm font-semibold text-white">Open an Account</Link></div>
        <button className="rounded-lg p-2 text-[#0504AA] lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">{nav.map(item => <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-blue-50">{item.label}</Link>)}<a href="/login" className="mt-2 block rounded-lg bg-[#0504AA] px-3 py-3 text-center text-sm font-semibold text-white">Sign In</a></nav>}
    </header>
    {children}
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><p className="font-semibold text-[#101533]">EVERMONT Credit Union</p><p className="mt-2">Where Private Wealth Is Protected.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3"><Link to="/about">About</Link><Link to="/savings">Savings</Link><Link to="/security">Security</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/disclosures">Disclosures</Link><Link to="/accessibility">Accessibility</Link><Link to="/contact">Contact</Link><a href="mailto:support@evermontcredit.online?subject=EVERMONT%20Customer%20Support" className="font-semibold text-[#0504AA]">Contact Support</a><a href="/login">Member Sign In</a></div></div></footer>
  </div>
}

export const ContactSupportButton: React.FC = () => <a href="mailto:support@evermontcredit.online?subject=EVERMONT%20Customer%20Support" className="inline-flex items-center gap-2 rounded-full bg-[#0504AA] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 hover:bg-[#0807c8]">Contact Support <ArrowRight className="size-4" /></a>
