import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Receipt, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'

const navItems = [
  { label: 'Overview', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Transactions', to: ROUTES.TRANSACTIONS, icon: Receipt },

]

export const PortalShell: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { signOut } = useAuth()
  const location = useLocation()
  const [open, setOpen] = React.useState(false)
  const initials = 'EC'

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-[#101533]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#101533] px-5 py-6 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between lg:block">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg" alt="Evermont Credit Union" className="size-11 rounded-xl object-cover" />
            <span><span className="block text-sm font-bold tracking-tight">EVERMONT</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d7b947]">Private wealth</span></span>
          </Link>
          <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"><X className="size-5" /></button>
        </div>
        <p className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Member banking</p>
        <nav aria-label="Member navigation" className="mt-4 space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => {
            const active = location.pathname === to
            return <Link key={to} to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-white text-[#0504AA]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}><Icon className="size-4" />{label}</Link>
          })}
        </nav>
        <div className="absolute inset-x-5 bottom-6 border-t border-white/10 pt-5">
          <a href="https://evermont.builder.cloud" className="mb-3 block rounded-xl border border-[#d7b947]/70 px-3 py-3 text-center text-sm font-semibold text-[#f1d879] hover:bg-[#d7b947] hover:text-[#101533]">Visit the Homepage</a>
          <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"><LogOut className="size-4" />Sign out</button>
        </div>
      </aside>
      {open && <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-[#101533]/50 lg:hidden" />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2 lg:hidden"><Menu className="size-5" /></button><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">Evermont Credit Union</p>{title && <h1 className="truncate text-lg font-semibold text-[#101533]">{title}</h1>}</div><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-[#0504AA] text-xs font-bold text-white">{initials}</div></div></div></header>
        <main>{children}</main>
      </div>
    </div>
  )
}
