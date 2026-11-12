import React, { useEffect, useState } from 'react'
import { Bell, CreditCard, FileText, Headphones, LayoutDashboard, LogOut, Menu, Receipt, Send, ShieldCheck, UserRound, WalletCards, X, Home, Landmark, Smartphone } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { LOGO_PATH, SITE_NAME, SITE_TAGLINE, SITE_TAGLINE_SECOND, SITE_URL, SUPPORT_EMAIL } from '@/config/site'
import { useAuth } from '@/contexts/AuthContext'

const groups = [
  { label: 'Main', items: [
    { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'My Accounts', to: ROUTES.ACCOUNTS, icon: WalletCards },
  ] },
  { label: 'Banking', items: [
    { label: 'Transfers & Payments', to: '/services/ach', icon: Send },
    { label: 'Wire Transfers', to: '/services/wire', icon: Landmark },
    { label: 'Check Deposits', to: '/services/check-deposit', icon: Smartphone },
    { label: 'Beneficiaries', to: ROUTES.BENEFICIARIES, icon: UserRound },
    { label: 'Transaction History', to: ROUTES.TRANSACTIONS, icon: Receipt },
    { label: 'Statements', to: '/statements', icon: FileText },
    { label: 'Cards', to: '/services/virtual-card', icon: CreditCard },
  ] },
  { label: 'Account management', items: [
    { label: 'Notifications', to: '/alerts', icon: Bell },
    { label: 'Account Activation', to: ROUTES.ACTIVATION, icon: ShieldCheck },
    { label: 'Profile & Security', to: ROUTES.PROFILE, icon: UserRound },
  ] },
  { label: 'Support', items: [
    { label: 'Help & Support', to: ROUTES.SUPPORT, icon: Headphones },
  ] },
]

const navClass = ({ isActive }: { isActive: boolean }) => `flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${isActive ? 'bg-[#080A9F] text-white shadow-sm shadow-[#080A9F]/20' : 'text-slate-600 hover:bg-slate-100 hover:text-[#080A9F]'}`

export const PortalShell: React.FC<React.PropsWithChildren<{ title: string; eyebrow?: string }>> = ({ title, eyebrow = 'Member portal', children }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const handleSignOut = async () => { try { await signOut(); navigate(ROUTES.LOGIN, { replace: true }) } catch { /* AuthContext retains the error. */ } }
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Member'

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const brand = (onNavigate?: () => void) => (
    <Link to={ROUTES.DASHBOARD} onClick={onNavigate} className="flex min-w-0 items-center gap-3" aria-label={`${SITE_NAME} member dashboard`}>
      <img src={LOGO_PATH} alt="" width={42} height={42} className="size-10 shrink-0 rounded-xl object-contain" />
      <span className="min-w-0"><strong className="block truncate text-sm tracking-tight text-[#07143D]">EVERMONT</strong><small className="block truncate text-[9px] font-bold uppercase tracking-[.13em] text-[#C8A43D]">Credit Union</small></span>
    </Link>
  )

  const linkGroups = (onNavigate?: () => void) => groups.map(group => (
    <div key={group.label}>
      <p className="mb-1 mt-5 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400">{group.label}</p>
      <div className="grid gap-0.5">{group.items.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} className={navClass} onClick={onNavigate}><Icon className="size-4 shrink-0" aria-hidden="true" />{label}</NavLink>)}</div>
    </div>
  ))

  return <div className="min-h-screen bg-[#F5F7FB] text-[#172033]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-slate-200/80 bg-white px-4 pb-4 pt-5 lg:flex">
      {brand()}
      <div className="mt-5 rounded-xl bg-[#07143D] px-3.5 py-3 text-white"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#C8A43D]">Private wealth</p><p className="mt-1 text-xs font-medium leading-5 text-white/85">{SITE_TAGLINE}</p></div>
      <nav className="mt-2 flex-1 overflow-y-auto pb-4" aria-label="Member navigation">
        <a href={SITE_URL} className="mt-4 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#080A9F]"><Home className="size-4" aria-hidden="true" />Homepage<span className="sr-only"> opens the public website in this tab</span></a>
        {linkGroups()}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#080A9F]"><Headphones className="size-4" aria-hidden="true" />Contact Us</a>
      </nav>
      <div className="border-t border-slate-100 pt-3">
        <Link to={ROUTES.PROFILE} className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#080A9F]/10 text-sm font-bold text-[#080A9F]" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span><span className="min-w-0"><strong className="block truncate text-xs text-[#07143D]">{displayName}</strong><span className="block truncate text-[10px] text-slate-500">Member profile</span></span></Link>
        <button type="button" onClick={() => void handleSignOut()} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"><LogOut className="size-4" aria-hidden="true" />Log out</button>
      </div>
    </aside>

    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur lg:ml-[264px]">
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2 text-[#07143D] lg:hidden" aria-label="Open member navigation" aria-expanded={open}><Menu className="size-5" /></button>
          <Link to={ROUTES.DASHBOARD} className="lg:hidden" aria-label="Evermont member dashboard"><img src={LOGO_PATH} alt="" width={34} height={34} className="size-[34px] rounded-lg object-contain" /></Link>
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#C8A43D]">{eyebrow}</p><h1 className="truncate text-base font-semibold tracking-tight text-[#07143D] sm:text-lg">{title}</h1></div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3"><Link to="/alerts" className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#080A9F]" aria-label="Notifications"><Bell className="size-5" aria-hidden="true" /></Link><span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />Secure session</span><Link to={ROUTES.PROFILE} className="hidden size-9 items-center justify-center rounded-full bg-[#07143D] text-sm font-semibold text-white sm:flex" aria-label={`Profile: ${displayName}`}>{displayName.charAt(0).toUpperCase()}</Link></div>
      </div>
    </header>

    {open && <div className="fixed inset-0 z-50 bg-[#07143D]/45 lg:hidden" onClick={() => setOpen(false)}>
      <nav className="flex h-full w-[min(86vw,340px)] flex-col bg-white p-4 shadow-2xl" onClick={event => event.stopPropagation()} aria-label="Mobile member navigation" aria-modal="true" role="dialog">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">{brand(() => setOpen(false))}<button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X className="size-5 shrink-0" /></button></div>
        <div className="my-3 flex items-center gap-3 rounded-xl bg-[#F5F7FB] p-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#080A9F]/10 text-sm font-bold text-[#080A9F]">{displayName.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#07143D]">{displayName}</p><p className="truncate text-xs text-slate-500">Secure member access</p></div></div>
        <div className="flex-1 overflow-y-auto pb-4"><a href={SITE_URL} onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Home className="size-4" aria-hidden="true" />Homepage</a>{linkGroups(() => setOpen(false))}<a href={`mailto:${SUPPORT_EMAIL}`} onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Headphones className="size-4" aria-hidden="true" />Contact Us</a></div>
        <button type="button" onClick={() => void handleSignOut()} className="mt-3 flex items-center gap-2 border-t border-slate-100 px-3 pt-4 text-sm font-semibold text-slate-600"><LogOut className="size-4" aria-hidden="true" />Log out</button>
      </nav>
    </div>}

    <div className="flex min-h-[calc(100vh-4.25rem)] flex-col lg:ml-[264px]">
      <main className="flex-1"><div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div></main>
      <footer className="border-t border-slate-200/80 bg-white px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><img src={LOGO_PATH} alt="" width={32} height={32} className="size-8 rounded-lg object-contain" /><div className="text-[11px] leading-5 text-slate-500"><p className="font-semibold text-[#07143D]">{SITE_NAME}</p><p>{SITE_TAGLINE_SECOND}</p></div></div><a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-semibold text-[#080A9F] hover:text-[#C8A43D]">Contact support</a></div></footer>
    </div>
  </div>
}

export const SupportCard: React.FC = () => <aside className="rounded-xl border border-slate-200 bg-white p-5"><p className="font-semibold text-[#080A9F]">Support</p><p className="mt-1 text-sm text-slate-600">Message the member support team. This does not submit a transaction.</p><Link to={ROUTES.SUPPORT} className="mt-3 inline-block text-sm font-semibold text-[#080A9F] hover:text-[#C8A43D]">Open support</Link></aside>
