import { Link, useLocation } from 'react-router-dom'
import { PublicDocument } from '@/components/PageBanner'
import { SUPPORT_EMAIL } from '@/content/publicPages'

const products: Record<string, { eyebrow: string; title: string; lede: string; alt: string; points: [string, string][] }> = {
  '/checking': {
    eyebrow: 'Checking',
    title: 'A clear home for everyday money.',
    lede: 'Evermont checking is described here in general terms. Sign-in and account opening continue in the member portal. Fees and minimums are not published on this page.',
    alt: 'Empty marble hall with blue glass and gold details',
    points: [['What this page is', 'A description, not an offer with unpublished terms.'], ['Access', 'Members sign in on the separate portal. Balances are not shown here.'], ['Questions', `Write to ${SUPPORT_EMAIL} before you rely on a detail that is not written here.`]],
  },
  '/savings': {
    eyebrow: 'Savings',
    title: 'Set money aside without a published yield.',
    lede: 'Savings is a way to hold money for a later purpose. Any dividend or condition is confirmed in the member portal or by support, not on this page.',
    alt: 'Empty marble hall with blue glass and gold details',
    points: [['A later purpose', 'Use savings when you want money kept apart from everyday spending.'], ['No published yield', 'This site does not state a return.'], ['Next step', 'Open an account to continue registration, or ask support what is available.']],
  },
  '/credit-card': {
    eyebrow: 'Credit card',
    title: 'A credit card relationship, stated plainly.',
    lede: 'Card terms, including any rewards or charges, are not published on this public page.',
    alt: 'Conference table with a closed notebook against a royal blue wall',
    points: [['No pricing figure', 'We do not publish card pricing or rewards here.'], ['How to continue', 'Account opening continues on the member portal.'], ['Existing cardholders', 'Sign in on the member portal to see your own account.']],
  },
  '/loans': {
    eyebrow: 'Loans',
    title: 'Lending starts as a conversation.',
    lede: 'Personal, auto, and other borrowing questions can start here. Rates, payments, and approval decisions are not published.',
    alt: 'Conference table with a closed notebook against a royal blue wall',
    points: [['What you can do now', 'Read the approach, then continue in the member portal or email support.'], ['What a visit does not do', 'A page view is not an application or an approval.'], ['Older links', 'Personal, auto, and digital-asset lending links come to this page.']],
  },
  '/retirement': {
    eyebrow: 'Retirement',
    title: 'Room to talk about a longer future.',
    lede: 'This page does not say that Evermont sponsors, administers, or manages a retirement plan.',
    alt: 'Evening skyline across calm water',
    points: [['Not a plan document', 'Employer plan features vary. Confirm any plan with its sponsor.'], ['No performance claims', 'Returns, projections, and contribution limits are not published here.'], ['How to ask', `Email ${SUPPORT_EMAIL} or continue through the member portal.`]],
  },
  '/cryptocurrency': {
    eyebrow: 'Digital assets',
    title: 'A careful note on digital assets.',
    lede: 'Digital assets can be volatile, and you can lose money. Buying, selling, exchange, and custody are not described as available unless support confirms that for you.',
    alt: 'Evening skyline across calm water',
    points: [['Availability is not assumed', 'Contact support before treating a digital-asset service as offered.'], ['Risk is real', 'This page is not a recommendation.'], ['Where to ask', `Email ${SUPPORT_EMAIL}.`]],
  },
}

export const ServicePage: React.FC = () => {
  const { pathname } = useLocation()
  const content = products[pathname] ?? products['/checking']
  return (
    <PublicDocument path={products[pathname] ? pathname : '/checking'} eyebrow={content.eyebrow} title={content.title} lede={content.lede} imageAlt={content.alt} actions={[{ href: '/open-account', label: 'Open an Account' }, { href: '/contact', label: 'Contact Our Team' }]}>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">
          {content.points.map(([heading, body]) => (
            <article key={heading} className="rounded-3xl border border-slate-200 p-7">
              <h2 className="font-serif text-2xl text-[#101533]">{heading}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto max-w-6xl px-5 pb-16 text-sm lg:px-8"><Link to="/services" className="font-semibold text-[#0504AA] underline-offset-4 hover:underline">Back to all services</Link></p>
      </section>
    </PublicDocument>
  )
}

export default ServicePage
