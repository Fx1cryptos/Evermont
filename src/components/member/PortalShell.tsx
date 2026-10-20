import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, BarChart3, Briefcase, ChevronRight, Headphones, LayoutDashboard, LogOut, Menu, Receipt, Settings, ShieldCheck, UserRound, WalletCards, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'

const logo = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg'
const navigation = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Accounts', to: ROUTES.ACCOUNTS, icon: WalletCards },
  { label: 'Transactions', to: ROUTES.TRANSACTIONS, icon: Receipt },
  { label: 'Insights', to: ROUTES.INSIGHTS, icon: BarChart3 },
  { label: 'Support', to: ROUTES.SUPPORT, icon: Headphones },
  { label: 'Profile', to: ROUTES.PROFILE, icon: UserRound },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
]

export const PortalShell: React.FC<React.PropsWithChildren<{ title: string; eyebrow?: string }>> = ({ title, eyebrow = 'Member portal', children }) => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const goBack = () => window.history.back()
  const goForward = () => window.history.forward()
  const handleSignOut = async () => {
    try {
      await signOut()
      setOpen(false)
      navigate(ROUTES.LOGIN, { replace: true })
    } catch {
      // AuthContext retains the error for the existing auth UI.
    }
  }
  return <div className="min-h-screen bg-[#f7f8fc] text-[#101533]">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-5 px-5 lg:px-8">
        <Link to={ROUTES.DASHBOARD} className="flex shrink-0 items-center gap-3" aria-label="Evermont member dashboard">
          <img src={logo} alt="Evermont Credit Union" className="size-11 rounded-xl object-cover" />
          <span><strong className="block text-sm tracking-tight text-[#0504AA]">EVERMONT</strong><small className="block text-[10px] font-semibold uppercase tracking-[.18em] text-[#C9A227]">Credit Union</small></span>
        </Link>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Member navigation">{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-[#0504AA] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><Icon className="size-4" />{label}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 lg:flex"><div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1" aria-label="Browser navigation"><button type="button" onClick={goBack} aria-label="Go back" title="Go back" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0504AA]"><ArrowLeft className="size-4" /></button><button type="button" onClick={goForward} aria-label="Go forward" title="Go forward" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0504AA]"><ArrowRight className="size-4" /></button></div><a href="https://evermontcredit.online" target="_blank" rel="noreferrer" className="rounded-xl border border-[#0504AA] px-4 py-2.5 text-sm font-semibold text-[#0504AA] transition hover:bg-[#0504AA] hover:text-white">Visit Evermont</a><a href="https://evermont-credit-unio-2tld.bolt.host" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Briefcase className="size-4" />Business &amp; Operations</a><button onClick={() => void handleSignOut()} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"><LogOut className="size-4" />Sign out</button></div>
        <button onClick={() => setOpen(!open)} className="rounded-xl border border-slate-200 p-2.5 xl:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {open && <nav className="border-t border-slate-200 bg-white p-4 xl:hidden" aria-label="Mobile member navigation"><div className="mb-3 flex gap-2"><button type="button" onClick={goBack} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"><ArrowLeft className="size-4" />Back</button><button type="button" onClick={goForward} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Forward<ArrowRight className="size-4" /></button></div><div className="grid gap-1">{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} onClick={() => setOpen(false)} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 font-semibold ${isActive ? 'bg-[#0504AA] text-white' : 'text-slate-700 hover:bg-slate-100'}`}><Icon className="size-4" />{label}</NavLink>)}</div><div className="mt-3 grid gap-2 border-t border-slate-100 pt-3"><a href="https://evermontcredit.online" target="_blank" rel="noreferrer" className="rounded-xl border border-[#0504AA] px-3 py-3 text-center font-semibold text-[#0504AA]">Visit Evermont</a><a href="https://evermont-credit-unio-2tld.bolt.host" target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 px-3 py-3 text-center font-semibold text-slate-700">Business &amp; Operations</a><button onClick={() => void handleSignOut()} className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-semibold text-slate-500"><LogOut className="size-4" />Sign out</button></div></nav>}
    </header>
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#C9A227]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>{children}</main>
  </div>
}

export const SupportCard: React.FC = () => <aside className="rounded-2xl bg-[#0504AA] p-5 text-white"><div className="flex items-center gap-3"><div className="rounded-xl bg-white/10 p-2"><ShieldCheck className="size-5 text-[#C9A227]" /></div><div><p className="font-semibold">Need help?</p><p className="text-sm text-blue-100">Our member support team is here.</p></div></div><Link to={ROUTES.SUPPORT} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C9A227]">Contact support <ChevronRight className="size-4" /></Link></aside>
