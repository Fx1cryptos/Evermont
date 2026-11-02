import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { PublicLayout } from '@/components/site/PublicLayout'
import { PAGES } from './content'
import { NotFoundPage } from './NotFoundPage'

export const ContentPage: React.FC = () => {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  const page = PAGES[path]
  if (!page) return <NotFoundPage />
  return (
    <PublicLayout path={path}>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">{page.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">{page.heading}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{page.intro}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-14 lg:px-8">
        {page.sections.map(s => (
          <article key={s.heading} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <h2 className="text-2xl font-semibold tracking-tight text-[#0504AA]">{s.heading}</h2>
            {s.body && <p className="mt-3 leading-7 text-slate-600">{s.body}</p>}
            {s.bullets && <ul className="mt-4 flex flex-col gap-3">{s.bullets.map(b => <li key={b} className="flex items-start gap-3 text-slate-600"><CheckCircle2 className="mt-1 size-4 shrink-0 text-[#C9A227]" aria-hidden="true" />{b}</li>)}</ul>}
          </article>
        ))}
        {page.related && (
          <nav aria-label="Related pages" className="flex flex-wrap gap-3 pt-2">
            {page.related.map(([label, to]) => <Link key={to} to={to} className="inline-flex items-center gap-1 rounded-full border border-[#0504AA]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0504AA] hover:border-[#0504AA]">{label}<ArrowRight className="size-3.5" /></Link>)}
          </nav>
        )}
      </section>
      {page.cta && (
        <section className="bg-[#0504AA] text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight">Ready to explore the member portal?</h2>
            <div className="flex gap-3"><Link to="/register" className="rounded-full bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#101533]">Open an Account</Link><Link to="/login" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold">Sign In</Link></div>
          </div>
        </section>
      )}
    </PublicLayout>
  )
}
export default ContentPage
