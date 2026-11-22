import React, { useState } from 'react'
import { Activity, RefreshCw, ShieldCheck } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

type Check = {state:'available'|'unavailable'|'not_configured';detail:string}
type Health = {
  checkedAt:string; authentication:Check; database:Check; gemini:Check; gmail:Check
  supportOpen:number|null; failedNotifications:number|null; lastMailboxSync:string|null
}
const label = (value:number|null) => value == null ? 'Unavailable' : value.toLocaleString()

export const AdminAutomationPage: React.FC = () => {
  const [data,setData] = useState<Health|null>(null)
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  async function check() {
    setBusy(true);setError('')
    try {
      const {data:session,error:sessionError} = await supabase.auth.getSession()
      if (sessionError || !session.session?.access_token) throw Error('Sign in again to continue.')
      const response = await fetch('/api/automation-health',{headers:{Authorization:`Bearer ${session.session.access_token}`},cache:'no-store',signal:AbortSignal.timeout(25000)})
      if (!response.ok) throw Error(response.status === 403 ? 'Administrator access required.' : 'Unable to check automation status.')
      setData(await response.json() as Health)
    } catch (e) { setData(null);setError(e instanceof Error ? e.message : 'Unable to check automation status.') }
    finally {setBusy(false)}
  }

  return <AdminLayout><div className="mx-auto max-w-6xl space-y-6 text-[#07142D]">
    <header className="rounded-3xl bg-[#07142D] p-7 text-white sm:p-9">
      <p className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">EVERMONT · Administration</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-3xl">Automation &amp; health</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Review support queue counts and check service availability on demand.</p></div>
      <button disabled={busy} onClick={()=>void check()} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0504AA] disabled:opacity-60"><RefreshCw className={`size-4 ${busy?'animate-spin':''}`} />{busy?'Checking…':'Check status'}</button></div>
    </header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {!data && !error && <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Run a status check to view current results.</p>}
    {data && <>
      <p className="text-sm text-slate-500">Checked {new Date(data.checkedAt).toLocaleString()}. Checks do not send messages.</p>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Service checks">
        {([['Authentication',data.authentication],['Database',data.database],['Gemini',data.gemini],['Gmail',data.gmail]] as const).map(([name,check])=><article key={name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Activity className="size-5 text-[#0504AA]" /><h2 className="mt-4 font-semibold">{name}</h2><p className={`mt-2 text-sm font-semibold ${check.state==='available'?'text-emerald-700':'text-amber-800'}`}>{check.state==='available'?'Available':check.state==='not_configured'?'Not configured':'Unavailable'}</p><p className="mt-2 text-sm text-slate-600">{check.detail}</p></article>)}
      </section>
      <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border bg-white p-6"><h2 className="font-semibold">Support queue</h2><p className="mt-3 text-sm text-slate-600">Open tickets: <strong>{label(data.supportOpen)}</strong></p><p className="mt-2 text-sm text-slate-600">Failed notifications: <strong>{label(data.failedNotifications)}</strong></p><p className="mt-2 text-sm text-slate-600">Last mailbox sync: {data.lastMailboxSync ? new Date(data.lastMailboxSync).toLocaleString() : 'Unavailable'}</p><a href="/admin/support" className="mt-4 inline-block font-semibold text-[#0504AA]">Open support inbox →</a></div>
      <div className="rounded-2xl border bg-white p-6"><ShieldCheck className="size-5 text-[#C9A227]"/><h2 className="mt-3 font-semibold">Scheduled and financial monitoring</h2><p className="mt-2 text-sm leading-6 text-slate-600">Job history, schedules, security alerts and ledger monitoring are unavailable until their data sources and scheduler are configured and reviewed.</p></div></section>
    </>}
  </div></AdminLayout>
}
