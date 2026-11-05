import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { PublicChrome, SignInLink } from '@/components/PublicChrome'
import { pageByPath } from '@/content/publicPages'

const seo = pageByPath('/')!

const products = [
  { href: '/checking', title: 'Checking', text: 'A clear place for everyday money, described without unpublished terms.' },
  { href: '/savings', title: 'Savings', text: 'Set money aside for a later purpose. No yield is stated here.' },
  { href: '/credit-card', title: 'Credit card', text: 'A card relationship in plain language, without pricing or rewards figures.' },
  { href: '/loans', title: 'Loans', text: 'A starting point for borrowing questions. No rates or approvals are listed.' },
  { href: '/retirement', title: 'Retirement', text: 'Longer-term questions, without a claim that Evermont runs a plan.' },
]

const reasons = [
  { title: 'Member-focused', text: 'The next step is always a person, the member portal, or a page that says what it can and cannot do.' },
  { title: 'Clarity and discretion', text: 'We describe services quietly and leave out numbers, promises, and details we have not published.' },
  { title: 'Human plus technology', text: 'Evermont is a financial technology platform. Digital tools and direct support sit side by side.' },
]

const faqs = [
  { q: 'What is Evermont?', a: 'A financial technology platform with private-wealth style service. This public site explains the experience and points you to the member portal.' },
  { q: 'How do I open an account?', a: 'Use Open an Account. Registration continues on the member portal. This page does not submit an application.' },
  { q: 'How do I sign in?', a: 'Sign In opens the separate member portal. Use the credentials you already have there.' },
  { q: 'Are rates or fees listed here?', a: 'No. This website does not publish rates, fees, or guarantees.' },
]

export const HomePage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} image={seo.image} jsonLd />
    <main id="main">
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-[#C9A227] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6E5610]">Private Wealth, Thoughtfully Protected</p>
            <h1 className="mt-5 font-serif text-5xl leading-tight text-[#101533] sm:text-6xl">Where private wealth is protected.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Evermont offers a discreet, responsible way to explore financial services. The public site explains the experience. Account steps continue in the member portal.</p>
            <p className="mt-5 font-serif text-xl text-[#C9A227]">Built on Integrity. Guided by Excellence.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/open-account" className="inline-flex items-center justify-center rounded-full bg-[#C9A227] px-6 py-3.5 text-sm font-semibold text-[#101533]">Open an Account</Link>
              <SignInLink className="inline-flex items-center justify-center rounded-full border border-[#0504AA]/20 px-6 py-3.5 text-sm font-semibold text-[#0504AA]" />
            </div>
          </div>
          <img src={seo.image} alt="Modern stone and white building facade with a blank royal-blue sign panel" className="h-auto w-full rounded-3xl object-cover" />
        </div>
      </section>

      <section className="bg-[#f8f7f4]" aria-labelledby="products-heading">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="products-heading" className="font-serif text-4xl text-[#101533]">Products</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">Each card opens a real page. None of them quote a rate, a fee, or a guarantee.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((item) => (
              <Link key={item.href} to={item.href} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7">
                <h3 className="font-serif text-2xl text-[#0504AA]">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{item.text}</p>
                <span className="mt-6 text-sm font-semibold text-[#0504AA]">View {item.title.toLowerCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="why-heading">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="why-heading" className="font-serif text-4xl text-[#101533]">Why Evermont</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {reasons.map((reason) => (
              <article key={reason.title}>
                <h3 className="font-serif text-2xl text-[#0504AA]">{reason.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0504AA] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">Security</p>
            <h2 className="mt-3 font-serif text-4xl">Sign in only through the member portal.</h2>
            <p className="mt-4 leading-7 text-blue-100">This public website does not show balances. Do not email a password or a full account number. Evermont does not promise that every risk can be removed.</p>
          </div>
          <Link to="/security" className="inline-flex shrink-0 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA]">Read security practices</Link>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <h2 id="faq-heading" className="font-serif text-4xl text-[#101533]">Questions</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((item) => (
              <details key={item.q} className="py-5">
                <summary className="cursor-pointer list-none font-semibold text-[#101533] [&::-webkit-details-marker]:hidden">{item.q}</summary>
                <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-3xl text-[#101533]">Ready when you are.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">Open an account in the member portal, or ask a question from the contact page.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/open-account" className="inline-flex items-center justify-center rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white">Open an Account</Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-[#0504AA]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA]">Contact Evermont</Link>
          </div>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default HomePage
