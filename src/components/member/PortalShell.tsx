import React, { useState } from 'react'
import { Bell, Headphones, LayoutDashboard, LogOut, Menu, Receipt, Search, ShieldCheck, UserRound, WalletCards, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { LOGO_PATH, SITE_NAME, SITE_POSITIONING, SITE_TAGLINE, SITE_TAGLINE_SECOND, SUPPORT_EMAIL } from '@/config/site'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { label: 'Overview', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'My Accounts', to: ROUTES.ACCOUNTS, icon: WalletCards },
  { label: 'Beneficiaries', to: ROUTES.BENEFICIARIES, icon: UserRound },
  { label: 'Transactions', to: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Statements', to: '/statements', icon: Receipt },
  { label: 'Activation', to: ROUTES.ACTIVATION, icon: ShieldCheck },
  { label: 'Profile & Security', to: ROUTES.PROFILE, icon: UserRound },
  { label: 'Help & Support', to: ROUTES.SUPPORT, icon: Headphones },
]

const navClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-[#0504AA] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0504AA]'}`

export const PortalShell: React.FC<React.PropsWithChildren<{ title: string; eyebrow?: string }>> = ({ title, eyebrow = 'Member portal', children }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const handleSignOut = async () => { try { await signOut(); navigate(ROUTES.LOGIN, { replace: true }) } catch { /* AuthContext retains the error. */ } }
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Member'

  const brand = (onNavigate?: () => void) => (
    <Link to={ROUTES.DASHBOARD} onClick={onNavigate} className="flex min-w-0 items-center gap-3" aria-label={`${SITE_NAME} member overview`}>
      <img src={LOGO_PATH} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-contain" />
      <span className="min-w-0">
        <strong className="block truncate text-sm tracking-tight text-[#0504AA]">{SITE_NAME}</strong>
        <small className="block truncate text-[10px] font-semibold uppercase tracking-[.14em] text-[#C9A227]">{SITE_POSITIONING}</small>
      </span>
    </Link>
  )

  const links = (onNavigate?: () => void) => navigation.map(({ label, to, icon: Icon }) => (
    <NavLink key={to} to={to} className={navClass} onClick={onNavigate}><Icon className="size-4" aria-hidden="true" />{label}</NavLink>
  ))

  return <div className="min-h-screen bg-[#f6f7fb] text-[#101533]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      {brand()}
      <p className="mt-6 px-3 text-xs leading-5 text-slate-500">{SITE_TAGLINE}</p>
      <nav className="mt-6 grid gap-1" aria-label="Member navigation">{links()}</nav>
      <div className="mt-auto border-t border-slate-100 pt-4">
        <p className="truncate px-3 text-xs text-slate-500">{displayName}</p>
        <button type="button" onClick={() => void handleSignOut()} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><LogOut className="size-4" aria-hidden="true" />Log out</button>
      </div>
    </aside>
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:ml-64">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-200 p-2 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
          <img src={LOGO_PATH} alt="" width={32} height={32} className="size-8 rounded-md object-contain lg:hidden" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#C9A227]">{eyebrow}</p>
            <h1 className="text-lg font-semibold tracking-tight text-[#101533] sm:text-xl">{title}</h1>
          </div>
        </div>
        <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex"><Search className="size-4 text-slate-400" aria-hidden="true" /><input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" aria-label="Search member portal" placeholder="Search portal" /></div>
        <div className="flex items-center gap-2"><Link to="/alerts" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell className="size-5" aria-hidden="true" /></Link><span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />Secure</span><button type="button" onClick={() => void handleSignOut()} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:hidden">Log out</button></div>
      </div>
    </header>
    {open && <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)}>
      <nav className="flex h-full w-[min(86vw,320px)] flex-col bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()} aria-label="Mobile member navigation">
        <div className="flex items-center justify-between gap-3">{brand(() => setOpen(false))}<button type="button" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-5 shrink-0" /></button></div>
        <div className="mt-6 grid gap-1">{links(() => setOpen(false))}</div>
        <button type="button" onClick={() => void handleSignOut()} className="mt-auto flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600"><LogOut className="size-4" aria-hidden="true" />Log out</button>
      </nav>
    </div>}
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:ml-64">
      <main className="flex-1"><div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">{children}</div></main>
      <footer className="border-t border-slate-200 bg-white px-4 py-5 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_PATH} alt="" width={32} height={32} className="size-8 rounded-md object-contain" />
            <div className="text-xs leading-5 text-slate-500">
              <p className="font-semibold text-[#0504AA]">{SITE_NAME}</p>
              <p>{SITE_TAGLINE}</p>
              <p>{SITE_TAGLINE_SECOND}</p>
            </div>
          </div>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-semibold text-[#0504AA] hover:text-[#C9A227]">Contact support</a>
        </div>
      </footer>
    </div>
  </div>
}

export const SupportCard: React.FC = () => <aside className="rounded-xl border border-slate-200 bg-white p-5"><p className="font-semibold text-[#0504AA]">Support</p><p className="mt-1 text-sm text-slate-600">Message the member support team. This does not submit a transaction.</p><Link to={ROUTES.SUPPORT} className="mt-3 inline-block text-sm font-semibold text-[#0504AA] hover:text-[#C9A227]">Open support</Link></aside>
