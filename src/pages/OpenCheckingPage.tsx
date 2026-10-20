import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageMeta } from '@/components/PageMeta'

const initialForm = { fullName: '', phone: '', dateOfBirth: '', address: '', city: '', state: '', zipCode: '', ssn: '', email: '', password: '' }

export const OpenCheckingPage: React.FC = () => {
  const [form, setForm] = useState(initialForm)
  const [governmentId, setGovernmentId] = useState<File | null>(null)
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const update = (field: keyof typeof initialForm) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setStatus(null); setError(null)
    if (!governmentId || !proofOfAddress) { setError('Please provide both requested verification documents.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email: form.email.trim().toLowerCase(), password: form.password, options: { data: { full_name: form.fullName.trim() } } })
      if (authError || !data.user) throw new Error('We could not create your application. Please check your details and try again.')
      const userId = data.user.id
      const { error: profileError } = await supabase.from('profiles').upsert({ id: userId, email: form.email.trim().toLowerCase(), full_name: form.fullName.trim(), phone_number: form.phone.trim(), date_of_birth: form.dateOfBirth || null, address: form.address.trim(), city: form.city.trim(), state: form.state.trim(), zip_code: form.zipCode.trim(), ssn: form.ssn.trim(), account_type: 'checking', verification_status: 'pending' }, { onConflict: 'id' })
      if (profileError) throw new Error('Your account was created, but we could not save the application details.')
      for (const [file, type] of [[governmentId, 'government-id'], [proofOfAddress, 'proof-of-address']] as const) {
        const path = `${userId}/${type}-${crypto.randomUUID()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('verification-documents').upload(path, file, { upsert: false })
        if (uploadError) throw new Error('Your details were saved, but a verification document could not be uploaded.')
        const { error: documentError } = await supabase.from('verification_documents').insert({ user_id: userId, document_type: type, file_path: path, status: 'pending' })
        if (documentError) throw new Error('Your details were saved, but document verification could not be completed.')
      }
      setStatus(data.session ? 'Your checking account application was submitted.' : 'Your application was submitted. Check your email to confirm your account before signing in.')
      setForm(initialForm); setGovernmentId(null); setProofOfAddress(null)
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your application.') } finally { setLoading(false) }
  }

  return <>
    <PageMeta
      title="Open a Checking Account | Evermont Credit Union"
      description="Apply for an Evermont checking account through a secure application designed to collect the information needed for account review."
    />
    <div className="min-h-screen bg-[#f8fafc] text-[#101533]"><header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Public site header"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8"><Link to="/" className="shrink-0 text-lg font-bold tracking-[-0.04em] text-[#0504AA]" aria-label="Evermont home">EVERMONT</Link><nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex" aria-label="Primary navigation"><Link to="/banking/private-checking" className="hover:text-[#0504AA]">Checking</Link><Link to="/banking/private-savings" className="hover:text-[#0504AA]">Savings</Link><Link to="/banking/credit-card" className="hover:text-[#0504AA]">Credit Card</Link><Link to="/banking/retirement-401k" className="hover:text-[#0504AA]">Retirement</Link><Link to="/loans/personal" className="hover:text-[#0504AA]">Loans</Link><Link to="/about" className="hover:text-[#0504AA]">About</Link></nav><details className="relative lg:hidden"><summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0504AA]">Menu</summary><nav className="absolute right-0 top-12 z-10 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl" aria-label="Mobile navigation"><Link to="/banking/private-checking" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50">Checking</Link><Link to="/banking/private-savings" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50">Savings</Link><Link to="/banking/credit-card" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50">Credit Card</Link><Link to="/banking/retirement-401k" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50">Retirement</Link><Link to="/loans/personal" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50">Loans</Link><Link to="/about" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50">About</Link></nav></details><a href="https://v0-evermont.vercel.app/login" className="shrink-0 text-sm font-semibold text-[#0504AA]">Sign In</a></div></header><main className="mx-auto max-w-4xl px-5 py-12 lg:py-20"><div className="mb-10 max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Open a checking account</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Start your Evermont application.</h1><p className="mt-5 leading-7 text-slate-600">Complete the secure form below. We&apos;ll review your information and contact you about next steps.</p></div>{error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{status && <div role="status" className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{status}</div>}<form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><fieldset className="grid gap-5 sm:grid-cols-2"><legend className="mb-4 text-xl font-semibold sm:col-span-2">Your information</legend>{[['fullName','Full legal name'],['phone','Phone number'],['dateOfBirth','Date of birth'],['address','Street address'],['city','City'],['state','State'],['zipCode','ZIP code'],['ssn','Social Security number']].map(([field,label]) => <label key={field} className="text-sm font-semibold text-slate-700">{label}<input required type={field === 'dateOfBirth' ? 'date' : 'text'} value={form[field as keyof typeof form]} onChange={update(field as keyof typeof form)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#0504AA]" /></label>)}</fieldset><fieldset className="grid gap-5 sm:grid-cols-2"><legend className="mb-4 text-xl font-semibold sm:col-span-2">Secure access</legend><label className="text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} onChange={update('email')} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#0504AA]" /></label><label className="text-sm font-semibold text-slate-700">Password<input required minLength={8} type="password" value={form.password} onChange={update('password')} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#0504AA]" /></label></fieldset><fieldset className="grid gap-5 sm:grid-cols-2"><legend className="mb-4 text-xl font-semibold sm:col-span-2">Verification documents</legend><label className="text-sm font-semibold text-slate-700">Government ID<input required type="file" accept="image/*,.pdf" onChange={(event) => setGovernmentId(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-lg border border-slate-300 p-2 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Proof of address<input required type="file" accept="image/*,.pdf" onChange={(event) => setProofOfAddress(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-lg border border-slate-300 p-2 font-normal" /></label></fieldset><button disabled={loading} className="w-full rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0807c8] disabled:opacity-60">{loading ? 'Submitting application...' : 'Submit application'}</button><p className="text-xs leading-5 text-slate-500">Your documents are uploaded to the private verification-documents storage area and are not publicly listed.</p></form></main><footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500"><a href="https://youtube.com/@evermontcreditunion?si=gYPXAQ9YUDMAiKL4" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0504AA]">Evermont on YouTube</a></footer></div>
    </>
}

export default OpenCheckingPage
