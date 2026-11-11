import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowDownToLine, Menu, X } from 'lucide-react'
import { PWAInstallExperience, requestEvermontInstall } from '@/components/PWAInstallExperience'
import { legalNav, LOGIN_URL, LOGO_PATH, MAILING_ADDRESS, publicNav, quickLinks, serviceLinks, SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '@/content/publicPages'

const loginClass = 'inline-flex items-center justify-center rounded-full bg-[#080A9F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#07143D]'

const openAccountClass = 'inline-flex items-center justify-center rounded-full bg-[#C8A43D] px-4 py-2.5 text-sm font-semibold text-[#07143D] transition hover:bg-[#DEC46D]'

const installClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-[#C8A43D]/70 px-4 py-2.5 text-sm font-semibold text-[#07143D] transition hover:bg-[#F5F7FB]'

export const SignInLink: React.FC<{ className?: string }> = ({ className = 'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-[#080A9F] hover:bg-[#F5F7FB]' }) => (
  <a href={LOGIN_URL} className={className}>Member Login</a>
)

export const OpenAccountButton: React.FC<{ className?: string }> = ({ className = openAccountClass }) => (
  <Link to="/open-account" className={className}>Get Started</Link>
)

export const MemberLoginLink = SignInLink

export const ContactSupportButton: React.FC = () => (
  <a href={`mailto:${SUPPORT_EMAIL}`} className={loginClass}>Contact Support</a>
)

export const PublicChrome: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = (href: string) => (href === '/' ? pathname === '/' : pathname === href)

  useEffect(() => {
    document.documentElement.classList.toggle('evermont-mobile-navigation-open', open)
    return () => document.documentElement.classList.remove('evermont-mobile-navigation-open')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-screen bg-white text-[#07143D]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#080A9F]">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Evermont Credit Union home">
            <img src={LOGO_PATH} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <span className="hidden whitespace-nowrap font-serif text-lg tracking-tight text-[#07143D] sm:inline">{SITE_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-3 text-xs font-medium text-slate-600 xl:flex" aria-label="Primary">
            {publicNav.map((item) => (
              <Link key={item.href} to={item.href} aria-current={current(item.href) ? 'page' : undefined} className={`whitespace-nowrap ${current(item.href) ? 'text-[#080A9F] underline decoration-[#C8A43D] decoration-2 underline-offset-8' : 'hover:text-[#080A9F]'}`}>{item.label}</Link>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center gap-2 xl:flex"><button type="button" onClick={requestEvermontInstall} className={installClass}><ArrowDownToLine className="size-4" /> Install</button><SignInLink /><OpenAccountButton /></div>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 text-[#080A9F] xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-navigation" className="border-t border-slate-100 bg-white px-4 py-3 xl:hidden" aria-label="Mobile">
            {publicNav.map((item) => (
              <Link key={item.href} to={item.href} onClick={() => setOpen(false)} aria-current={current(item.href) ? 'page' : undefined} className={`block rounded-xl px-3 py-2 text-base font-semibold ${current(item.href) ? 'bg-[#F5F7FB] text-[#080A9F]' : 'text-[#07143D] hover:bg-[#F5F7FB]'}`}>{item.label}</Link>
            ))}
            <div className="mt-3 grid gap-2">
              <OpenAccountButton className={`${openAccountClass} w-full`} />
              <SignInLink className="inline-flex w-full items-center justify-center rounded-full border border-[#080A9F]/20 px-4 py-2.5 text-sm font-semibold text-[#080A9F]" />
              <button type="button" onClick={() => { setOpen(false); requestEvermontInstall() }} className={`${installClass} w-full`}><ArrowDownToLine className="size-4" /> Install Evermont</button>
            </div>
          </nav>
        )}
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-[#F5F7FB]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="md:col-span-2 lg:col-span-1">
            <img src={LOGO_PATH} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">A thoughtful digital financial experience, with clear next steps and a dedicated member portal.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#07143D]">Private wealth, thoughtfully protected</p>
          </div>
          <nav aria-label="Quick links">
            <h2 className="text-sm font-semibold text-[#07143D]">Quick links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {quickLinks.map((item) => <li key={item.href}><Link to={item.href} className="text-slate-600 hover:text-[#080A9F]">{item.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Services">
            <h2 className="text-sm font-semibold text-[#07143D]">Services</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {serviceLinks.map((item) => <li key={item.href}><Link to={item.href} className="text-slate-600 hover:text-[#080A9F]">{item.label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <h2 className="text-sm font-semibold text-[#07143D]">Contact</h2>
            <address className="mt-3 space-y-2 text-sm not-italic text-slate-600">
              {MAILING_ADDRESS.map((line) => <p key={line}>{line}</p>)}
              <p><a href={SUPPORT_PHONE_TEL} className="font-semibold text-[#080A9F] hover:underline">{SUPPORT_PHONE_DISPLAY}</a></p>
              <p><a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#080A9F] hover:underline">{SUPPORT_EMAIL}</a></p>
            </address>
            <ul className="mt-4 space-y-2 text-sm">
              {legalNav.map((item) => <li key={item.href}><Link to={item.href} className="text-slate-600 hover:text-[#080A9F]">{item.label}</Link></li>)}
              <li><Link to="/security" className="text-slate-600 hover:text-[#080A9F]">Security information</Link></li>
              <li><button type="button" onClick={requestEvermontInstall} className="inline-flex items-center gap-2 font-semibold text-[#080A9F] hover:underline"><ArrowDownToLine className="size-4" /> Install Evermont</button></li>
              <li><a href="https://evermontcredit.online" className="text-slate-600 hover:text-[#080A9F]">Official website</a></li>
              <li><a href="https://x.com/evermont_credit?s=11" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-[#080A9F]">Twitter / X</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200/80">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs leading-5 text-slate-500 lg:px-8">Copyright © 2026 | Evermont Credit Union | All rights reserved.</p>
        </div>
      </footer>
      <PWAInstallExperience />
    </div>
  )
}
