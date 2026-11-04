import { Link } from 'react-router-dom'
import { PageBanner } from '@/components/PageBanner'
import { PageMeta } from '@/components/PageMeta'
import { PublicChrome } from '@/components/PublicChrome'
import { pageByPath } from '@/content/publicPages'

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
      <PageBanner image={seo.image} alt="Quiet library reading room with oak tables and soft daylight" eyebrow="About Us" title="A More Thoughtful Approach to Private Wealth Banking" lede="Evermont Credit Union is built around a commitment to financial responsibility, thoughtful service, and a more personal approach to wealth management. Our vision is to create a professional financial-services experience where individuals and families can approach their financial goals with clarity, confidence, and care." actions={[{ href: '/services', label: 'Explore Our Services' }, { href: '/contact', label: 'Contact Our Team' }]} />

      <section className="bg-white" aria-labelledby="story">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <h2 id="story" className="font-serif text-4xl text-[#101533]">Our Story</h2>
          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>Evermont was established around an independent vision: a private-wealth brand that treats financial trust as something to be earned in ordinary conversations, not asserted with a slogan.</p>
            <p>The aim is responsible financial service, long-term relationships, privacy, professionalism, and communication that states what is available. Modern tools belong in that picture only when they are actually connected.</p>
            <p>The public website explains that vision. It does not invent a founding date, a roster of leaders, or an institutional affiliation.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f7f4]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl bg-white p-8">
            <h2 className="font-serif text-3xl text-[#0504AA]">Our Mission</h2>
            <p className="mt-4 font-semibold leading-7 text-[#101533]">To Make Financial Confidence More Accessible Through Responsible, Personal Service.</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">That means thoughtful service, respect, protection of information people choose to share, support for careful decisions, clear communication, and digital tools that do a real job.</p>
          </article>
          <article className="rounded-3xl bg-[#0504AA] p-8 text-white">
            <h2 className="font-serif text-3xl">Our Vision</h2>
            <p className="mt-4 font-semibold leading-7">To Build a Trusted, Modern Private Wealth Brand Recognized for Integrity and Excellence.</p>
            <p className="mt-4 text-sm leading-7 text-blue-100">The ambition is a professional experience supported by useful innovation, responsible service, and relationships that last because the standard stays the same.</p>
          </article>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="goals">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="goals" className="font-serif text-4xl text-[#101533]">Our Goals</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {goals.map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-slate-200 p-7">
                <h3 className="font-serif text-2xl text-[#0504AA]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef]" aria-labelledby="values">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="values" className="font-serif text-4xl text-[#101533]">Our Core Values</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(([title, text]) => (
              <article key={title} className="rounded-3xl bg-white p-6">
                <h3 className="font-serif text-xl text-[#0504AA]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="why">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="why" className="font-serif text-4xl text-[#101533]">Why Evermont?</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {['A thoughtful private-wealth approach.', 'Professional communication.', 'Modern digital experiences where they are actually available.', 'Responsible financial practices.', 'A commitment to customer privacy.', 'A consistent standard of service.'].map((item) => (
              <li key={item} className="rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-7 text-slate-700">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#0504AA] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl">Your Financial Journey Deserves Thoughtful Attention.</h2>
            <p className="mt-4 leading-7 text-blue-100">Discover a more personal approach to financial services with a brand built around integrity, responsibility, and excellence.</p>
          </div>
          <Link to="/contact" className="inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA]">Contact Evermont</Link>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default AboutPage
