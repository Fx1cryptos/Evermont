import React, { useState } from 'react'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { PortalShell, SupportCard } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { strongPasswordIssue } from '@/utils/validation'

export const SettingsPage: React.FC = () => {
  const { updatePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setIsError(false)
    if (!currentPassword) {
      setMessage('Enter your current password to verify your identity.')
      setIsError(true)
      return
    }
    const passwordError = strongPasswordIssue(next)
    if (passwordError) {
      setMessage(passwordError)
      setIsError(true)
      return
    }
    if (next !== confirm) {
      setMessage('New passwords do not match.')
      setIsError(true)
      return
    }

    setSaving(true)
    try {
      await updatePassword(currentPassword, next)
      setMessage('Password updated successfully.')
      setCurrentPassword('')
      setNext('')
      setConfirm('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not update your password. Verify your current password and try again.')
      setIsError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PortalShell title="Settings" eyebrow="Preferences and security">
      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-[#080A9F]"><LockKeyhole className="size-5" aria-hidden="true" /></div>
              <div>
                <h2 className="font-semibold">Change password</h2>
                <p className="text-sm text-slate-500">Verify your identity before choosing a new password.</p>
              </div>
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:max-w-lg">
              <label htmlFor="current-password" className="text-sm font-semibold">Current password
                <input id="current-password" required autoComplete="current-password" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#080A9F]" />
              </label>
              <label htmlFor="new-password" className="text-sm font-semibold">New password
                <input id="new-password" required autoComplete="new-password" type="password" value={next} onChange={event => setNext(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#080A9F]" />
              </label>
              <label htmlFor="confirm-password" className="text-sm font-semibold">Confirm new password
                <input id="confirm-password" required autoComplete="new-password" type="password" value={confirm} onChange={event => setConfirm(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#080A9F]" />
              </label>
              {message && <p role={isError ? 'alert' : 'status'} className={`rounded-xl p-3 text-sm ${isError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>}
              <button type="submit" disabled={saving} className="w-fit rounded-xl bg-[#080A9F] px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Verifying...' : 'Update password'}</button>
            </form>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-[#080A9F]" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Account security</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">Your session and member records are managed through the existing Supabase Auth integration.</p>
              </div>
            </div>
          </section>
        </div>
        <SupportCard />
      </div>
    </PortalShell>
  )
}
