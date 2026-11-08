import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { useActivationGate } from '@/hooks/useActivationGate'
import { accountService } from '@/services/accountService'
import { ACTIVATE_ACCOUNT_LABEL, ACTIVATION_REQUIRED_BODY, ACTIVATION_REQUIRED_TITLE } from '@/lib/bankingServices'
import { ROUTES } from '@/constants/routes'

/** Signed-in entry for a feature that has no banking backend. */
export const IntegrationEntryPage: React.FC<{ title: string; path: string; gated?: boolean }> = ({ title, path, gated = true }) => {
  const { user, loading: authLoading } = useAuth()
  const [ready, setReady] = useState(false)
  const { check } = useActivationGate(user?.id)
  const [gate, setGate] = useState<'loading' | 'error' | 'closed' | 'open'>('loading')

  useEffect(() => {
    if (!user) return
    let active = true
    accountService.getAccounts(user.id).then(async () => {
      if (!active) return
      setReady(true)
    }).catch(() => { if (active) setGate('error') })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user || !ready) return
    if (!gated) {
      setGate('open')
      return
    }
    let active = true
    check().then((result) => {
      if (!active) return
      setGate(result.activated ? 'open' : 'closed')
    }).catch(() => { if (active) setGate('error') })
    return () => { active = false }
  }, [user, ready, gated, check])

  if (authLoading || (user && gate === 'loading')) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-sm text-slate-600">Checking your account…</main>
  }
  if (!user) return <main className="p-8"><Link to={ROUTES.LOGIN}>Sign in</Link></main>

  return (
    <PortalShell title={title} eyebrow="Banking service">
      <div className="mx-auto max-w-xl">
        {gate === 'error' && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">We could not verify activation. This service stays closed.</p>}
        {gate === 'closed' && (
          <section className="rounded-2xl border border-[#C9A227] bg-white p-6" aria-labelledby="activation-required-title">
            <h2 id="activation-required-title" className="text-xl font-semibold text-[#0504AA]">{ACTIVATION_REQUIRED_TITLE}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{ACTIVATION_REQUIRED_BODY}</p>
            <Link to={`${ROUTES.ACTIVATION}?next=${encodeURIComponent(path)}`} className="mt-5 inline-flex rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white">{ACTIVATE_ACCOUNT_LABEL}</Link>
          </section>
        )}
        {gate === 'open' && (
          <section className="rounded-2xl border border-[#C9A227] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#0504AA]">Awaiting banking integration</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">This service is not connected to a bank, card network, or trading venue. Nothing can be submitted, and no balance or ledger entry is changed.</p>
          </section>
        )}
      </div>
    </PortalShell>
  )
}
