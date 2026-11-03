import React, { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { primaryBtn, PrototypeNote } from './FeatureDialog'

// Display-only, randomly generated digits (not Luhn-registered, never stored).
const randomDigits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')

export const VirtualCardPanel: React.FC<{ holder: string; onDone: () => void }> = ({ holder, onDone }) => {
  const [reveal, setReveal] = useState(false)
  const card = useMemo(() => {
    const d = new Date()
    return { last4: randomDigits(4), cvv: randomDigits(3), expiry: `${String(d.getMonth() + 1).padStart(2, '0')}/${String((d.getFullYear() + 3) % 100).padStart(2, '0')}` }
  }, [])
  return (
    <div className="space-y-4">
      <div className="relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0504AA] via-[#08077a] to-[#0b0d2a] p-5 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 size-40 rounded-full border border-[#C9A227]/30" aria-hidden="true" />
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold tracking-wide">Evermont <span className="text-[#C9A227]">Private</span></p>
          <span className="rounded bg-[#C9A227] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#0b0d2a]">Prototype</span>
        </div>
        <div className="mt-6 h-8 w-11 rounded-md bg-gradient-to-br from-[#e6c75a] to-[#9c7b14]" aria-hidden="true" />
        <p className="mt-4 font-mono text-lg tracking-[.2em] tabular-nums" aria-label={`Card ending in ${card.last4}`}>•••• •••• •••• {card.last4}</p>
        <div className="mt-3 flex items-end justify-between text-xs">
          <div><p className="text-[10px] uppercase text-blue-200">Cardholder</p><p className="font-semibold uppercase">{holder || 'Member'}</p></div>
          <div><p className="text-[10px] uppercase text-blue-200">Expires</p><p className="font-semibold">{card.expiry}</p></div>
          <div><p className="text-[10px] uppercase text-blue-200">CVV</p><p className="font-mono font-semibold">{reveal ? card.cvv : '•••'}</p></div>
        </div>
      </div>
      <button type="button" onClick={() => setReveal(!reveal)} aria-pressed={reveal} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0504AA] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0504AA]">
        {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{reveal ? 'Hide CVV' : 'Reveal CVV'}
      </button>
      <PrototypeNote>Prototype display only. This is not a real card: the digits are randomly generated in your browser, are not a valid card number, and are never stored or sent.</PrototypeNote>
      <button type="button" onClick={onDone} className={primaryBtn}>Close</button>
    </div>
  )
}
