import { Link, useLocation } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { OpenAccountLink, PublicChrome, SignInLink } from '@/components/PublicChrome'
import { publicPages, REGISTER_URL, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '@/content/publicPages'

type Info = {
  title: string
  description: string
  eyebrow: string
  headline: string
  lede: string
  points: string[]
  sections?: { heading: string; body: string }[]
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
    headline: 'Call or write using the details we publish.',
    lede: 'For questions about services or next steps, use the phone number or the support email below. This page does not list a street address.',
    points: [
      `Phone: ${SUPPORT_PHONE_DISPLAY}`,
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
    title: publicPages.find((page) => page.path === '/privacy')!.title,
    description: publicPages.find((page) => page.path === '/privacy')!.description,
    eyebrow: 'Privacy Policy',
    headline: 'A plain commitment to careful handling.',
    lede: 'This page describes the public website. It is a general commitment, not a claim of a particular statute, certification, or regulatory status.',
    points: [],
    sections: [
      { heading: 'What this page covers', body: 'It covers information you choose to send from the public site, such as an email or a phone call to the published support contacts. Member-account notices, if any, belong with the member portal.' },
      { heading: 'What we ask you not to send', body: 'Do not email or text passwords, one-time codes, full account numbers, or recovery links. The public pages do not include a form that collects those secrets.' },
      { heading: 'How the public site is used', body: 'The pages explain services and link to the member portal for registration and sign-in. This site does not display balances.' },
      { heading: 'Questions', body: `If you have a question about this commitment, call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}.` },
    ],
  },
  '/terms': {
    title: publicPages.find((page) => page.path === '/terms')!.title,
    description: publicPages.find((page) => page.path === '/terms')!.description,
    eyebrow: 'Terms of Service',
    headline: 'How to read this website.',
    lede: 'These terms explain the public site in ordinary language. They do not create an account, set a price, or state a license or insurance status.',
    points: [],
    sections: [
      { heading: 'Using the pages', body: 'You may read the public pages to understand how Evermont describes its services and how to reach support or the member portal.' },
      { heading: 'What a page does not do', body: 'Viewing a page does not open an account, approve a request, or publish a rate or fee. Those steps, when available, continue in the member portal or in a direct reply from support.' },
      { heading: 'Service descriptions', body: 'Descriptions are general. If a detail is not written on the page, do not assume it. Ask before you rely on it.' },
      { heading: 'Questions', body: `Questions about these terms can go to ${SUPPORT_PHONE_DISPLAY} or ${SUPPORT_EMAIL}.` },
    ],
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
    title: publicPages.find((page) => page.path === '/accessibility')!.title,
    description: publicPages.find((page) => page.path === '/accessibility')!.description,
    eyebrow: 'Accessibility',
    headline: 'A commitment to pages people can use.',
    lede: 'We aim for public pages that can be read, reached by keyboard, and used on a phone. This is a commitment, not a claim that an audit or a legal standard has been certified.',
    points: [],
    sections: [
      { heading: 'What we design for', body: 'Visible text, real headings, labeled controls, a skip link, and a menu that can be closed with Escape. Layouts are checked on a narrow phone width and on a desktop screen.' },
      { heading: 'What we do not claim', body: 'This page does not state that the site has passed a formal accessibility audit or that every barrier has already been removed.' },
      { heading: 'Report a barrier', body: `If a page blocks you, contact support with the page address and what got in the way. Call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}.` },
    ],
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
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {path === '/open-account' ? (
                <a href={REGISTER_URL} className={buttonClass}>Continue to registration</a>
              ) : path === '/contact' ? (
                <>
                  <a href={SUPPORT_PHONE_TEL} className={buttonClass}>Call {SUPPORT_PHONE_DISPLAY}</a>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className={quietClass}>Email {SUPPORT_EMAIL}</a>
                </>
              ) : (
                <OpenAccountLink className={buttonClass} />
              )}
              {path !== '/contact' && <SignInLink className={quietClass} />}
            </div>
          </div>
        </section>
        {content.sections && content.sections.length > 0 && (
          <section className="bg-white">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:px-8">
              {content.sections.map((section) => (
                <article key={section.heading} className="max-w-3xl">
                  <h2 className="font-serif text-3xl text-[#101533]">{section.heading}</h2>
                  <p className="mt-4 leading-8 text-slate-600">{section.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {content.points.length > 0 && (
          <section className="bg-[#f8f7f4]">
            <div className="mx-auto grid max-w-6xl gap-5 px-5 py-20 md:grid-cols-2 lg:px-8">
              {content.points.map((point) => (
                <article key={point} className="rounded-3xl bg-white p-7">
                  {path === '/contact' && point.startsWith('Phone:') ? (
                    <p className="leading-7 text-[#101533]">Phone: <a className="font-semibold text-[#0504AA] underline-offset-4 hover:underline" href={SUPPORT_PHONE_TEL}>{SUPPORT_PHONE_DISPLAY}</a></p>
                  ) : path === '/contact' && point.startsWith('Support email:') ? (
                    <p className="leading-7 text-[#101533]">Support email: <a className="font-semibold text-[#0504AA] underline-offset-4 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
                  ) : (
                    <p className="leading-7 text-[#101533]">{point}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
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
