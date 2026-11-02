import React from 'react'
import { Link } from 'react-router-dom'
import { LOGO_PATH, SITE_NAME } from '@/config/site'

export const AuthCard: React.FC<React.PropsWithChildren<{ eyebrow: string; title: string; subtitle: string }>> = ({ eyebrow, title, subtitle, children }) => (
  <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-5 py-12 text-[#101533]">
    <div className="w-full max-w-[440px] rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-[#0504AA]/5 sm:p-10">
      <Link to="/" className="flex items-center gap-3" aria-label={`${SITE_NAME} home`}>
        <img src={LOGO_PATH} alt={`${SITE_NAME} logo`} width={48} height={48} className="h-12 w-12 rounded-xl object-contain ring-1 ring-[#0504AA]/10" />
        <span className="text-sm font-semibold text-[#0504AA]">{SITE_NAME}</span>
      </Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#C9A227]">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0504AA]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  </main>
)
