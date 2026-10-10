import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    try {
      setLoading(true)
      await signIn(email, password)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8 text-[#101533] sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-[#0504AA]/10 sm:p-9">
          <div className="mb-8 text-center">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg" alt="Evermont Credit Union" className="mx-auto h-24 w-24 rounded-2xl object-cover shadow-lg ring-4 ring-[#0504AA]/10" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#C9A227]">Evermont Private Wealth</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0504AA]">Member sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Secure access to your Evermont member portal</p>
          </div>

          {/* Form Title */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Sign In</h2>

          {/* Errors */}
          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              label="Email"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                label="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <a
            href="https://evermont.builder.cloud"
            className="mt-4 block w-full rounded-md border border-[#0504AA] px-4 py-3 text-center text-sm font-semibold text-[#0504AA] transition-colors hover:bg-[#0504AA] hover:text-white"
          >
            Visit the Homepage
          </a>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="block text-evermont-blue hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-evermont-blue hover:underline font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
