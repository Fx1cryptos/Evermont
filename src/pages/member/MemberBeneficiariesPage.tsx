import { useEffect, useState } from 'react'
import { PortalShell } from '@/components/member/PortalShell'
import { useAuth } from '@/contexts/AuthContext'
import { readBeneficiaries, type MemberBeneficiary } from '@/services/beneficiaryService'


export function BeneficiariesPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<MemberBeneficiary[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  useEffect(() => {
    if (!user) return
    let active = true
    const read = async () => {
      const data = await readBeneficiaries(user.id)
      if (active) { setRows(data); setState('ready') }
    }
    void read().catch(() => { if (active) setState('unavailable') })
    return () => { active = false }
  }, [user])
  return <PortalShell title="Beneficiaries" eyebrow="Account planning">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-[#07142D]">Your beneficiaries</h2>
      {state === 'ready' && rows.length ? <ul className="mt-4 divide-y">{rows.map(row => <li key={row.id} className="py-3">{row.name}</li>)}</ul>
        : <p role="status" className="mt-3 text-sm text-slate-600">{state === 'loading' ? 'Loading beneficiaries…' : state === 'unavailable' ? 'Beneficiary records are currently unavailable.' : 'No beneficiaries are on file.'}</p>}
    </section>
  </PortalShell>
}
