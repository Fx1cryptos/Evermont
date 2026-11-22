import React from 'react'
import { Link } from 'react-router-dom'
import { SITE_URL, LOGO_PATH, SITE_NAME, SITE_POSITIONING, SITE_TAGLINE, SITE_TAGLINE_SECOND, SUPPORT_EMAIL } from '@/config/site'

/** Shared member-auth layout. No promotional panels. */
export const AuthCard: React.FC<React.PropsWithChildren<{ eyebrow: string; title: string; subtitle: string }>> = ({ eyebrow, title, subtitle, children }) => (
  <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 text-[#07142D]">
    <div className="w-full max-w-[440px]">
      <Link to="/" className="flex items-center gap-3" aria-label={`${SITE_NAME} home`}>
        <img src={LOGO_PATH} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-contain" />
        <span>
          <span className="block text-sm font-semibold text-[#0504AA]">{SITE_NAME}</span>
          <span className="block text-xs text-slate-500">{SITE_POSITIONING}</span>
        </span>
      </Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#C9A227]">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0504AA]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
      <div className="mt-8">{children}</div>
      <footer className="mt-10 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="mb-4 inline-flex rounded-lg border border-[#0504AA] px-4 py-2 font-semibold text-[#0504AA]">Visit EVERMONT Website</a>
        <p>{SITE_TAGLINE}</p>
        <p>{SITE_TAGLINE_SECOND}</p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 inline-block font-semibold text-[#0504AA] hover:text-[#C9A227]">Contact support</a>
      </footer>
    </div>
  </main>
)
