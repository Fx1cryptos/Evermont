import { Link, useLocation } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { OpenAccountLink, PublicChrome, SignInLink } from '@/components/PublicChrome'
import { publicPages, REGISTER_URL, SUPPORT_EMAIL } from '@/content/publicPages'

type Info = {
  title: string
  description: string
  eyebrow: string
  headline: string
  lede: string
  points: string[]
}

const pages: Record<string, Info> = {
  '/security': {
    title: publicPages.find((page) => page.path === '/security')!.title,
    description: publicPages.find((page) => page.path === '/security')!.description,
    eyebrow: 'Security',
    headline: 'Practices we can actually stand behind.',
    lede: 'Evermont sign-in happens on the separate member portal. This public website does not show balances, and it does not ask you to email a password.',
    points: [
      'Sign in only at the member portal linked from this site.',
      'Do not email passwords, one-time codes, full account numbers, or recovery links.',
      'If a message asks for those secrets, stop and write to the support address published here.',
      'This page does not claim a certification, an insurance program, or a guarantee.',
    ],
  },
  '/contact': {
    title: publicPages.find((page) => page.path === '/contact')!.title,
    description: publicPages.find((page) => page.path === '/contact')!.description,
    eyebrow: 'Contact',
    headline: 'Write to the address we already publish.',
    lede: 'For questions about services or next steps, email Evermont support. This page does not list a phone number or a street address.',
    points: [
      `Support email: ${SUPPORT_EMAIL}`,
      'Leave passwords, security codes, and full account numbers out of the message.',
      'Account opening and sign-in continue on the member portal.',
    ],
  },
  '/open-account': {
    title: publicPages.find((page) => page.path === '/open-account')!.title,
    description: publicPages.find((page) => page.path === '/open-account')!.description,
    eyebrow: 'Open an account',
    headline: 'Start in the member portal.',
    lede: 'This page explains the path. It does not collect an application, create a login, or submit your information. Registration continues on the Evermont member portal.',
    points: [
      'Choose Continue to registration to open the member portal registration page.',
      'If you already have access, use Sign In instead.',
      'Questions before you begin can go to support. Do not include secrets in that email.',
    ],
  },
  '/mission': {
    title: 'Mission | Evermont Credit Union',
    description: 'Evermont Credit Union is guided by integrity, clarity, and member service.',
    eyebrow: 'Mission',
    headline: 'Built on integrity. Guided by excellence.',
    lede: 'The public site exists to explain services plainly and to point you toward the member portal or support.',
    points: ['Say what is known.', 'Leave unpublished terms unpublished.', 'Give people a direct way to ask.'],
  },
  '/membership': {
    title: 'Membership | Evermont Credit Union',
    description: 'Explore Evermont membership by continuing to the member portal or contacting support.',
    eyebrow: 'Membership',
    headline: 'Membership continues in the portal.',
    lede: 'Eligibility is not decided on this page. Register or sign in through the member portal, or ask support before you apply.',
    points: ['Read the service pages first.', 'Use the member portal to register or sign in.', 'Confirm any requirement with support.'],
  },
  '/faq': {
    title: 'Questions | Evermont Credit Union',
    description: 'Short answers about Evermont account opening, sign-in, and support.',
    eyebrow: 'Questions',
    headline: 'Short answers.',
    lede: 'Open an account from the public Open an Account page. Sign in on the member portal. Email support without sending sensitive secrets.',
    points: ['Account opening is completed in the member portal.', 'Sign-in is on the member portal.', 'Support email is support@evermontcredit.online.'],
  },
  '/privacy': {
    title: 'Privacy | Evermont Credit Union',
    description: 'How to handle information when you contact Evermont from this public website.',
    eyebrow: 'Privacy',
    headline: 'Keep secrets out of ordinary email.',
    lede: 'Do not send passwords, security codes, or full account numbers through email. A full privacy notice for member accounts belongs with the member portal.',
    points: ['This public site does not ask for a password.', 'Support email is for questions, not secrets.', 'Sign in only on the member portal.'],
  },
  '/terms': {
    title: 'Terms | Evermont Credit Union',
    description: 'This Evermont website explains services and does not by itself open an account or promise a rate.',
    eyebrow: 'Terms',
    headline: 'What this website is.',
    lede: 'Reading a page does not open an account, approve a loan, or set a rate. Continue in the member portal or with support before you rely on a service.',
    points: ['No rate is promised here.', 'No insurance or license is claimed here.', 'Ask support if you need a current answer.'],
  },
  '/disclosures': {
    title: 'Disclosures | Evermont Credit Union',
    description: 'Evermont public pages do not publish rates, insurance, or regulatory approvals.',
    eyebrow: 'Disclosures',
    headline: 'What we do not claim.',
    lede: 'Product descriptions are informational. They are not financial advice, an offer, or a statement of insurance, charter, or regulatory status.',
    points: ['No invented rates or returns.', 'No unverified regulatory claims.', 'Confirm terms in the member portal or with support.'],
  },
  '/accessibility': {
    title: 'Accessibility | Evermont Credit Union',
    description: 'Evermont aims for readable pages, keyboard access, and a way to report barriers.',
    eyebrow: 'Accessibility',
    headline: 'Tell us if a page gets in the way.',
    lede: 'We aim for readable type, visible focus, keyboard access, and layouts that work on a phone. If a barrier remains, email support with the page address.',
    points: ['Pages use real headings and links.', 'Menus can be closed with Escape.', 'Report a barrier to support@evermontcredit.online.'],
  },
  '/fraud-prevention': {
    title: 'Fraud Prevention | Evermont Credit Union',
    description: 'Practical steps for protecting Evermont access without sharing secrets.',
    eyebrow: 'Fraud prevention',
    headline: 'Stop if someone asks for a secret.',
    lede: 'Evermont support will not ask you to email a password, a one-time code, or a recovery link. Use the member portal to sign in, and use the published support address if something looks wrong.',
    points: ['Ignore unexpected requests for codes.', 'Do not share a recovery link.', 'Contact support from the address on this website.'],
  },
}

const buttonClass = 'inline-flex items-center justify-center rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0807c8]'
const quietClass = 'inline-flex items-center justify-center rounded-full border border-[#0504AA]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA]'

export const PublicInfoPage: React.FC = () => {
  const path = useLocation().pathname
  const content = pages[path] ?? pages['/contact']
  const seo = publicPages.find((page) => page.path === path)

  return (
    <PublicChrome>
      <PageMeta title={seo?.title ?? content.title} description={seo?.description ?? content.description} path={path} />
      <main id="main">
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6E5610]">{content.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.08] text-[#101533] sm:text-6xl">{content.headline}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{content.lede}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {path === '/open-account' ? (
                <a href={REGISTER_URL} className={buttonClass}>Continue to registration</a>
              ) : path === '/contact' ? (
                <a href={`mailto:${SUPPORT_EMAIL}`} className={buttonClass}>Email {SUPPORT_EMAIL}</a>
              ) : (
                <OpenAccountLink className={buttonClass} />
              )}
              <SignInLink className={quietClass} />
            </div>
          </div>
        </section>
        <section className="bg-[#f8f7f4]">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 py-20 md:grid-cols-2 lg:px-8">
            {content.points.map((point) => (
              <article key={point} className="rounded-3xl bg-white p-7">
                <p className="leading-7 text-[#101533]">{point}</p>
              </article>
            ))}
          </div>
        </section>
        {path === '/security' && (
          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
              <Link to="/contact" className="text-sm font-semibold text-[#0504AA] underline-offset-4 hover:underline">Contact support about a security concern</Link>
            </div>
          </section>
        )}
      </main>
    </PublicChrome>
  )
}

export default PublicInfoPage
