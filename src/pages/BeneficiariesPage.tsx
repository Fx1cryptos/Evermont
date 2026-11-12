import React, { useEffect, useState } from 'react'
import { LockKeyhole, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'

type Beneficiary = { id: string; name: string; relationship: string; allocation: string }
type BeneficiaryDraft = Omit<Beneficiary, 'id'>

const STORAGE_KEY = 'evermont-beneficiaries'

export const BeneficiariesPage: React.FC = () => {
  const { user } = useAuth()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [draft, setDraft] = useState<BeneficiaryDraft>({ name: '', relationship: '', allocation: '' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user || typeof window === 'undefined') return
    try {
      const saved = JSON.parse(window.localStorage.getItem(`${STORAGE_KEY}:${user.id}`) || '[]')
      if (Array.isArray(saved)) setBeneficiaries(saved)
    } catch {
      setBeneficiaries([])
    }
  }, [user])

  const update = (key: keyof BeneficiaryDraft, value: string) => setDraft(current => ({ ...current, [key]: value }))
  const persist = (next: Beneficiary[]) => {
    setBeneficiaries(next)
    if (user && typeof window !== 'undefined') window.localStorage.setItem(`${STORAGE_KEY}:${user.id}`, JSON.stringify(next))
  }

  const saveBeneficiary = (event: React.FormEvent) => {
    event.preventDefault()
    const name = draft.name.trim()
    const allocation = Number(draft.allocation)
    if (!name || !draft.relationship || !Number.isFinite(allocation) || allocation <= 0 || allocation > 100) {
      setNotice('Enter a name, relationship, and an allocation between 1 and 100%.')
      return
    }
    persist([...beneficiaries, { id: crypto.randomUUID(), name, relationship: draft.relationship, allocation: String(allocation) }])
    setDraft({ name: '', relationship: '', allocation: '' })
    setNotice('Beneficiary saved on this device.')
  }

  const removeBeneficiary = (id: string) => {
    persist(beneficiaries.filter(beneficiary => beneficiary.id !== id))
    setNotice('Beneficiary removed from this device.')
  }

  return <PortalShell title="Beneficiaries" eyebrow="Account planning">
    <div className="mx-auto mt-7 max-w-5xl space-y-5">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" role="status"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><p className="font-semibold text-amber-950">Stored on this device for now</p><p className="mt-1 text-sm leading-6 text-amber-900/80">Your beneficiary list is saved only in this browser until the secure member database is connected. It does not change accounts or submit financial instructions.</p></div></div></section>
      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#C8A43D]">Add beneficiary</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[#172033]">Plan who receives your account</h2><p className="mt-2 text-sm leading-6 text-slate-500">Add a name, relationship, and intended allocation.</p></div><div className="hidden rounded-xl bg-[#080A9F]/10 p-3 text-[#080A9F] sm:block"><Plus className="size-5" aria-hidden="true" /></div></div><form className="mt-7 grid gap-4" onSubmit={saveBeneficiary}><label className="grid gap-2 text-sm font-semibold text-slate-700">Full name<input required value={draft.name} onChange={event => update('name', event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none transition focus:border-[#080A9F] focus:ring-4 focus:ring-[#080A9F]/10" placeholder="Beneficiary full name" /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Relationship<select required value={draft.relationship} onChange={event => update('relationship', event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none transition focus:border-[#080A9F] focus:ring-4 focus:ring-[#080A9F]/10"><option value="">Select relationship</option><option>Spouse or partner</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Other</option></select></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Allocation percentage<input required value={draft.allocation} onChange={event => update('allocation', event.target.value)} inputMode="decimal" className="rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none transition focus:border-[#080A9F] focus:ring-4 focus:ring-[#080A9F]/10" placeholder="e.g. 50" /></label><button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#080A9F] px-4 py-3 text-sm font-semibold text-white hover:bg-[#04038c]">Save beneficiary</button>{notice && <p className="text-sm font-medium text-emerald-700" role="status">{notice}</p>}</form></div>
        <aside className="rounded-2xl bg-[#080A9F] p-6 text-white"><ShieldCheck className="size-6 text-[#C8A43D]" aria-hidden="true" /><h2 className="mt-5 text-lg font-semibold">Secure by design</h2><p className="mt-2 text-sm leading-6 text-blue-100">When connected, beneficiary records will be scoped to your authenticated member ID and protected by database policies.</p><div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm text-blue-100"><p className="flex items-center gap-2"><UserRound className="size-4 text-[#C8A43D]" aria-hidden="true" />Authenticated member only</p><p className="flex items-center gap-2"><Trash2 className="size-4 text-[#C8A43D]" aria-hidden="true" />Remove anytime</p></div></aside>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="saved-beneficiaries-title"><div className="border-b border-slate-100 px-5 py-4"><h2 id="saved-beneficiaries-title" className="text-sm font-semibold text-[#172033]">Saved beneficiaries</h2><p className="mt-1 text-sm text-slate-500">{beneficiaries.length ? `${beneficiaries.length} saved on this device` : 'Your saved list will appear here.'}</p></div>{beneficiaries.length ? <ul className="divide-y divide-slate-100">{beneficiaries.map(beneficiary => <li key={beneficiary.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-semibold text-[#172033]">{beneficiary.name}</p><p className="mt-1 text-sm text-slate-500">{beneficiary.relationship} · {beneficiary.allocation}% allocation</p></div><button type="button" onClick={() => removeBeneficiary(beneficiary.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${beneficiary.name}`}><Trash2 className="size-4" aria-hidden="true" /></button></li>)}</ul> : <div className="px-5 py-10 text-center"><UserRound className="mx-auto size-6 text-[#C8A43D]" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-[#080A9F]">No beneficiaries saved</p><p className="mt-1 text-sm text-slate-500">Add one above to keep a device-only reminder.</p></div>}</section>
    </div>
  </PortalShell>
}
