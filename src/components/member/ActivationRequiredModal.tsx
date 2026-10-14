import React, { useEffect } from 'react'
import { EVERMONT_COLORS as C } from '@/constants/design'

export const ActivationRequiredModal: React.FC<{
  open: boolean
  fee?: number | null
  ratePercent?: number | null
  onClose: () => void
}> = ({ open, onClose }) => {
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
        <a href="mailto:support@evermontcredit.online" className="mt-4 block text-center text-sm font-semibold text-[#0504AA] underline">Contact Support</a>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl px-4 py-2 font-semibold text-white"
          style={{ background: C.blue }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default ActivationRequiredModal
