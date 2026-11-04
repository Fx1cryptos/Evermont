import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { OpenAccountLink, PublicChrome, SignInLink } from '@/components/PublicChrome'
import { publicPages } from '@/content/publicPages'

const seo = publicPages[0]

const products = [
  { href: '/checking', label: 'Checking', title: 'Everyday money, clearly held.', text: 'A checking relationship for the money you use day to day, with sign-in through the member portal.' },
  { href: '/savings', label: 'Savings', title: 'Room for what comes next.', text: 'A savings relationship for money you want to set aside. Terms are confirmed in the portal, not guessed here.' },
  { href: '/credit-card', label: 'Credit Card', title: 'Spending, explained plainly.', text: 'How an Evermont credit card relationship is described, without unpublished rewards or rates.' },
  { href: '/loans', label: 'Loans', title: 'Borrowing, as a conversation.', text: 'A clear starting point for personal, auto, and other lending questions. No rates are listed on this site.' },
  { href: '/retirement', label: 'Retirement', title: 'A longer view.', text: 'Information for people thinking about retirement, without a claim that Evermont administers a plan.' },
]

const reasons = [
  { title: 'Integrity', text: 'We describe services in plain language and do not invent rates, insurance, or licensing claims on this website.' },
  { title: 'Excellence', text: 'Pages stay clear, navigation stays direct, and the next step is always the member portal or a real email address.' },
  { title: 'Member service', text: 'Questions go to support@evermontcredit.online. Please leave passwords and full account numbers out of email.' },
]

const faqs = [
  { q: 'How do I open an account?', a: 'Use Open an Account. Registration continues on the separate member portal. This public page does not submit an application.' },
  { q: 'How do I sign in?', a: 'Sign In opens the member portal. Use the credentials you already have for that portal.' },
  { q: 'How do I reach Evermont?', a: 'Email support@evermontcredit.online. Do not include passwords, one-time codes, or full account numbers.' },
  { q: 'Are rates or approvals published here?', a: 'No. This site does not publish rates, fees, insurance, or approval decisions. Those details belong in the member portal or a direct reply from support.' },
]

export const HomePage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} jsonLd />
    <main id="main">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6E5610]">Evermont Credit Union</p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.05] text-[#101533] sm:text-6xl">Where private wealth is protected.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Built on integrity. Guided by excellence. Review the services below, then open an account or sign in through the member portal.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <OpenAccountLink className="inline-flex items-center justify-center rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0807c8]" />
              <SignInLink className="inline-flex items-center justify-center rounded-full border border-[#0504AA]/20 px-6 py-3.5 text-sm font-semibold text-[#0504AA] hover:border-[#0504AA]" />
            </div>
          </div>
          <div className="flex min-h-72 items-center justify-center rounded-[2rem] border border-[#C9A227]/50 bg-[#f7f5ef] px-8 py-16">
            <img src="/images/evermont-logo.jpeg" alt="" className="h-40 w-40 object-contain sm:h-52 sm:w-52" />
          </div>
        </div>
      </section>

      <section aria-labelledby="products-heading" className="bg-[#f8f7f4]">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <h2 id="products-heading" className="font-serif text-4xl text-[#101533]">Services</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">Each card opens a page on this site. None of them quote a rate, a fee, or an insurance claim.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link key={product.href} to={product.href} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-[#0504AA]/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6E5610]">{product.label}</p>
                <h3 className="mt-4 font-serif text-2xl text-[#101533]">{product.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{product.text}</p>
                <span className="mt-6 text-sm font-semibold text-[#0504AA]">View {product.label.toLowerCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="why-heading" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <h2 id="why-heading" className="font-serif text-4xl text-[#101533]">Why Evermont</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {reasons.map((reason) => (
              <article key={reason.title}>
                <h3 className="font-serif text-2xl text-[#0504AA]">{reason.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="security-heading" className="bg-[#0504AA] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">Security</p>
            <h2 id="security-heading" className="mt-4 font-serif text-4xl">Sign in only through the member portal.</h2>
            <p className="mt-4 leading-7 text-blue-100">This public website does not show balances. Do not email a password or a full account number. If something seems wrong, use the support address published on the contact page.</p>
          </div>
          <Link to="/security" className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA] hover:bg-[#f7f5ef]">Read security practices</Link>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <h2 id="faq-heading" className="font-serif text-4xl text-[#101533]">Questions</h2>
          <div className="mt-10 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer list-none font-semibold text-[#101533] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-6">
                    {item.q}
                    <span aria-hidden="true" className="text-[#6E5610] group-open:hidden">+</span>
                    <span aria-hidden="true" className="hidden text-[#6E5610] group-open:inline">−</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default HomePage
