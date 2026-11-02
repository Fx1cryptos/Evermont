import React from 'react'
import { Link } from 'react-router-dom'

export const AdminComingSoonPage: React.FC<{ section: string }> = ({ section }) => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f7fb] px-5 text-center text-[#101533]">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">Admin · {section.replace('-', ' ')}</p>
    <h1 className="text-3xl font-semibold">Coming soon</h1>
    <p className="max-w-md text-sm text-slate-600">This administrative section is not built yet in the prototype.</p>
    <Link to="/admin" className="rounded-full bg-[#0504AA] px-5 py-2.5 text-sm font-semibold text-white">Back to admin dashboard</Link>
  </main>
)
