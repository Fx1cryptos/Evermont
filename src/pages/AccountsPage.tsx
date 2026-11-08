import React, { useEffect, useState } from 'react'
import { Landmark, ShieldCheck } from 'lucide-react'
import { PortalShell, SupportCard } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { accountService } from '@/services/accountService'
import type { Account } from '@/types'

const money = (value: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

export const AccountsPage: React.FC = () => {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    void accountService.getAccounts(user.id).then(setAccounts).finally(() => setLoading(false))
  }, [user])

  return <PortalShell title="Your accounts" eyebrow="Account overview">
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Authorized accounts">
        {loading ? <p className="text-slate-500">Loading your accounts...</p> : accounts.length ? accounts.map(account => <article key={account.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div className="rounded-xl bg-blue-50 p-3 text-[#0504AA]"><Landmark className="size-5" /></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">{account.status}</span></div><p className="mt-6 text-sm capitalize text-slate-500">{account.accountType}</p><p className="mt-1 text-3xl font-semibold">{money(account.balance)}</p><p className="mt-3 text-sm text-slate-500">{account.accountNumber || 'Account number unavailable'}</p></article>) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No authorized accounts are available.</p>}
      </section>
      <SupportCard />
    </div>
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="account-security-title"><div className="flex items-start gap-4"><div className="rounded-xl bg-[#0504AA]/10 p-3 text-[#0504AA]"><ShieldCheck className="size-5" /></div><div><h2 id="account-security-title" className="text-xl font-semibold tracking-tight text-[#0504AA]">Account security and access</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Your account balances above are read from your authenticated member record. Account access and service eligibility are verified through secure account procedures. Contact Support with questions; no payment is required on this page to view or protect your existing funds.</p></div></div></section>
  </PortalShell>
}
