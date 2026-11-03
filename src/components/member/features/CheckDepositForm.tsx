import React, { useEffect, useState } from 'react'
import { Camera, CheckCircle2 } from 'lucide-react'
import { fieldClass, labelClass, primaryBtn, PrototypeNote, prototypeRef } from './FeatureDialog'

type Side = 'front' | 'back'

const ImagePicker: React.FC<{ side: Side; file: File | null; onChange: (file: File | null) => void; error?: string }> = ({ side, file, onChange, error }) => {
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const id = `check-${side}`
  return (
    <div>
      <label htmlFor={id} className={`${labelClass} cursor-pointer`}>
        {side === 'front' ? 'Front of check' : 'Back of check (endorsed)'}
        <span className={`mt-1 flex h-28 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed ${error ? 'border-red-400' : 'border-slate-300'} bg-slate-50 text-slate-500 hover:border-[#0504AA]`}>
          {preview ? <img src={preview} alt={`${side} of check preview`} className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-xs normal-case tracking-normal"><Camera className="size-5" />Upload or capture</span>}
        </span>
      </label>
      <input id={id} type="file" accept="image/*" capture="environment" className="sr-only" onChange={event => onChange(event.target.files?.[0] || null)} />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}

/** Shared by Mobile Deposit and Check Deposit. Images stay in the browser; nothing is uploaded or credited. */
export const CheckDepositForm: React.FC<{ mode: 'mobile' | 'check'; onDone: () => void }> = ({ mode, onDone }) => {
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<{ front?: string; back?: string; amount?: string }>({})
  const [done, setDone] = useState<{ ref: string; amount: number } | null>(null)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (!front) next.front = 'Add the front image.'
    if (!back) next.back = 'Add the back image.'
    const value = Number(amount)
    if (!(value > 0)) next.amount = 'Enter the check amount.'
    setErrors(next)
    if (Object.keys(next).length) return
    setDone({ ref: prototypeRef(mode === 'mobile' ? 'MDEP' : 'CHK'), amount: value })
  }

  if (done) return (
    <div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-10 text-[#C9A227]" />
      <h3 className="text-base font-semibold text-[#101533]">Deposit pending review (simulated)</h3>
      <p className="text-sm text-slate-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(done.amount)} · reference {done.ref}</p>
      <PrototypeNote>This is a prototype. The check images were not uploaded, nothing was credited, and your balance is unchanged.</PrototypeNote>
      <button type="button" onClick={onDone} className={primaryBtn}>Done</button>
    </div>
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ImagePicker side="front" file={front} onChange={setFront} error={errors.front} />
        <ImagePicker side="back" file={back} onChange={setBack} error={errors.back} />
      </div>
      <div>
        <label htmlFor="check-amount" className={labelClass}>Check amount (USD)</label>
        <input id="check-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} aria-invalid={!!errors.amount} className={fieldClass} />
        {errors.amount && <p className="mt-1 text-xs text-red-700">{errors.amount}</p>}
      </div>
      <PrototypeNote>Prototype: images stay on this device and the deposit is simulated. No balance is credited.</PrototypeNote>
      <button type="submit" className={primaryBtn}>Submit deposit</button>
    </form>
  )
}
