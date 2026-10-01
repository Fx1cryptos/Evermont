import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { validateEmail, validatePassword } from '@/utils/validation'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signInAsDemo, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = [...validateEmail(email), ...validatePassword(password)]
    if (errors.length) {
      const mapped: Record<string, string> = {}
      errors.forEach((err) => (mapped[err.field] = err.message))
      setFormErrors(mapped)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(ROUTES.DASHBOARD)
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoSignIn = () => {
    signInAsDemo()
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen bg-evermont-light flex flex-col items-center justify-center px-4">
      <Link to={ROUTES.HOME} className="mb-8">
        <Logo size="lg" />
      </Link>

      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-evermont-dark mb-2">Welcome back</h1>
        <p className="text-evermont-muted text-sm mb-6">Sign in to your account to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={formErrors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={submitting}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-evermont-muted">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-evermont-blue font-medium hover:underline">
            Register
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-evermont-muted hover:underline">
            Forgot password?
          </Link>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-evermont-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          Protected by 256-bit encryption. Never share your password.
        </p>

        <div className="mt-6 pt-6 border-t border-evermont-border">
          <p className="text-center text-xs text-evermont-muted mb-3">
            Just testing? Sign in as the demo member (simulated data only).
          </p>
          <Button variant="secondary" className="w-full" onClick={handleDemoSignIn}>
            Sign In as Demo Member
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
