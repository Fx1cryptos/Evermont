import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { fieldClass, labelClass, primaryBtn, PrototypeNote, prototypeRef } from './FeatureDialog'

type Form = { recipient: string; routing: string; account: string; amount: string; memo: string }
const empty: Form = { recipient: '', routing: '', account: '', amount: '', memo: '' }

// ABA routing checksum (3-7-1 weights).
const validRouting = (value: string) => {
  if (!/^\d{9}$/.test(value)) return false
  const d = value.split('').map(Number)
  return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0
}

export const AchTransferForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [form, setForm] = useState<Form>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [confirmation, setConfirmation] = useState<{ ref: string; amount: number; recipient: string; last4: string } | null>(null)
  const set = (key: keyof Form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (!form.recipient.trim()) next.recipient = 'Enter the recipient name.'
    if (!validRouting(form.routing)) next.routing = 'Enter a valid 9-digit routing number.'
    if (!/^\d{4,17}$/.test(form.account)) next.account = 'Enter a 4–17 digit account number.'
    const amount = Number(form.amount)
    if (!(amount > 0)) next.amount = 'Enter an amount greater than $0.00.'
    setErrors(next)
    if (Object.keys(next).length) return
    // Prototype only: nothing is sent to a payment network or persisted.
    setConfirmation({ ref: prototypeRef('ACH'), amount, recipient: form.recipient.trim(), last4: form.account.slice(-4) })
    setForm(empty)
  }

  if (confirmation) return (
    <div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-10 text-[#C9A227]" />
      <h3 className="text-base font-semibold text-[#101533]">ACH transfer simulated</h3>
      <p className="text-sm text-slate-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(confirmation.amount)} to {confirmation.recipient} (account ••••{confirmation.last4})</p>
      <p className="text-xs text-slate-500">Prototype reference {confirmation.ref}</p>
      <PrototypeNote>This is a prototype. No funds were moved, no ACH entry was submitted, and your balance is unchanged.</PrototypeNote>
      <button type="button" onClick={onDone} className={primaryBtn}>Done</button>
    </div>
  )

  const field = (key: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`ach-${key}`} className={labelClass}>{label}</label>
      <input id={`ach-${key}`} value={form[key]} onChange={set(key)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `ach-${key}-err` : undefined} className={fieldClass} {...props} />
      {errors[key] && <p id={`ach-${key}-err`} className="mt-1 text-xs text-red-700">{errors[key]}</p>}
    </div>
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {field('recipient', 'Recipient name', { autoComplete: 'name' })}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('routing', 'Routing number', { inputMode: 'numeric', maxLength: 9 })}
        {field('account', 'Account number', { inputMode: 'numeric', maxLength: 17 })}
      </div>
      {field('amount', 'Amount (USD)', { inputMode: 'decimal', type: 'number', min: '0.01', step: '0.01' })}
      {field('memo', 'Memo (optional)', { maxLength: 80 })}
      <PrototypeNote>Prototype: submitting shows a simulated confirmation only. No real money movement occurs.</PrototypeNote>
      <button type="submit" className={primaryBtn}>Review &amp; queue transfer</button>
    </form>
  )
}
