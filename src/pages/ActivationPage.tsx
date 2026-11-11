import React, { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, Clock3, MessageCircle, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { useActivationGate } from '@/hooks/useActivationGate'
import { activationService, type ActivationPaymentLog, type ActivationPaymentStatus } from '@/services/activationService'
import { ROUTES } from '@/constants/routes'
import { bankingServiceForPath } from '@/lib/bankingServices'

const money = (value: number | null | undefined, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0)
const statusStyles: Record<ActivationPaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700', processing: 'bg-blue-50 text-blue-700', succeeded: 'bg-emerald-50 text-emerald-700', failed: 'bg-red-50 text-red-700', refunded: 'bg-slate-100 text-slate-700',
}
const statusLabel = (status: ActivationPaymentStatus) => status.charAt(0).toUpperCase() + status.slice(1)

export const ActivationPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextService = bankingServiceForPath(searchParams.get('next') || '')
  const [payments, setPayments] = useState<ActivationPaymentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activation, setActivation] = useState({ activated: false })
  const { check } = useActivationGate(user?.id)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      setLoading(true)
      const [paymentResult, status] = await Promise.all([activationService.listPaymentHistory(user.id), check()])
      if (!active) return
      setPayments(paymentResult.data)
      setActivation(status)
      if (paymentResult.error) setError('We could not load your payment history.')
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [user, check])

  return <PortalShell title="Activation &amp; upgrade" eyebrow="Account security">
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-[#C8A43D]/50 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#C8A43D]">Current status</p><h2 className="mt-2 text-2xl font-semibold text-[#080A9F]">{activation.activated ? 'Activated' : 'Activation required'}</h2></div><div className="rounded-2xl bg-[#080A9F]/10 p-3 text-[#080A9F]">{activation.activated ? <CheckCircle className="size-6" /> : <ShieldCheck className="size-6" />}</div></div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{activation.activated ? 'Your member account is activated. Payment history remains available below.' : 'Contact Evermont Private Bank & Trust Support to confirm the secure activation process for your account.'}</p>{nextService && <p className="mt-4 text-sm text-slate-600">{activation.activated ? <Link to={nextService.path} className="font-semibold text-[#080A9F]">Continue to {nextService.title}</Link> : `After activation you can return to ${nextService.title}.`}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => navigate(ROUTES.SUPPORT)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#080A9F] px-5 py-3 text-sm font-semibold text-white shadow-sm"><MessageCircle className="size-4" />Contact Support about Activation</button><Link to={ROUTES.ACCOUNTS} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"><ArrowLeft className="size-4" />Back to Accounts</Link></div>
      </section>
      <aside className="rounded-2xl bg-[#080A9F] p-6 text-white shadow-sm"><ShieldCheck className="size-6 text-[#C8A43D]" /><h2 className="mt-5 text-lg font-semibold">Account security</h2><p className="mt-2 text-sm leading-6 text-blue-100">For your protection, activation status is verified from your authenticated member record. Contact Support if you have questions about account access.</p></aside>
    </div>
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5 sm:px-8"><h2 className="text-xl font-semibold text-[#080A9F]">Payment history</h2><p className="mt-1 text-sm text-slate-500">Activation payment attempts associated with your account.</p></div>{loading ? <p className="p-6 text-sm text-slate-500">Loading payment history...</p> : error ? <p role="alert" className="p-6 text-sm text-red-700">{error}</p> : payments.length === 0 ? <div className="p-10 text-center"><Clock3 className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No payment records yet</p><p className="mt-1 text-sm text-slate-500">Your activation payment attempts will appear here.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Amount</th><th className="px-6 py-4 font-semibold">Method</th><th className="px-6 py-4 font-semibold">Reference</th><th className="px-6 py-4 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map(payment => <tr key={payment.id}><td className="px-6 py-4 whitespace-nowrap text-slate-600">{new Date(payment.created_at).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap font-semibold text-[#172033]">{money(payment.amount, payment.currency)}</td><td className="px-6 py-4 text-slate-600">{payment.payment_method || '—'}</td><td className="px-6 py-4 font-mono text-xs text-slate-500">{payment.payment_reference || '—'}</td><td className="px-6 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[payment.status] || statusStyles.pending}`}>{statusLabel(payment.status)}</span></td></tr>)}</tbody></table></div>}</section>
  </PortalShell>
}
export default ActivationPage
