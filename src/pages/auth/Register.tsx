import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim().toLowerCase()

    if (!firstName || !lastName || !email || !form.password || !form.confirmPassword) {
      setError('Please complete all required fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      const result = await signUp(email, form.password, firstName, lastName)
      if (result.session) {
        navigate(ROUTES.DASHBOARD, { replace: true })
      } else {
        setMessage('Account created. Check your email to confirm your membership, then sign in.')
      }
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'We could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-evermont-border bg-white p-8 shadow-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-evermont-blue text-2xl font-bold text-white">E</div>
          <h1 className="text-2xl font-bold text-evermont-blue">EVERMONT</h1>
          <p className="mt-1 text-sm text-gray-600">Credit Union</p>
        </div>
        <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">Create your member account</h2>
        {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={form.firstName} onChange={update('firstName')} disabled={loading} required />
            <Input label="Last name" value={form.lastName} onChange={update('lastName')} disabled={loading} required />
          </div>
          <Input type="email" label="Email address" value={form.email} onChange={update('email')} disabled={loading} required />
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} label="Password" value={form.password} onChange={update('password')} disabled={loading} minLength={8} required />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-10 text-gray-600 hover:text-gray-900">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Input type="password" label="Confirm password" value={form.confirmPassword} onChange={update('confirmPassword')} disabled={loading} required />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
        </form>
        <a
          href="https://evermont.builder.cloud"
          className="mt-4 block w-full rounded-md border border-[#0504AA] px-4 py-3 text-center text-sm font-semibold text-[#0504AA] transition-colors hover:bg-[#0504AA] hover:text-white"
        >
          Visit the public site
        </a>
        <p className="mt-6 text-center text-sm text-gray-600">Already a member? <Link to={ROUTES.LOGIN} className="font-medium text-evermont-blue hover:underline">Sign in</Link></p>
      </div>
    </main>
  )
}
