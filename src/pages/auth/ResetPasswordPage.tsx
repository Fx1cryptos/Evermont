import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { authLinkMessage, clearPasswordRecovery, hasPasswordRecovery, useAuthLink } from '@/lib/authCallback'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { strongPasswordIssue } from '@/utils/validation'
import { AuthCard } from './AuthCard'

type Status = 'working' | 'ready' | 'missing' | 'error' | 'done'

/** Landing page for the password-recovery redirect from resetPasswordForEmail. */
export const ResetPasswordPage: React.FC = () => {
  const authLink = useAuthLink()
  const [status, setStatus] = useState<Status>('working')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fromRecoveryLink = authLink.type === 'recovery' || authLink.hasCode || authLink.hasAccessToken || authLink.hasError || hasPasswordRecovery()
    if (!fromRecoveryLink) {
      setStatus('missing')
      return
    }
    if (authLink.hasError && !authLink.hasCode && !authLink.hasAccessToken && !hasPasswordRecovery()) {
      setError(authLinkMessage(authLink))
      setStatus('error')
      return
    }

    let active = true
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' && session) setStatus('ready')
    })
    void supabase.auth.initialize().then(async (result) => {
      if (!active) return
      if (result.error && !hasPasswordRecovery()) {
        setError(authLinkMessage(authLink))
        setStatus('error')
        return
      }
      const { data: sessionData } = await supabase.auth.getSession()
      if (!active) return
      if (!sessionData.session) {
        setError(authLinkMessage(authLink))
        setStatus('error')
        return
      }
      setStatus('ready')
    }).catch(() => {
      if (!active) return
      setError('Connection failed. Check your internet connection and open the link again.')
      setStatus('error')
    })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [authLink])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const passwordError = strongPasswordIssue(password)
    if (passwordError) { setError(passwordError); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    try {
      setLoading(true)
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        const code = updateError.code || ''
        if (code === 'over_request_rate_limit') throw new Error('Too many attempts. Please wait a moment and try again.')
        if (updateError.status === 0 || updateError.name === 'AuthRetryableFetchError') throw new Error('Connection failed. Check your internet connection and try again.')
        if ((updateError.status || 0) >= 500) throw new Error('Password update is temporarily unavailable. Please try again later.')
        if ((updateError.message || '').toLowerCase().includes('password')) throw new Error('Please choose a stronger password and try again.')
        throw new Error('We could not update your password. Request a new reset link and try again.')
      }
      clearPasswordRecovery()
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not update your password.')
    } finally { setLoading(false) }
  }

  return (
    <AuthCard eyebrow="Account recovery" title="Choose a new password" subtitle="Use at least 8 characters, with an uppercase letter, a lowercase letter, and a number.">
      {status === 'working' && <p className="text-sm text-slate-600">Checking your reset link…</p>}
      {status === 'done' && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p>Your password has been updated.</p>
          <Link to={ROUTES.DASHBOARD} className="mt-3 inline-block font-semibold text-[#0504AA] hover:text-[#C9A227]">Continue to your account</Link>
        </div>
      )}
      {status === 'missing' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Open this page from the reset link in your email. Links expire. <Link to={ROUTES.FORGOT_PASSWORD} className="font-semibold underline">Request a new one</Link> if needed.
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <Link to={ROUTES.FORGOT_PASSWORD} className="mt-3 inline-block font-semibold text-[#0504AA]">Request a new link</Link>
        </div>
      )}
      {status === 'ready' && (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} label="New password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required autoComplete="new-password" />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-9 text-slate-500 hover:text-[#0504AA]" disabled={loading}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <Input type={showPassword ? 'text' : 'password'} label="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} required autoComplete="new-password" />
          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl bg-[#0504AA] py-3.5 hover:bg-[#03037d]" loading={loading} disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
        </form>
      )}
      {status !== 'done' && <p className="mt-6 text-center text-sm text-slate-500"><Link to={ROUTES.LOGIN} className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Back to sign in</Link></p>}
    </AuthCard>
  )
}
export default ResetPasswordPage
