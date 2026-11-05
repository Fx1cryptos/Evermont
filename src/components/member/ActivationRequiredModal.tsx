import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVERMONT_COLORS as C } from '@/constants/design'
import { ROUTES } from '@/constants/routes'
import { ACTIVATE_ACCOUNT_LABEL, ACTIVATION_REQUIRED_BODY, ACTIVATION_REQUIRED_TITLE, bankingServiceForPath } from '@/lib/bankingServices'

export const ActivationRequiredModal: React.FC<{
  open: boolean
  nextPath?: string
  onClose: () => void
}> = ({ open, nextPath, onClose }) => {
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

  const safeNext = nextPath && bankingServiceForPath(nextPath) ? nextPath : ''
  const activationUrl = safeNext ? `${ROUTES.ACTIVATION}?next=${encodeURIComponent(safeNext)}` : ROUTES.ACTIVATION

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="activation-required-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" style={{ borderTop: `4px solid ${C.gold}` }}>
        <h2 id="activation-required-title" className="text-center text-xl font-semibold" style={{ color: C.blue }}>
          {ACTIVATION_REQUIRED_TITLE}
        </h2>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">{ACTIVATION_REQUIRED_BODY}</p>
        <button type="button" onClick={() => { onClose(); navigate(activationUrl) }} className="mt-5 w-full rounded-xl px-4 py-2.5 font-semibold text-white" style={{ background: C.blue }}>
          {ACTIVATE_ACCOUNT_LABEL}
        </button>
        <button type="button" onClick={() => { onClose(); navigate(ROUTES.SUPPORT) }} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700">
          Contact Support
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl border border-[#C9A227] px-4 py-2.5 font-semibold text-[#0504AA]">
          Close
        </button>
      </div>
    </div>
  )
}

export default ActivationRequiredModal
