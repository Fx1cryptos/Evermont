import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export const FeatureDialog: React.FC<{ open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }> = ({ open, title, subtitle, onClose, children }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b0d2a]/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="feature-dialog-title">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" style={{ borderTop: '4px solid #C9A227' }}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="feature-dialog-title" className="text-lg font-semibold text-[#0504AA]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0504AA]"><X className="size-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export const PrototypeNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-2 text-xs leading-5 text-[#5c4a0a]">{children}</p>
)

export const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#101533] focus:border-[#0504AA] focus:outline-none focus:ring-2 focus:ring-[#0504AA]/30'
export const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-600'
export const primaryBtn = 'w-full rounded-xl bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#04038a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 disabled:opacity-60'
export const prototypeRef = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`
