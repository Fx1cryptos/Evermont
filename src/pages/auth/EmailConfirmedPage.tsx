import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { authLinkMessage, markPasswordRecovery, useAuthLink } from '@/lib/authCallback'
import { ROUTES } from '@/constants/routes'
import { AuthCard } from './AuthCard'

type Status = 'working' | 'confirmed' | 'error' | 'idle'

/** Landing page for the signup confirmation redirect. */
export const EmailConfirmedPage: React.FC = () => {
  const navigate = useNavigate()
  const authLink = useAuthLink()
  const [status, setStatus] = useState<Status>('working')
  const [detail, setDetail] = useState<string | null>(null)

  useEffect(() => {
    if (authLink.hasError && !authLink.hasCode && !authLink.hasAccessToken) {
      setStatus('error')
      setDetail(authLinkMessage(authLink))
      return
    }
    const awaitingSession = authLink.hasCode || authLink.hasAccessToken || Boolean(authLink.type)
    if (!awaitingSession) {
      setStatus('idle')
      return
    }

    let active = true
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !session) return
      if (event === 'PASSWORD_RECOVERY' || authLink.type === 'recovery') {
        markPasswordRecovery()
        navigate(ROUTES.RESET_PASSWORD, { replace: true })
      }
    })
    void supabase.auth.initialize().then(async (result) => {
      if (!active) return
      if (result.error || authLink.type === 'recovery') {
        if (authLink.type === 'recovery') {
          markPasswordRecovery()
          navigate(ROUTES.RESET_PASSWORD, { replace: true })
          return
        }
        setStatus('error')
        setDetail(authLinkMessage(authLink))
        return
      }
      const { data: sessionData } = await supabase.auth.getSession()
      if (!active) return
      if (!sessionData.session) {
        setStatus('error')
        setDetail(authLinkMessage(authLink))
        return
      }
      setStatus('confirmed')
    }).catch(() => {
      if (!active) return
      setStatus('error')
      setDetail('Connection failed. Check your internet connection and open the link again.')
    })

    return () => { active = false; data.subscription.unsubscribe() }
  }, [authLink, navigate])

  return (
    <AuthCard eyebrow="Email verification" title={status === 'confirmed' ? 'Email confirmed' : 'Confirm your email'} subtitle="This page opens from the verification link we email you.">
      {status === 'working' && <p className="text-sm text-slate-600">Confirming your email…</p>}
      {status === 'confirmed' && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p>Your email is confirmed. You can continue to your member account.</p>
          <Link to={ROUTES.DASHBOARD} className="mt-3 inline-block font-semibold text-[#0504AA] hover:text-[#C9A227]">Continue</Link>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{detail}</p>
          <Link to={ROUTES.REGISTER} className="mt-3 inline-block font-semibold text-[#0504AA]">Back to create account</Link>
        </div>
      )}
      {status === 'idle' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>Open the verification link in your email to confirm your address.</p>
          <Link to={ROUTES.LOGIN} className="mt-3 inline-block font-semibold text-[#0504AA]">Back to sign in</Link>
        </div>
      )}
    </AuthCard>
  )
}

export default EmailConfirmedPage
