import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { AuthCard } from './AuthCard'

/** Landing page for the Supabase recovery link. supabase-js (detectSessionInUrl) creates the recovery session. */
export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    try {
      setLoading(true)
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      setTimeout(() => navigate(ROUTES.DASHBOARD, { replace: true }), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password.')
    } finally { setLoading(false) }
  }

  return (
    <AuthCard eyebrow="Account recovery" title="Choose a new password" subtitle="Use at least 8 characters. Avoid passwords you use elsewhere.">
      {done ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Your password has been updated. Redirecting to your dashboard…</div>
      ) : !ready ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Open this page from the reset link in your email. Links expire — <Link to={ROUTES.FORGOT_PASSWORD} className="font-semibold underline">request a new one</Link> if needed.</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Input type="password" label="New password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required autoComplete="new-password" />
          <Input type="password" label="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} required autoComplete="new-password" />
          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl bg-[#0504AA] py-3.5 hover:bg-[#03037d]" loading={loading} disabled={loading}>{loading ? 'Updating…' : 'Update password'}</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500"><Link to={ROUTES.LOGIN} className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Back to sign in</Link></p>
    </AuthCard>
  )
}
export default ResetPasswordPage
