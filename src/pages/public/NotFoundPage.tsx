import React from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Seo } from '@/components/Seo'
import { SITE_NAME } from '@/config/site'

export const NotFoundPage: React.FC = () => (
  <div className="flex min-h-screen flex-col bg-[#f8fafc] text-[#101533]">
    <Seo title={`Page not found | ${SITE_NAME}`} description="The page you requested could not be found." noindex />
    <SiteHeader />
    <main className="mx-auto flex max-w-3xl flex-1 flex-col items-start justify-center px-5 py-24">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">We couldn’t find that page.</h1>
      <p className="mt-4 text-slate-600">The link may be outdated or the page may have moved.</p>
      <div className="mt-8 flex gap-3"><Link to="/" className="rounded-full bg-[#0504AA] px-6 py-3 text-sm font-semibold text-white">Go to homepage</Link><Link to="/contact" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-[#0504AA]">Contact us</Link></div>
    </main>
    <SiteFooter />
  </div>
)
export default NotFoundPage
