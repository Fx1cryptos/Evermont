import React from 'react'

export const DEMO_BADGE = (
  <span className="inline-flex items-center rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
    Demo
  </span>
)

export const DemoBanner: React.FC = () => (
  <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 text-center text-xs sm:text-sm text-amber-800 font-medium">
    DEMO / SIMULATED DATA — All balances and transactions are fictional test data.
    Not connected to real banking or payment infrastructure.
  </div>
)
