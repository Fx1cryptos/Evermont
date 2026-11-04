import { Link, useLocation } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { OpenAccountLink, PublicChrome, SignInLink } from '@/components/PublicChrome'
import { publicPages, SUPPORT_EMAIL } from '@/content/publicPages'

type Product = {
  path: string
  eyebrow: string
  headline: string
  lede: string
  points: [string, string][]
}

const products: Record<string, Product> = {
  '/checking': {
    path: '/checking',
    eyebrow: 'Checking',
    headline: 'A clear home for everyday money.',
    lede: 'Evermont checking is for the money you use in ordinary life. Sign-in and account opening continue in the member portal. This page does not list fees or minimums.',
    points: [
      ['What this page is', 'A description of the checking relationship, not an offer with unpublished terms.'],
      ['How access works', 'Members sign in on the separate portal. This website does not display balances.'],
      ['Questions', `Write to ${SUPPORT_EMAIL} before you rely on a detail that is not written here.`],
    ],
  },
  '/savings': {
    path: '/savings',
    eyebrow: 'Savings',
    headline: 'Set money aside without invented returns.',
    lede: 'Evermont savings is a place to hold money for later priorities. Any dividend, rate, or condition is confirmed in the member portal or by support, not on this page.',
    points: [
      ['A longer horizon', 'Use savings when you want money kept apart from everyday spending.'],
      ['No published yield', 'This site does not publish a yield or a promotional return.'],
      ['Next step', 'Open an account to continue registration, or ask support what is currently available.'],
    ],
  },
  '/credit-card': {
    path: '/credit-card',
    eyebrow: 'Credit card',
    headline: 'A credit card relationship, stated plainly.',
    lede: 'An Evermont credit card is a spending relationship with its own terms. Those terms, including any rewards or charges, are not published on this public page.',
    points: [
      ['No pricing figure', 'We do not publish card pricing or rewards here.'],
      ['Application path', 'Account opening continues on the member portal registration page.'],
      ['Existing cardholders', 'Sign in on the member portal to see your own account.'],
    ],
  },
  '/loans': {
    path: '/loans',
    eyebrow: 'Loans',
    headline: 'Lending starts as a conversation.',
    lede: 'Personal, auto, and other borrowing questions can start here. Evermont does not publish rates, monthly payments, or approval decisions on this website.',
    points: [
      ['What you can do now', 'Read the approach, then continue in the member portal or email support.'],
      ['What we will not imply', 'A page view is not an application, a prequalification, or an approval.'],
      ['Older lending links', 'Personal, auto, and digital-asset lending links come to this page.'],
    ],
  },
  '/retirement': {
    path: '/retirement',
    eyebrow: 'Retirement',
    headline: 'Room to talk about a longer future.',
    lede: 'Retirement planning is a conversation about goals and timing. This page does not say that Evermont sponsors, administers, or manages a retirement plan.',
    points: [
      ['Information, not a plan document', 'Employer plan features vary. Confirm any plan with the sponsor or administrator.'],
      ['No performance claims', 'This site does not publish returns, projections, or contribution limits.'],
      ['How to ask', `Email ${SUPPORT_EMAIL} or continue through the member portal.`],
    ],
  },
  '/cryptocurrency': {
    path: '/cryptocurrency',
    eyebrow: 'Digital assets',
    headline: 'A careful note on digital assets.',
    lede: 'Digital assets can be volatile, and you can lose money. Evermont does not describe buying, selling, exchange, or custody as available unless support confirms it for you.',
    points: [
      ['Availability is not assumed', 'Contact support before treating any digital-asset service as offered.'],
      ['Risk is real', 'Prices can move sharply. This page is not a recommendation.'],
      ['Where to ask', `Email ${SUPPORT_EMAIL} for current information.`],
    ],
  },
}

const buttonClass = 'inline-flex items-center justify-center rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0807c8]'
const quietClass = 'inline-flex items-center justify-center rounded-full border border-[#0504AA]/20 px-6 py-3.5 text-sm font-semibold text-[#0504AA]'

export const ServicePage: React.FC = () => {
  const { pathname } = useLocation()
  const content = products[pathname] ?? products['/checking']
  const seo = publicPages.find((page) => page.path === content.path)

  return (
    <PublicChrome>
      <PageMeta title={seo?.title ?? content.headline} description={seo?.description ?? content.lede} path={content.path} />
      <main id="main">
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6E5610]">{content.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.08] text-[#101533] sm:text-6xl">{content.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{content.lede}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <OpenAccountLink className={buttonClass} />
              <SignInLink className={quietClass} />
            </div>
          </div>
        </section>
        <section className="bg-[#f8f7f4]">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 py-20 md:grid-cols-3 lg:px-8">
            {content.points.map(([heading, body]) => (
              <article key={heading} className="rounded-3xl bg-white p-7">
                <h2 className="font-serif text-2xl text-[#101533]">{heading}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-16 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p className="max-w-xl text-sm leading-7 text-slate-600">Need a person instead of a page? Contact support, or return to the full list of services.</p>
            <div className="flex gap-5 text-sm font-semibold text-[#0504AA]">
              <Link to="/contact" className="underline-offset-4 hover:underline">Contact</Link>
              <Link to="/" className="underline-offset-4 hover:underline">All services</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  )
}

export default ServicePage
