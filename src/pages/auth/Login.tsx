import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { getRememberMe, setRememberMe } from '@/lib/authStorage'
import { AuthCard } from './AuthCard'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, error: authError } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => { setRemember(getRememberMe()) }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    try {
      setLoading(true)
      setRememberMe(remember)
      await signIn(username, password)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in is temporarily unavailable. Please try again later.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard eyebrow="Member sign in" title="Welcome back." subtitle="Sign in with the email on your account.">
      {(error || authError) && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error || authError}</div>}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input type="email" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} label="Email" autoComplete="email" required />
        <div className="relative">
          <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} label="Password" autoComplete="current-password" required />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 rounded-md text-slate-500 hover:text-[#0504AA]" disabled={loading}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} disabled={loading} className="size-4 accent-[#0504AA]" />
            Remember me
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-[#0504AA] hover:text-[#C9A227]">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl bg-[#0504AA] py-3.5 hover:bg-[#03037d]" loading={loading} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">New member? <Link to={ROUTES.REGISTER} className="font-semibold text-[#0504AA] hover:text-[#C9A227]">Create account</Link></p>
    </AuthCard>
  )
}
