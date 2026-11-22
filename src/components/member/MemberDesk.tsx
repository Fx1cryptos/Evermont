import { Link } from 'react-router-dom'
import { ArrowUpRight, Bell, FileText, Headphones, Receipt, ShieldCheck, UserRound, Users, Wallet } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const links = [
  ['My accounts',ROUTES.ACCOUNTS,Wallet],['Beneficiaries',ROUTES.BENEFICIARIES,Users],
  ['Transaction history',ROUTES.TRANSACTIONS,Receipt],['Statements','/statements',FileText],
  ['Notifications','/alerts',Bell],['Activation',ROUTES.ACTIVATION,ShieldCheck],
  ['Help & support',ROUTES.SUPPORT,Headphones],['Profile & security',ROUTES.PROFILE,UserRound],
] as const

export function MemberDesk() {
  return <nav aria-label="Member shortcuts" className="private-surface p-5">
    <p className="private-overline">Member services</p><h2 className="private-heading mb-4">Your banking desk</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4">{links.map(([name,path,Icon])=>
      <Link key={path} to={path} className="group flex min-h-14 items-center gap-3 border-t border-slate-100 px-2 text-sm font-semibold hover:bg-slate-50">
        <Icon size={18} className="text-[#0504AA]"/>{name}<ArrowUpRight size={14} className="ml-auto text-slate-400"/>
      </Link>)}</div></nav>
}

export function DashboardSkeleton() {
  return <main className="mx-auto grid min-h-screen max-w-5xl content-start gap-6 p-6" aria-busy="true" aria-label="Loading your member portal"><span className="private-overline">Account overview</span>{[160,84,240].map(height=><div key={height} className="animate-pulse rounded-3xl bg-slate-200" style={{height}}/>)}</main>
}
