import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { validateEmail, validatePassword, validatePasswordMatch, validateName } from '@/utils/validation'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUp, error } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = [
      ...validateName(firstName, 'First name'),
      ...validateName(lastName, 'Last name'),
      ...validateEmail(email),
      ...validatePassword(password),
      ...validatePasswordMatch(password, confirmPassword),
    ]
    if (errors.length) {
      const mapped: Record<string, string> = {}
      errors.forEach((err) => (mapped[err.field] = err.message))
      setFormErrors(mapped)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      await signUp(email, password, firstName, lastName)
      navigate(ROUTES.DASHBOARD)
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-evermont-light flex flex-col items-center justify-center px-4 py-8">
      <Link to={ROUTES.HOME} className="mb-8 text-center">
        <span className="text-3xl font-bold text-evermont-blue">Evermont</span>
        <span className="block text-evermont-gold text-sm font-medium">Credit Union</span>
      </Link>

      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-evermont-dark mb-2">Become a member</h1>
        <p className="text-evermont-muted text-sm mb-6">Create your Evermont Credit Union account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={formErrors.name}
              placeholder="Jane"
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={formErrors.name}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>
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
            placeholder="At least 8 characters"
            helpText="Must be at least 8 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={formErrors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={submitting}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-evermont-muted">
          Already a member?{' '}
          <Link to={ROUTES.LOGIN} className="text-evermont-blue font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default RegisterPage
