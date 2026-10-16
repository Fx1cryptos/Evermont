import { useState } from 'react'
import { supabase } from '@/lib/supabase' // adjust path to your client

export default function OpenCheckingAccount() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    ssn: '',
    email: '',
    password: '',
  })
  const [idFile, setIdFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError || !authData.user) {
      setMessage(authError?.message || 'Signup failed')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: form.fullName,
      phone_number: form.phone,
      date_of_birth: form.dob || null,
      address: form.address,
      city: form.city,
      state: form.state,
      zip_code: form.zip,
      ssn: form.ssn,
      account_type: 'checking',
    })

    if (profileError) {
      setMessage(profileError.message)
      setLoading(false)
      return
    }

    // 3. Upload documents (if provided)
    const uploads = [
      { file: idFile, type: 'government_id' },
      { file: addressFile, type: 'proof_of_address' },
    ]

    for (const item of uploads) {
      if (!item.file) continue
      const path = `${userId}/${item.type}-${Date.now()}-${item.file.name}`
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(path, item.file)

      if (!uploadError) {
        await supabase.from('verification_documents').insert({
          user_id: userId,
          document_type: item.type,
          file_path: path,
        })
      }
    }

    setMessage('Application submitted. Please check your email to confirm your account.')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-[#0504AA]">Open a Checking Account</h1>

      <input name="fullName" placeholder="Full legal name" required value={form.fullName} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="phone" placeholder="Phone number" required value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="dob" type="date" placeholder="Date of birth" required value={form.dob} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="address" placeholder="Street address" required value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />
      <div className="grid grid-cols-3 gap-2">
        <input name="city" placeholder="City" required value={form.city} onChange={handleChange} className="border p-2 rounded" />
        <input name="state" placeholder="State" required value={form.state} onChange={handleChange} className="border p-2 rounded" />
        <input name="zip" placeholder="ZIP" required value={form.zip} onChange={handleChange} className="border p-2 rounded" />
      </div>
      <input name="ssn" placeholder="SSN" required value={form.ssn} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} className="w-full border p-2 rounded" />

      <label className="block text-sm">Government ID</label>
      <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />

      <label className="block text-sm">Proof of address</label>
      <input type="file" accept="image/*,.pdf" onChange={(e) => setAddressFile(e.target.files?.[0] || null)} />

      <button type="submit" disabled={loading} className="w-full bg-[#0504AA] text-white py-2 rounded font-semibold">
        {loading ? 'Submitting…' : 'Submit Application'}
      </button>

      {message && <p className="text-sm text-center">{message}</p>}
    </form>
  )
}
