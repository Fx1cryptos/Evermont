import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { footerNav, legalNav, LOGIN_URL, LOGO_PATH, publicNav, SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '@/content/publicPages'

const primaryBtn = 'inline-flex items-center justify-center rounded-full bg-[#0504AA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0807c8]'
const secondaryBtn = 'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-[#0504AA] transition hover:bg-[#f4f6ff]'

export const SignInLink: React.FC<{ className?: string }> = ({ className = secondaryBtn }) => (
  <a href={LOGIN_URL} className={className}>Sign In</a>
)

export const OpenAccountLink: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = primaryBtn, children = 'Open an Account' }) => (
  <Link to="/open-account" className={className}>{children}</Link>
)

export const PublicChrome: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Evermont Credit Union home">
            <img src={LOGO_PATH} alt="" className="h-11 w-11 shrink-0 object-contain" />
            <span className="truncate font-serif text-lg tracking-tight text-[#0504AA]">{SITE_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 xl:flex" aria-label="Primary">
            {publicNav.map((item) => (
              <Link key={item.href} to={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={pathname === item.href ? 'text-[#0504AA]' : 'hover:text-[#0504AA]'}>{item.label}</Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            <SignInLink />
            <OpenAccountLink />
          </div>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 text-[#0504AA] xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-navigation" className="border-t border-slate-100 bg-white px-5 py-4 xl:hidden" aria-label="Mobile">
            {publicNav.map((item) => (
              <Link key={item.href} to={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href ? 'page' : undefined} className="block rounded-xl px-3 py-3 text-base font-semibold text-[#101533] hover:bg-[#f4f6ff]">{item.label}</Link>
            ))}
            <div className="mt-3 grid gap-2">
              <OpenAccountLink className={`${primaryBtn} w-full`} />
              <SignInLink className={`${secondaryBtn} w-full border border-[#0504AA]/15`} />
            </div>
          </nav>
        )}
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-[#f7f5ef]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div>
            <img src={LOGO_PATH} alt="" className="h-14 w-14 object-contain" />
            <p className="mt-5 font-serif text-2xl text-[#101533]">Where private wealth is protected.</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">Built on integrity. Guided by excellence.</p>
            <a href={SUPPORT_PHONE_TEL} className="mt-5 inline-block text-sm font-semibold text-[#0504AA] underline-offset-4 hover:underline">{SUPPORT_PHONE_DISPLAY}</a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 block text-sm font-semibold text-[#0504AA] underline-offset-4 hover:underline">{SUPPORT_EMAIL}</a>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Link to="/" className="font-semibold text-[#101533] hover:text-[#0504AA]">Home</Link>
            {footerNav.map((item) => (
              <Link key={item.href} to={item.href} className="text-slate-600 hover:text-[#0504AA]">{item.label}</Link>
            ))}
            {legalNav.map((item) => (
              <Link key={item.href} to={item.href} className="text-slate-600 hover:text-[#0504AA]">{item.label}</Link>
            ))}
            <a href={LOGIN_URL} className="text-slate-600 hover:text-[#0504AA]">Sign In</a>
          </nav>
        </div>
        <div className="border-t border-slate-200/80">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs leading-5 text-slate-500 lg:px-8">Copyright© 2026 | Evermont Bank | All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export const ContactSupportButton: React.FC = () => (
  <a href={`mailto:${SUPPORT_EMAIL}?subject=EVERMONT%20Customer%20Support`} className={primaryBtn}>Contact Support</a>
)
