import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVERMONT_COLORS as C } from '@/constants/design'
import { ROUTES } from '@/constants/routes'

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

  return !open ? null : (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        style={{ borderTop: `4px solid ${C.gold}` }}
      >
        <div className="mb-4 flex items-center justify-center gap-2 text-[#C9A227]" aria-hidden="true"><span className="h-px w-16 bg-[#C9A227]" /><span className="size-2 rotate-45 bg-[#C9A227]" /><span className="h-px w-16 bg-[#C9A227]" /></div>
        <h2 className="text-center text-xl font-semibold" style={{ color: C.blue }}>
          Account Activation Required
        </h2>
        <p className="mt-4 text-center text-sm leading-6 text-slate-700">
          Please contact our support team to confirm your account activation requirements before using this feature.
        </p>
        {fee != null && <div className="mt-5 rounded-xl bg-[#fffaf0] p-4 text-center"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activation fee</p><p className="mt-1 text-2xl font-semibold text-[#0504AA]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fee)}</p>{ratePercent != null && <p className="mt-1 text-xs text-slate-500">Calculated at {ratePercent}%</p>}</div>}
        <button type="button" onClick={() => { onClose(); navigate(ROUTES.SUPPORT) }} className="mt-4 block w-full text-center text-sm font-semibold text-[#0504AA] underline">Contact Support</button>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl px-4 py-2 font-semibold text-white"
          style={{ background: C.blue }}
        >
          OK
        </button>
        <button
          type="button"
          onClick={() => { onClose(); navigate(ROUTES.ACCOUNTS) }}
          className="mt-3 w-full rounded-xl border border-[#C9A227] px-4 py-2 font-semibold text-[#0504AA] transition hover:bg-[#fffaf0]"
        >
          Activate Your Account
        </button>
      </div>
    </div>
  )
}

export default ActivationRequiredModal
