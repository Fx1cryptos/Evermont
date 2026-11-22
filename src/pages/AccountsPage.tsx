import React, { useEffect, useState } from 'react'
import { Landmark, ShieldCheck } from 'lucide-react'
import { PortalShell, SupportCard } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { accountService } from '@/services/accountService'
import { maskAccount } from '@/lib/bankingServices'
import type { Account } from '@/types'

const money = (value: unknown, currency: string) => value != null && Number.isFinite(Number(value)) && /^[A-Z]{3}$/.test(currency) ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value)) : 'Unavailable'

export const AccountsPage: React.FC = () => {
  const { user } = useAuth()
  const [hidden, setHidden] = useState(false)
  const [revealed, reveal] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    void accountService.getAccounts(user.id).then(data => { if (active) setAccounts(data) }).catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  return <PortalShell title="Your accounts" eyebrow="Account overview">
    <button className="mt-3 rounded-xl border bg-white px-4 py-2" aria-pressed={hidden} onClick={()=>setHidden(!hidden)}>{hidden ? "Show" : "Hide"} balances</button>
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Authorized accounts">
        {loading ? <p className="text-slate-500">Loading your accounts...</p> : error ? <p role="alert">Your account details are currently unavailable.</p> : accounts.length ? accounts.map(account => <article key={account.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div className="rounded-xl bg-blue-50 p-3 text-[#080A9F]"><Landmark className="size-5" /></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">{account.status}</span></div><p className="mt-6 text-sm capitalize text-slate-500">{account.accountType}</p><p className="mt-1 text-3xl font-semibold">{hidden ? "••••••" : money(account.balance, account.currency)}</p><p className="mt-3 text-sm text-slate-500">{account.accountNumber ? (revealed === account.id ? account.accountNumber : maskAccount(account.accountNumber)) : 'Account number unavailable'}</p>{account.accountNumber && <button className="mt-2 text-sm font-semibold text-[#0504AA]" aria-pressed={revealed === account.id} onClick={() => reveal(revealed === account.id ? null : account.id)}>{revealed === account.id ? 'Hide' : 'Show'} account number</button>}</article>) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No authorized accounts are available.</p>}
      </section>
      <SupportCard />
    </div>
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="account-security-title"><div className="flex items-start gap-4"><div className="rounded-xl bg-[#080A9F]/10 p-3 text-[#080A9F]"><ShieldCheck className="size-5" /></div><div><h2 id="account-security-title" className="text-xl font-semibold tracking-tight text-[#080A9F]">Account security and access</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Your account balances above are read from your authenticated member record. Account access and service eligibility are verified through secure account procedures. Contact Support with questions; no payment is required on this page to view or protect your existing funds.</p></div></div></section>
  </PortalShell>
}
