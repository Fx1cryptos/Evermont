import React from 'react'

export const PublicTrustBanner: React.FC = () => {
  return (
    <aside
      aria-label="Evermont security notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-evermont-gold/40 bg-evermont-blue px-4 py-2 text-center text-xs font-medium tracking-wide text-white shadow-[0_-2px_12px_rgba(5,4,170,0.15)] sm:text-sm"
    >
      Your information is protected by Evermont security controls.
    </aside>
  )
}
