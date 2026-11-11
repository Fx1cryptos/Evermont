import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { PublicChrome } from '@/components/PublicChrome'
import { LOGO_PATH, pageByPath } from '@/content/publicPages'

const seo = pageByPath('/about')!

const goals = [
  ['Trust and Integrity', 'Build confidence through honest communication, accountability, and responsible practices.'],
  ['Privacy and Security', 'Prioritize information protection, secure technology, and appropriate privacy safeguards.'],
  ['Customer Experience', 'Make financial information and available services easier to understand and access.'],
  ['Digital Innovation', 'Develop reliable digital tools that make authorized financial services more convenient.'],
  ['Financial Responsibility', 'Encourage informed financial decisions and responsible financial management.'],
  ['Long-Term Relationships', 'Build meaningful relationships through consistency, professionalism, and attentive service.'],
] as const

const values = [
  ['Integrity', 'Say what is known, and leave unpublished claims unpublished.'],
  ['Trust', 'Earn it by being consistent about the next step.'],
  ['Excellence', 'Prefer a clear page over a crowded one.'],
  ['Accountability', 'Put a real phone number and email where people can use them.'],
  ['Privacy', 'Do not ask for passwords or full account numbers on this public site.'],
  ['Innovation', 'Use digital tools where they are actually connected, and label the rest as planned.'],
  ['Professionalism', 'Write in plain language and avoid invented praise.'],
  ['Customer Commitment', 'Make support reachable without promising how fast a reply will come.'],
] as const

export const AboutPage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} image={seo.image} jsonLd />
    <main id="main">
      <section className="bg-[#F5F7FB] px-4 py-8 sm:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-sm bg-[#080A9F] text-white">
          <img src={seo.image} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-8 py-16 text-center sm:px-16 sm:py-20">
            <img src={LOGO_PATH} alt="Evermont Credit Union" className="h-24 w-auto object-contain" />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#C8A43D]">About Us</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">A More Thoughtful Approach to Private Wealth Banking</h1>
            <p className="mt-6 text-base leading-8 text-blue-50">Evermont is a financial technology platform with a private-wealth style of service: discreet, responsible, and clear about the next step.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/services" className="inline-flex items-center justify-center rounded-full bg-[#C8A43D] px-6 py-3.5 text-sm font-semibold text-[#07143D]">Explore Our Services</Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3.5 text-sm font-semibold text-white">Contact Our Team</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="what-we-are">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <h2 id="what-we-are" className="font-serif text-4xl text-[#07143D]">What we are</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Evermont is a financial technology platform. The public site presents services in a private-wealth style and connects people to the member portal. It does not publish rates, fees, or a claim of official status.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Integrity', 'Say what is known, and leave unpublished claims off the page.'],
              ['Excellence', 'Prefer a clear page over a crowded one.'],
              ['Member service', 'Make the portal, the phone, and the support email easy to find.'],
              ['Discretion', 'Keep the public site free of balances, secrets, and unnecessary detail.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-slate-200 p-6">
                <h3 className="font-serif text-2xl text-[#080A9F]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F7FB]" aria-labelledby="story">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <h2 id="story" className="font-serif text-4xl text-[#07143D]">Our Story</h2>
          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>Evermont was established around an independent vision: a financial technology platform that treats trust as something earned in ordinary conversations, not asserted with a slogan.</p>
            <p>The aim is responsible service, long-term relationships, discretion, and communication that states what is available. Digital tools belong in that picture only when they are actually connected.</p>
            <p>The public website explains that vision. It does not invent a founding date, a roster of leaders, or an affiliation with another organization.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F7FB]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl bg-white p-8">
            <h2 className="font-serif text-3xl text-[#080A9F]">Our Mission</h2>
            <p className="mt-4 font-semibold leading-7 text-[#07143D]">To Make Financial Confidence More Accessible Through Responsible, Personal Service.</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">That means thoughtful service, respect, protection of information people choose to share, support for careful decisions, clear communication, and digital tools that do a real job.</p>
          </article>
          <article className="rounded-3xl bg-[#080A9F] p-8 text-white">
            <h2 className="font-serif text-3xl">Our Vision</h2>
            <p className="mt-4 font-semibold leading-7">To Build a Trusted, Modern Private Wealth Brand Recognized for Integrity and Excellence.</p>
            <p className="mt-4 text-sm leading-7 text-blue-100">The ambition is a professional experience supported by useful innovation, responsible service, and relationships that last because the standard stays the same.</p>
          </article>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="goals">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="goals" className="font-serif text-4xl text-[#07143D]">Our Goals</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {goals.map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-slate-200 p-7">
                <h3 className="font-serif text-2xl text-[#080A9F]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F7FB]" aria-labelledby="values">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="values" className="font-serif text-4xl text-[#07143D]">Our Core Values</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(([title, text]) => (
              <article key={title} className="rounded-3xl bg-white p-6">
                <h3 className="font-serif text-xl text-[#080A9F]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="why">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="why" className="font-serif text-4xl text-[#07143D]">Why Evermont?</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {['A thoughtful private-wealth approach.', 'Professional communication.', 'Modern digital experiences where they are actually available.', 'Responsible financial practices.', 'A commitment to customer privacy.', 'A consistent standard of service.'].map((item) => (
              <li key={item} className="rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-7 text-slate-700">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#080A9F] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl">Your Financial Journey Deserves Thoughtful Attention.</h2>
            <p className="mt-4 leading-7 text-blue-100">Discover a more personal approach to financial services with a brand built around integrity, responsibility, and excellence.</p>
          </div>
          <Link to="/contact" className="inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#080A9F]">Contact Evermont</Link>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default AboutPage
