import { useLocation } from 'react-router-dom'
import { PublicDocument } from '@/components/PageBanner'
import { REGISTER_URL, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from '@/content/publicPages'

type Info = { eyebrow: string; title: string; lede: string; alt: string; sections: [string, string][]; action?: { href: string; label: string; external?: boolean } }

const pages: Record<string, Info> = {
  '/security': {
    eyebrow: 'Security and Privacy',
    title: 'Practices you can use. No promise of absolute safety.',
    lede: 'Evermont does not claim a security certification, and it does not promise that harm cannot happen. These are the habits this public site stands behind.',
    alt: 'Closed brass padlock on dark blue linen',
    action: { href: '/contact', label: 'Report a concern' },
    sections: [
      ['Account security practices', 'Use a unique password for the member portal. Do not reuse it in email. Sign out on a shared device.'],
      ['Privacy principles', 'This public site does not ask you to type a password. Do not send secrets to the support email.'],
      ['Data protection', 'Information you choose to send by email or phone should be limited to the question itself. Leave account numbers out.'],
      ['Secure login', 'Member Login on this site goes to the separate portal. Do not follow a login link from an unexpected message.'],
      ['Fraud awareness', 'Stop if someone asks for a one-time code, a password, or a recovery link. Evermont will not ask for those by email.'],
      ['Your part', 'Check the address bar before you sign in. If something feels wrong, do not continue.'],
      ['How to report it', `Call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}. Describe what you saw. Do not include the secret you were asked for.`],
    ],
  },
  '/privacy': {
    eyebrow: 'Privacy Policy',
    title: 'A plain commitment to careful handling.',
    lede: 'This is a general commitment for the public website. It is not a claim that a particular statute has been certified.',
    alt: 'Closed brass padlock on dark blue linen',
    sections: [
      ['What this covers', 'Information you choose to send from the public site, such as an email, a phone call, or the enquiry form that opens your mail app.'],
      ['What not to send', 'Passwords, one-time codes, full account numbers, and recovery links do not belong in ordinary email.'],
      ['The member portal', 'Sign-in and registration continue there. This website does not display balances.'],
      ['Questions', `Call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL} if you need a clarification.`],
    ],
  },
  '/terms': {
    eyebrow: 'Terms and Conditions',
    title: 'How to read this website.',
    lede: 'These terms explain the public site. They do not open an account, set a price, or state a license or insurance status.',
    alt: 'Quiet library reading room with oak tables',
    sections: [
      ['Using the pages', 'You may read them to understand how Evermont describes services and how to reach support or the member portal.'],
      ['What a page does not do', 'Viewing a page does not open an account, approve a request, or publish a rate.'],
      ['Descriptions', 'If a detail is not written down, do not assume it. Ask before you rely on it.'],
      ['Questions', `Questions about these terms can go to ${SUPPORT_PHONE_DISPLAY} or ${SUPPORT_EMAIL}.`],
    ],
  },
  '/accessibility': {
    eyebrow: 'Accessibility',
    title: 'A commitment to pages people can use.',
    lede: 'We aim for readable type, keyboard access, and layouts that work on a phone. This is not a claim that a formal audit has certified the site.',
    alt: 'Open blank notebook on a linen desk',
    sections: [
      ['What we design for', 'Real headings, labeled controls, a skip link, and a menu that closes with Escape.'],
      ['What we do not claim', 'We do not state that every barrier has already been removed.'],
      ['Report a barrier', `Contact support with the page address and what got in the way. Call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}.`],
    ],
  },
  '/disclosures': {
    eyebrow: 'Disclosures',
    title: 'What this website does not claim.',
    lede: 'Product descriptions are informational. They are not financial advice, an offer, or a statement of insurance, charter, or regulatory status.',
    alt: 'Quiet library reading room with oak tables',
    sections: [
      ['No invented numbers', 'Rates, yields, fees, customer counts, and years in operation are not stated as facts on these pages.'],
      ['No regulatory identity', 'Nothing here asserts a license, deposit insurance, or an affiliation with another institution.'],
      ['Confirm before you act', `Use the member portal for account steps, or ask ${SUPPORT_EMAIL} when a detail is missing.`],
    ],
  },
  '/open-account': {
    eyebrow: 'Open an account',
    title: 'Start in the member portal.',
    lede: 'This page explains the path. It does not collect an application or create a login.',
    alt: 'Writing desk with a blank envelope and a brass lamp',
    action: { href: REGISTER_URL, label: 'Continue to registration', external: true },
    sections: [
      ['What happens next', 'Continue to registration opens the member portal. You complete the process there.'],
      ['If you already have access', 'Use Member Login in the header instead of starting again.'],
      ['Questions first', `Call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}. Leave secrets out of the email.`],
    ],
  },
}

export const PublicInfoPage: React.FC = () => {
  const path = useLocation().pathname
  const content = pages[path] ?? pages['/disclosures']
  const docPath = pages[path] ? path : '/disclosures'
  return (
    <PublicDocument path={docPath} eyebrow={content.eyebrow} title={content.title} lede={content.lede} imageAlt={content.alt} actions={content.action ? [content.action] : undefined}>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:px-8">
          {content.sections.map(([heading, body]) => (
            <article key={heading} className="max-w-3xl">
              <h2 className="font-serif text-3xl text-[#101533]">{heading}</h2>
              <p className="mt-3 leading-8 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicDocument>
  )
}

export default PublicInfoPage
