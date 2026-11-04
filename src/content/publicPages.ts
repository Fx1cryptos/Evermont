export const SITE_NAME = 'Evermont Credit Union'
export const SITE_URL = 'https://evermontcredit.online'
export const SUPPORT_EMAIL = 'support@evermontcredit.online'
export const LOGIN_URL = 'https://v0-evermont.vercel.app/login'
export const REGISTER_URL = 'https://v0-evermont.vercel.app/register'
export const LOGO_PATH = '/images/evermont-logo.jpeg'

export const publicNav = [
  { label: 'Checking', href: '/checking' },
  { label: 'Savings', href: '/savings' },
  { label: 'Credit Card', href: '/credit-card' },
  { label: 'Loans', href: '/loans' },
  { label: 'Retirement', href: '/retirement' },
  { label: 'About', href: '/about' },
  { label: 'Security', href: '/security' },
  { label: 'Contact', href: '/contact' },
] as const

export const footerNav = [
  ...publicNav,
  { label: 'Open an Account', href: '/open-account' },
] as const

export type PageSeo = {
  path: string
  title: string
  description: string
  jsonLd?: boolean
}

export const publicPages: PageSeo[] = [
  {
    path: '/',
    title: 'Evermont Credit Union | Where Private Wealth Is Protected',
    description: 'Evermont Credit Union. Where private wealth is protected. Explore checking, savings, cards, loans, and retirement, then continue in the member portal.',
    jsonLd: true,
  },
  {
    path: '/about',
    title: 'About Evermont Credit Union | Integrity and Member Service',
    description: 'Evermont Credit Union is guided by integrity, excellence, and member service. Learn how we describe our work and how to reach the team.',
    jsonLd: true,
  },
  {
    path: '/checking',
    title: 'Checking | Evermont Credit Union',
    description: 'Learn how Evermont checking fits everyday money management. Continue in the member portal. This page does not publish rates or fees.',
  },
  {
    path: '/savings',
    title: 'Savings | Evermont Credit Union',
    description: 'See how Evermont savings can help you set money aside. Any terms are confirmed in the member portal, not on this page.',
  },
  {
    path: '/credit-card',
    title: 'Credit Card | Evermont Credit Union',
    description: 'Read how an Evermont credit card relationship is described. This page does not publish rewards, rates, or fees.',
  },
  {
    path: '/loans',
    title: 'Loans | Evermont Credit Union',
    description: 'Start a clear conversation about Evermont lending. This page does not publish rates, approvals, or loan terms.',
  },
  {
    path: '/retirement',
    title: 'Retirement | Evermont Credit Union',
    description: 'Explore Evermont retirement information. This page does not claim to sponsor or administer a retirement plan.',
  },
  {
    path: '/security',
    title: 'Security | Evermont Credit Union',
    description: 'Protect your Evermont access. Sign in through the member portal, and do not email passwords or full account numbers.',
  },
  {
    path: '/contact',
    title: 'Contact | Evermont Credit Union',
    description: 'Contact Evermont Credit Union at support@evermontcredit.online. Do not send passwords or full account numbers by email.',
  },
  {
    path: '/open-account',
    title: 'Open an Account | Evermont Credit Union',
    description: 'Open an Evermont account by continuing to member portal registration. This page does not submit an application.',
  },
]

export const prerenderPaths = publicPages.map((page) => page.path)

export const canonicalUrl = (path: string) => {
  if (path === '/' || path === '') return `${SITE_URL}/`
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean.replace(/\/$/, '')}`
}

export const legacyRedirects: Record<string, string> = {
  '/open-checking': '/checking',
  '/banking/private-checking': '/checking',
  '/banking/private-savings': '/savings',
  '/banking/credit-card': '/credit-card',
  '/banking/retirement-401k': '/retirement',
  '/loans/personal': '/loans',
  '/loans/auto': '/loans',
  '/banking/digital-asset-lending': '/loans',
}
