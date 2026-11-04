import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { legalNav, LOGIN_URL, LOGO_PATH, MAILING_ADDRESS, publicNav, quickLinks, serviceLinks, SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '@/content/publicPages'

const loginClass = 'inline-flex items-center justify-center rounded-full bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0807c8]'

export const MemberLoginLink: React.FC<{ className?: string }> = ({ className = loginClass }) => (
  <a href={LOGIN_URL} className={className}>Member Login</a>
)

export const ContactSupportButton: React.FC = () => (
  <a href={`mailto:${SUPPORT_EMAIL}`} className={loginClass}>Contact Support</a>
)

export const PublicChrome: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = (href: string) => (href === '/' ? pathname === '/' : pathname === href)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-screen bg-white text-[#101533]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0504AA]">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Evermont Credit Union home">
            <img src={LOGO_PATH} alt="" className="h-12 w-auto object-contain" />
            <span className="hidden font-serif text-lg tracking-tight text-[#0504AA] sm:inline">{SITE_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 xl:flex" aria-label="Primary">
            {publicNav.map((item) => (
              <Link key={item.href} to={item.href} aria-current={current(item.href) ? 'page' : undefined} className={current(item.href) ? 'text-[#0504AA] underline decoration-[#C9A227] decoration-2 underline-offset-8' : 'hover:text-[#0504AA]'}>{item.label}</Link>
            ))}
          </nav>
          <div className="hidden xl:block"><MemberLoginLink /></div>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 text-[#0504AA] xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-navigation" className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden" aria-label="Mobile">
            {publicNav.map((item) => (
              <Link key={item.href} to={item.href} onClick={() => setOpen(false)} aria-current={current(item.href) ? 'page' : undefined} className={`block rounded-xl px-3 py-3 text-base font-semibold ${current(item.href) ? 'bg-[#f4f6ff] text-[#0504AA]' : 'text-[#101533] hover:bg-[#f4f6ff]'}`}>{item.label}</Link>
            ))}
            <MemberLoginLink className={`${loginClass} mt-3 w-full`} />
          </nav>
        )}
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-[#f7f5ef]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="md:col-span-2 lg:col-span-1">
            <img src={LOGO_PATH} alt="" className="h-14 w-auto object-contain" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">Where private wealth is protected. Built on integrity. Guided by excellence.</p>
          </div>
          <nav aria-label="Quick links">
            <h2 className="text-sm font-semibold text-[#101533]">Quick links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {quickLinks.map((item) => <li key={item.href}><Link to={item.href} className="text-slate-600 hover:text-[#0504AA]">{item.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Services">
            <h2 className="text-sm font-semibold text-[#101533]">Services</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {serviceLinks.map((item) => <li key={item.href}><Link to={item.href} className="text-slate-600 hover:text-[#0504AA]">{item.label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <h2 className="text-sm font-semibold text-[#101533]">Contact</h2>
            <address className="mt-3 space-y-2 text-sm not-italic text-slate-600">
              {MAILING_ADDRESS.map((line) => <p key={line}>{line}</p>)}
              <p><a href={SUPPORT_PHONE_TEL} className="font-semibold text-[#0504AA] hover:underline">{SUPPORT_PHONE_DISPLAY}</a></p>
              <p><a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#0504AA] hover:underline">{SUPPORT_EMAIL}</a></p>
            </address>
            <ul className="mt-4 space-y-2 text-sm">
              {legalNav.map((item) => <li key={item.href}><Link to={item.href} className="text-slate-600 hover:text-[#0504AA]">{item.label}</Link></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200/80">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs leading-5 text-slate-500 lg:px-8">Copyright© 2026 | Evermont Bank | All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
