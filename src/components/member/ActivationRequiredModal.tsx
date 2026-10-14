import React from 'react'
import { EVERMONT_COLORS as C } from '@/constants/design'

const money = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

export const ActivationRequiredModal: React.FC<{
  open: boolean
  fee: number | null
  ratePercent: number | null
  onClose: () => void
}> = ({ open, fee, ratePercent, onClose }) =>
  !open ? null : (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        style={{ borderTop: `4px solid ${C.gold}` }}
      >
        <h2 className="text-lg font-semibold" style={{ color: C.blue }}>
          Account activation required
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Please activate your account before using this feature.
        </p>
        <p className="mt-4 text-sm text-slate-700">
          Activation fee:{' '}
          <strong style={{ color: C.blue }}>
            {fee != null ? money(fee) : 'Unavailable, please contact support'}
          </strong>
          {ratePercent != null && (
            <span className="text-slate-500"> ({ratePercent}% of available balance)</span>
          )}
        </p>
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

export default ActivationRequiredModal
