import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { emailIssue, strongPasswordIssue, validateName, validatePhone } from '@/utils/validation'
import { AuthCard } from './AuthCard'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', consent: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = (field: 'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirmPassword') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()

    const nameError = validateName(firstName, 'First name')[0]?.message || validateName(lastName, 'Last name')[0]?.message
    const mailError = emailIssue(email)
    const phoneError = phone ? validatePhone(phone)[0]?.message : null
    const passwordError = strongPasswordIssue(form.password)
    if (nameError || mailError || phoneError || passwordError) {
      setError(nameError || mailError || phoneError || passwordError)
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.consent) {
      setError('Please agree to the Terms of Use and Privacy Policy.')
      return
    }

    try {
      setLoading(true)
      const result = await signUp(email, form.password, firstName, lastName, phone || undefined)
      if (result.session) {
        navigate(ROUTES.DASHBOARD, { replace: true })
        return
      }
      setMessage('Account created. Check your email to verify your address, then sign in. No accounts or balances are opened from this form.')
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'We could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard eyebrow="Membership" title="Create your account" subtitle="Use your legal name and the email where we can reach you.">
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && (
        <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p>{message}</p>
          <Link to={ROUTES.LOGIN} className="mt-2 inline-block font-semibold text-[#0504AA] hover:text-[#C9A227]">Back to sign in</Link>
        </div>
      )}
      {!message && (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={form.firstName} onChange={update('firstName')} disabled={loading} autoComplete="given-name" required />
            <Input label="Last name" value={form.lastName} onChange={update('lastName')} disabled={loading} autoComplete="family-name" required />
          </div>
          <Input type="email" label="Email" value={form.email} onChange={update('email')} disabled={loading} autoComplete="email" required />
          <Input type="tel" label="Phone" helpText="Optional. Saved on your member profile." value={form.phone} onChange={update('phone')} disabled={loading} autoComplete="tel" />
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} label="Password" helpText="At least 8 characters, with uppercase, lowercase, and a number." value={form.password} onChange={update('password')} disabled={loading} autoComplete="new-password" required />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-9 text-slate-500 hover:text-[#0504AA]" disabled={loading}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <Input type={showPassword ? 'text' : 'password'} label="Confirm password" value={form.confirmPassword} onChange={update('confirmPassword')} disabled={loading} autoComplete="new-password" required />
          <label className="flex items-start gap-2 text-sm leading-5 text-slate-600">
            <input type="checkbox" checked={form.consent} onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))} disabled={loading} className="mt-1 size-4 accent-[#0504AA]" required />
            <span>I agree to the <Link to="/terms" className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Terms of Use</Link> and <Link to="/privacy" className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Privacy Policy</Link>.</span>
          </label>
          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl bg-[#0504AA] py-3.5 hover:bg-[#03037d]" loading={loading} disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
        </form>
      )}
      {!message && <p className="mt-6 text-center text-sm text-slate-500">Already a member? <Link to={ROUTES.LOGIN} className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Sign in</Link></p>}
    </AuthCard>
  )
}
