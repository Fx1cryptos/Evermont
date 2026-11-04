import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { emailIssue } from '@/utils/validation'
import { AuthCard } from './AuthCard'

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const mailError = emailIssue(email)
    if (mailError) { setError(mailError); return }
    try {
      setLoading(true)
      await resetPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset email. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <AuthCard eyebrow="Account recovery" title="Reset your password" subtitle="Enter the email on your Evermont Credit Union account. We will send a reset link to that address.">
      {sent ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Input type="email" label="Email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required autoComplete="email" />
          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl bg-[#0504AA] py-3.5 hover:bg-[#03037d]" loading={loading} disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500"><Link to={ROUTES.LOGIN} className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Back to sign in</Link></p>
    </AuthCard>
  )
}
export default ForgotPasswordPage
