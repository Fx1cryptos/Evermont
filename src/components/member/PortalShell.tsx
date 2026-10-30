import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, BarChart3, Briefcase, ChevronRight, Headphones, LayoutDashboard, LogOut, Menu, Receipt, Settings, ShieldCheck, UserRound, WalletCards, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'My Accounts', to: ROUTES.ACCOUNTS, icon: WalletCards },
  { label: 'Activation', to: ROUTES.ACTIVATION, icon: ShieldCheck },
  { label: 'Transactions', to: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Insights', to: ROUTES.INSIGHTS, icon: BarChart3 },
  { label: 'Help & Support', to: ROUTES.SUPPORT, icon: Headphones },
  { label: 'Profile', to: ROUTES.PROFILE, icon: UserRound },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
]

const navClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#0504AA] text-white shadow-[0_8px_20px_rgba(5,4,170,0.18)]' : 'text-slate-600 hover:bg-[#eef0ff] hover:text-[#0504AA]'}`

export const PortalShell: React.FC<React.PropsWithChildren<{ title: string; eyebrow?: string }>> = ({ title, eyebrow = 'Member portal', children }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const handleSignOut = async () => { try { await signOut(); navigate(ROUTES.LOGIN, { replace: true }) } catch { /* AuthContext retains the error. */ } }
  const displayName = user?.email?.split('@')[0] || 'Member'

  return <div className="min-h-screen bg-[#f6f7fb] text-[#101533]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] border-r border-slate-200 bg-white px-4 py-5 lg:flex lg:flex-col">
      <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 px-2" aria-label="Evermont member dashboard">
        <img src="/images/evermont-logo.svg" alt="Evermont Credit Union" className="size-11 rounded-xl object-cover ring-1 ring-[#0504AA]/10" />
        <span><strong className="block text-sm tracking-tight text-[#0504AA]">EVERMONT</strong><small className="block text-[10px] font-semibold uppercase tracking-[.18em] text-[#C9A227]">Credit Union</small></span>
      </Link>
      <div className="mt-8 rounded-2xl bg-[#f6f7fb] p-3"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#C9A227]">Private wealth</p><p className="mt-1 text-sm font-semibold text-[#101533]">Welcome, {String(displayName).split(' ')[0]}</p><p className="mt-1 text-xs text-slate-500">Where private wealth is protected.</p></div>
      <nav className="mt-7 grid gap-1" aria-label="Member navigation">{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} className={navClass}><Icon className="size-4" />{label}</NavLink>)}</nav>
      <div className="mt-auto border-t border-slate-100 pt-4"><a href="https://evermontcredit.online" target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Briefcase className="size-4" />Visit Evermont Website</a><button type="button" onClick={() => void handleSignOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"><LogOut className="size-4" />Secure logout</button></div>
    </aside>
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-[258px]">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 lg:px-8"><div className="flex items-center gap-3"><button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2.5 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#C9A227]">{eyebrow}</p><h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[#101533] sm:text-2xl">{title}</h1></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => window.history.back()} className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0504AA] sm:block" aria-label="Go back"><ArrowLeft className="size-4" /></button><button type="button" onClick={() => window.history.forward()} className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0504AA] sm:block" aria-label="Go forward"><ArrowRight className="size-4" /></button><div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />Secure session</div><Link to={ROUTES.PROFILE} className="flex size-10 items-center justify-center rounded-full bg-[#0504AA] text-sm font-bold text-white" aria-label="Open profile">{String(displayName).charAt(0).toUpperCase()}</Link></div></div>
      {open && <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)}><nav className="h-full w-[min(86vw,320px)] bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()} aria-label="Mobile member navigation"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#0504AA]">EVERMONT</span><button type="button" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-5" /></button></div><div className="mt-7 grid gap-1">{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} onClick={() => setOpen(false)} to={to} className={navClass}><Icon className="size-4" />{label}</NavLink>)}</div><button type="button" onClick={() => void handleSignOut()} className="mt-8 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500"><LogOut className="size-4" />Secure logout</button></nav></div>}
    </header>
    <main className="min-h-[calc(100vh-72px)] lg:ml-[258px]"><div className="mx-auto max-w-[1320px] px-5 py-6 lg:px-8 lg:py-8">{children}</div></main>
  </div>
}

export const SupportCard: React.FC = () => <aside className="rounded-2xl bg-[#0504AA] p-5 text-white"><div className="flex items-center gap-3"><div className="rounded-xl bg-white/10 p-2"><ShieldCheck className="size-5 text-[#C9A227]" /></div><div><p className="font-semibold">Need help?</p><p className="text-sm text-blue-100">Our member support team is here.</p></div></div><Link to={ROUTES.SUPPORT} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C9A227]">Contact support <ChevronRight className="size-4" /></Link></aside>
