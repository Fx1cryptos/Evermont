import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVERMONT_COLORS as C } from '@/constants/design'
import { ROUTES } from '@/constants/routes'

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export const ActivationRequiredModal: React.FC<{
  open: boolean
  fee?: number | null
  ratePercent?: number | null
  onClose: () => void
}> = ({ open, fee, ratePercent, onClose }) => {
  const navigate = useNavigate()
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="activation-required-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" style={{ borderTop: `4px solid ${C.gold}` }}>
        <h2 id="activation-required-title" className="text-center text-xl font-semibold" style={{ color: C.blue }}>
          Account activation required
        </h2>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          Please activate your account before using this feature.
        </p>
        <div className="mt-5 rounded-xl bg-[#f7f8fc] p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#C9A227]">Activation fee</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: C.blue }}>
            {fee != null ? money(fee) : 'Unavailable, please contact support'}
          </p>
          {ratePercent != null && <p className="mt-1 text-xs text-slate-500">Calculated at {ratePercent}% of available balance.</p>}
        </div>
        <button type="button" onClick={() => { onClose(); navigate(ROUTES.SUPPORT) }} className="mt-5 w-full rounded-xl px-4 py-2.5 font-semibold text-white" style={{ background: C.blue }}>
          Contact Support
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700">
          OK
        </button>
        <button type="button" onClick={() => { onClose(); navigate(ROUTES.ACTIVATION) }} className="mt-3 w-full rounded-xl border border-[#C9A227] px-4 py-2.5 font-semibold text-[#0504AA]">
          Activate Your Account
        </button>
      </div>
    </div>
  )
}

export default ActivationRequiredModal
