import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { OpenAccountLink, PublicChrome, SignInLink } from '@/components/PublicChrome'
import { publicPages, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '@/content/publicPages'

const seo = publicPages.find((page) => page.path === '/about')!

const values = [
  { title: 'Integrity', text: 'We describe services in plain language. This website does not invent rates, history, insurance, or licensing claims.' },
  { title: 'Excellence', text: 'Pages stay specific: what the service is, what the next step is, and how to reach a person.' },
  { title: 'Member service', text: 'Members sign in through the separate portal. Questions can come by phone or by email to the addresses published here.' },
]

const sections = [
  { id: 'mission', title: 'Mission', text: 'Evermont’s public mission is to explain private-wealth services clearly, so a person can see the next step before using the member portal.' },
  { id: 'service', title: 'How we serve members', text: 'This site introduces checking, savings, cards, loans, and retirement information. Registration and sign-in continue on the member portal. Balances are not shown here.' },
  { id: 'security', title: 'Commitment to security', text: 'Sign in only through the member portal linked from this site. Do not send passwords, one-time codes, or full account numbers by email or text. If a request for those secrets appears, stop and use the phone or email on the contact page.' },
  { id: 'leadership', title: 'Leadership approach', text: 'The approach is simple: publish only what can be supported, make the next step obvious, and stay reachable. This page does not invent executives, dates, or statistics.' },
]

export const AboutPage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} jsonLd />
    <main id="main">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6E5610]">About</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.08] text-[#101533] sm:text-6xl">A clear account of how Evermont works.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Evermont Credit Union presents private-wealth services with restraint. The public site explains the relationship. Account opening and sign-in continue in the member portal.</p>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="bg-[#f8f7f4]">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="values-heading" className="font-serif text-4xl text-[#101533]">Values</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <article key={value.title} className="rounded-3xl bg-white p-8">
                <h3 className="font-serif text-3xl text-[#0504AA]">{value.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:px-8">
          {sections.map((section) => (
            <article key={section.id} aria-labelledby={section.id} className="max-w-3xl border-t border-slate-200 pt-10 first:border-t-0 first:pt-0">
              <h2 id={section.id} className="font-serif text-3xl text-[#101533]">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0504AA] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl">Continue when you are ready.</h2>
            <p className="mt-4 leading-7 text-blue-100">Open an account in the member portal, sign in, or ask a question at <a className="font-semibold text-white underline" href={SUPPORT_PHONE_TEL}>{SUPPORT_PHONE_DISPLAY}</a> or {SUPPORT_EMAIL}.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <OpenAccountLink className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA]" />
            <SignInLink className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-5 px-5 py-10 text-sm font-semibold text-[#0504AA] lg:px-8">
          <Link to="/security" className="underline-offset-4 hover:underline">Security</Link>
          <Link to="/contact" className="underline-offset-4 hover:underline">Contact</Link>
          <Link to="/checking" className="underline-offset-4 hover:underline">Checking</Link>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default AboutPage
