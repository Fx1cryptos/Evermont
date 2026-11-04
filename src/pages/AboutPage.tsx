import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { OpenAccountLink, PublicChrome, SignInLink } from '@/components/PublicChrome'
import { publicPages, SUPPORT_EMAIL } from '@/content/publicPages'

const seo = publicPages.find((page) => page.path === '/about')!

const pillars = [
  { title: 'Integrity', text: 'Evermont describes what this website can and cannot do. We do not publish rates, insurance coverage, or regulatory approvals here.' },
  { title: 'Excellence', text: 'The public site is meant to be calm and specific: a service, a next step, and a way to reach a person. Unverified claims do not belong on the page.' },
  { title: 'Member service', text: `Members sign in through the separate portal. Everyone else can write to ${SUPPORT_EMAIL} for a direct reply. Leave sensitive secrets out of that email.` },
]

export const AboutPage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} jsonLd />
    <main id="main">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6E5610]">About</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.08] text-[#101533] sm:text-6xl">Integrity, excellence, and member service.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Evermont Credit Union presents private-wealth services with restraint. The public site explains the relationship. Account opening and sign-in continue in the member portal.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <OpenAccountLink className="inline-flex items-center justify-center rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0807c8]" />
            <SignInLink className="inline-flex items-center justify-center rounded-full border border-[#0504AA]/20 px-6 py-3.5 text-sm font-semibold text-[#0504AA]" />
          </div>
        </div>
      </section>
      <section className="bg-[#f8f7f4]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-3 lg:px-8">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-3xl bg-white p-8">
              <h2 className="font-serif text-3xl text-[#0504AA]">{pillar.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 className="font-serif text-4xl text-[#101533]">How to continue</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">Read a service page, write to support, or move to the member portal when you are ready to register or sign in.</p>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-[#0504AA]">
            <Link to="/checking" className="underline-offset-4 hover:underline">Checking</Link>
            <Link to="/security" className="underline-offset-4 hover:underline">Security</Link>
            <Link to="/contact" className="underline-offset-4 hover:underline">Contact</Link>
          </div>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default AboutPage
