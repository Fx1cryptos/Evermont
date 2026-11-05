export const SITE_NAME = 'Evermont Credit Union'
export const SITE_URL = 'https://evermontcredit.online'
export const SUPPORT_EMAIL = 'support@evermontcredit.online'
export const SUPPORT_PHONE_DISPLAY = '(302) 626-7525'
export const SUPPORT_PHONE_TEL = 'tel:+13026267525'
export const SUPPORT_PHONE_SCHEMA = '+1-302-626-7525'
export const LOGIN_URL = 'https://v0-evermont.vercel.app/login'
export const REGISTER_URL = 'https://v0-evermont.vercel.app/register'
export const LOGO_PATH = '/images/evermont-logo.jpeg'
export const MAILING_ADDRESS = ['Evermont Credit Union', 'PO Box 2147', 'South Burlington, VT 05407-2147'] as const

export const publicNav = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Personal Banking', href: '/personal-banking' },
  { label: 'Private Wealth', href: '/private-wealth' },
  { label: 'Services', href: '/services' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact Us', href: '/contact' },
] as const

export const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Personal Banking', href: '/personal-banking' },
  { label: 'Private Wealth', href: '/private-wealth' },
  { label: 'Services', href: '/services' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact Us', href: '/contact' },
] as const

export const serviceLinks = [
  { label: 'Checking', href: '/checking' },
  { label: 'Savings', href: '/savings' },
  { label: 'Credit Card', href: '/credit-card' },
  { label: 'Loans', href: '/loans' },
  { label: 'Retirement', href: '/retirement' },
  { label: 'Open an Account', href: '/open-account' },
  { label: 'Security', href: '/security' },
] as const

export const legalNav = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms and Conditions', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Disclosures', href: '/disclosures' },
] as const

export type PageSeo = {
  path: string
  title: string
  description: string
  image: string
  jsonLd?: boolean
}

export const publicPages: PageSeo[] = [
  { path: '/', title: 'Evermont Credit Union | Where Private Wealth Is Protected', description: 'Evermont Credit Union. Where private wealth is protected. Explore personal banking, private wealth information, and how to reach the team.', image: '/images/banners/facade.webp', jsonLd: true },
  { path: '/about', title: 'About Us | Evermont Credit Union', description: 'Evermont is a financial technology platform with private-wealth style service. Read the mission, values, and what the public site is.', image: '/images/banners/about-frame.webp', jsonLd: true },
  { path: '/personal-banking', title: 'Personal Banking | Evermont Credit Union', description: 'Personal banking categories at Evermont, with a clear note of what is available now and what is still planned.', image: '/images/banners/personal.webp' },
  { path: '/private-wealth', title: 'Private Wealth | Evermont Credit Union', description: 'Evermont Private Wealth: a legacy of trust and a future of prosperity. This page does not offer regulated investment, advisory, or fiduciary services.', image: '/images/banners/advisory.webp' },
  { path: '/services', title: 'Services | Evermont Credit Union', description: 'A directory of Evermont services, each with a short description, availability status, and a link to learn more.', image: '/images/banners/services.webp' },
  { path: '/resources', title: 'Resources | Evermont Credit Union', description: 'Financial education on savings, budgeting, planning basics, and online security, plus answers to common questions.', image: '/images/banners/resources.webp' },
  { path: '/contact', title: 'Contact Us | Evermont Credit Union', description: 'Contact Evermont Credit Union by phone, email, or mail. The enquiry form opens your email app. It does not send the message itself.', image: '/images/banners/contact.webp', jsonLd: true },
  { path: '/checking', title: 'Checking | Evermont Credit Union', description: 'Everyday checking information from Evermont. This page does not publish fees or minimums.', image: '/images/banners/personal.webp' },
  { path: '/savings', title: 'Savings | Evermont Credit Union', description: 'Savings information from Evermont. This page does not publish a yield or a promotional return.', image: '/images/banners/personal.webp' },
  { path: '/credit-card', title: 'Credit Card | Evermont Credit Union', description: 'How an Evermont credit card relationship is described. This page does not publish pricing or rewards.', image: '/images/banners/services.webp' },
  { path: '/loans', title: 'Loans | Evermont Credit Union', description: 'A clear starting point for Evermont lending questions. This page does not publish rates or approvals.', image: '/images/banners/services.webp' },
  { path: '/retirement', title: 'Retirement | Evermont Credit Union', description: 'Retirement information from Evermont. This page does not claim to sponsor or administer a retirement plan.', image: '/images/banners/wealth.webp' },
  { path: '/open-account', title: 'Open an Account | Evermont Credit Union', description: 'Open an Evermont account by continuing to member portal registration. This page does not submit an application.', image: '/images/banners/contact.webp' },
  { path: '/security', title: 'Security and Privacy | Evermont Credit Union', description: 'Account security, privacy habits, fraud awareness, and how to report a concern. Evermont does not promise absolute security.', image: '/images/banners/security.webp' },
  { path: '/privacy', title: 'Privacy Policy | Evermont Credit Union', description: 'How Evermont treats questions sent from this public website. Contact support for clarification.', image: '/images/banners/security.webp' },
  { path: '/terms', title: 'Terms and Conditions | Evermont Credit Union', description: 'Terms for using the Evermont public website. Reading a page does not open an account or set a rate.', image: '/images/banners/about.webp' },
  { path: '/accessibility', title: 'Accessibility | Evermont Credit Union', description: 'Evermont’s commitment to readable, keyboard-friendly public pages. Contact support if you find a barrier.', image: '/images/banners/resources.webp' },
  { path: '/disclosures', title: 'Disclosures | Evermont Credit Union', description: 'What the Evermont public website does not publish: rates, fees, or a claim of official status.', image: '/images/banners/about.webp' },
  { path: '/cryptocurrency', title: 'Digital Assets | Evermont Credit Union', description: 'A careful note on digital assets. Evermont does not describe buying, selling, or custody as available unless support confirms it.', image: '/images/banners/wealth.webp' },
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
  '/mission': '/about',
  '/membership': '/open-account',
  '/faq': '/resources',
  '/fraud-prevention': '/security',
}

export const pageByPath = (path: string) => publicPages.find((page) => page.path === path)
