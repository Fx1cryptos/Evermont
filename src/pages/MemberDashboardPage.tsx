import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, Bitcoin, Eye, EyeOff, Landmark, Menu, Receipt, Send, ShieldCheck, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivationRequiredModal } from '@/components/member/ActivationRequiredModal'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { accountService } from '@/services/accountService'
import { profileService } from '@/services/profileService'
import { supabase } from '@/lib/supabase'
import type { Account, Profile } from '@/types'

type Row = { id: string; created_at: string; description: string; category: string; debit: number | string | null; credit: number | string | null; amount: number | string; status: string }
const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const primaryBanner = 'https://ipfs.io/ipfs/bafkreic7sm7xud7ym3hzcsn7pmd6bfpn4fephp2jefuwa7s64nbji2vaou'
const secondaryBanner = 'https://ipfs.io/ipfs/bafkreigu3dqbkftkvhuqmer7tuban6pz3ai2tnujocinux5y6akudt3gui'
const banner = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6684-TAR49mu8oRotUkw9u5onAAE9VpJLKL.jpeg'

export const MemberDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [hidden, setHidden] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [primaryBannerError, setPrimaryBannerError] = useState(false)
  const [secondaryBannerError, setSecondaryBannerError] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts])

  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([profileService.getProfile(user.id), accountService.getAccounts(user.id)]).then(async ([p, a]) => {
      if (!active) return
      setProfile(p)
      setAccounts(a)
      const ids = a.map(account => account.id)
      if (!ids.length) return
      const { data, error: queryError } = await supabase.from('ledger_entries').select('id,created_at,description,category,debit,credit,amount,status').eq('member_id', user.id).in('account_id', ids).order('created_at', { ascending: false }).limit(5)
      if (queryError) setError('We could not load recent activity.')
      else setRows((data || []) as Row[])
    }).catch(() => setError('We could not load your member information.')).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  const display = (value: unknown) => hidden ? '••••••' : money(value)

  const requestMovement = () => setGateOpen(true)

  if (authLoading || loading) return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading your member portal...</main>
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in to member banking</Link></main>
  return <PortalShell title={`Welcome, ${profile?.firstName || user.firstName}.`} eyebrow="Your money. Your community. Your future.">
    {!primaryBannerError && <div className="mt-7 overflow-hidden rounded-3xl border border-[#C9A227]/40 bg-white shadow-sm"><img src={primaryBanner} alt="Evermont Credit Union private wealth promotion" className="h-auto w-full object-contain" onError={() => setPrimaryBannerError(true)} /></div>}
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-slate-600">Your financial life, thoughtfully organized.</p><button onClick={() => setHidden(!hidden)} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm">{hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}{hidden ? 'Show balances' : 'Hide balances'}</button></div>
    <section className="mt-7 overflow-hidden rounded-3xl bg-[#0504AA] text-white shadow-xl shadow-blue-950/15"><div className="grid lg:grid-cols-[1.2fr_.8fr]"><div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#C9A227]">Total relationship balance</p><p className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{hidden ? '••••••' : money(total)}</p><p className="mt-3 max-w-md text-sm leading-6 text-blue-100">A clear view across your authorized Evermont accounts.</p><div className="mt-7 flex flex-wrap gap-3"><Link to={ROUTES.ACCOUNTS} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0504AA]">View accounts</Link><Link to={ROUTES.TRANSACTIONS} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white">View activity</Link><button type="button" onClick={requestMovement} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white">Transfer</button><button type="button" onClick={requestMovement} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white">Withdraw</button></div></div><div className="hidden min-h-56 bg-white/10 lg:block"><img src={banner} alt="Evermont private wealth services" className="h-full w-full object-cover opacity-90" /></div></div></section>
    <div className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Your accounts</h2><Link to={ROUTES.ACCOUNTS} className="text-sm font-semibold text-[#0504AA]">Manage accounts</Link></div><div className="grid gap-4 sm:grid-cols-2">{accounts.length ? accounts.map(account => <article key={account.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div className="rounded-xl bg-blue-50 p-2.5 text-[#0504AA]"><Landmark className="size-5" /></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{account.status}</span></div><p className="mt-5 text-sm capitalize text-slate-500">{account.accountType} · {account.accountNumber || 'Account'}</p><p className="mt-1 text-2xl font-semibold">{display(account.balance)}</p></article>) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No accounts are available for this member.</p>}</div></section><section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Recent activity</h2><Link to={ROUTES.TRANSACTIONS} className="text-sm font-semibold text-[#0504AA]">See all</Link></div><div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">{error ? <p className="p-5 text-sm text-red-700">{error}</p> : rows.length ? rows.map(row => { const credit = Number(row.credit || 0) > 0; return <div key={row.id} className="flex items-center justify-between gap-3 p-4"><div className="flex min-w-0 items-center gap-3"><div className={`rounded-full p-2 ${credit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{credit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{row.description}</p><p className="text-xs text-slate-500">{new Date(row.created_at).toLocaleDateString()} · {row.status}</p></div></div><p className={`shrink-0 text-sm font-semibold ${credit ? 'text-emerald-700' : 'text-slate-800'}`}>{credit ? '+' : '-'}{display(row.credit || row.debit || row.amount)}</p></div> }) : <p className="p-5 text-sm text-slate-500">No recent activity is available.</p>}</div></section></div>
    <section className="mt-8" aria-labelledby="banking-services-title"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#C9A227]">Everyday banking</p><h2 id="banking-services-title" className="mt-1 text-2xl font-semibold text-[#101533]">Banking Services</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[{label:'Transfer', icon:Send, action:true},{label:'Withdraw', icon:WalletCards, action:true},{label:'ACH', icon:Send, action:true},{label:'Mobile Debit', icon:WalletCards, action:true},{label:'Virtual Card', icon:WalletCards, action:true},{label:'Bill Pay', icon:Receipt, action:true},{label:'Buy Cryptocurrency', icon:Bitcoin, action:true},{label:'Sell Cryptocurrency', icon:BarChart3, action:true}].map(({label, icon:Icon, action}) => <button key={label} type="button" onClick={action ? requestMovement : undefined} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-[#0504AA]/8 text-[#0504AA]"><Icon className="size-5" /></span><span className="mt-4 block text-sm font-semibold leading-5 text-[#101533]">{label}</span><span className="mt-1 block text-xs text-slate-500">Contact support to activate</span></button>)}<Link to={ROUTES.ACCOUNTS} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-[#0504AA]/8 text-[#0504AA]"><Landmark className="size-5" /></span><span className="mt-4 block text-sm font-semibold text-[#101533]">Accounts</span><span className="mt-1 block text-xs text-slate-500">View your accounts</span></Link><Link to={ROUTES.TRANSACTIONS} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-[#0504AA]/8 text-[#0504AA]"><Receipt className="size-5" /></span><span className="mt-4 block text-sm font-semibold text-[#101533]">Transactions</span><span className="mt-1 block text-xs text-slate-500">Review activity</span></Link></div></section>
    {!secondaryBannerError && <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><img src={secondaryBanner} alt="Evermont Credit Union banking promotion" className="h-auto w-full rounded-xl object-contain" onError={() => setSecondaryBannerError(true)} /></section>}
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(5,4,170,0.08)] backdrop-blur md:hidden" aria-label="Mobile banking navigation"><div className="mx-auto grid max-w-md grid-cols-4 gap-1"><Link to={ROUTES.DASHBOARD} className="flex flex-col items-center gap-1 rounded-xl bg-[#0504AA] px-2 py-2 text-[11px] font-semibold text-white"><Landmark className="size-4" />Dashboard</Link><Link to={ROUTES.ACCOUNTS} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-600"><WalletCards className="size-4" />Accounts</Link><button type="button" onClick={requestMovement} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-600"><Send className="size-4" />Transfer &amp; Pay</button><Link to={ROUTES.INSIGHTS} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-slate-600"><Menu className="size-4" />More</Link></div></nav>
    <div className="mb-20 mt-7 flex items-center gap-2 text-xs text-slate-500 md:mb-0"><ShieldCheck className="size-4 text-[#0504AA]" />Your member information is protected by Evermont security controls.</div>
    <ActivationRequiredModal open={gateOpen} onClose={() => setGateOpen(false)} />
  </PortalShell>
}
export default MemberDashboardPage
