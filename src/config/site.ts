/** Single source of truth for brand + domain. Rename the brand here. */
export const SITE_NAME = 'Evermont Credit Union'
/** Short form for tight spaces such as logo text. */
export const SITE_SHORT_NAME = 'Evermont'
/** How the credit union is positioned. Not a claim of a banking charter. */
export const SITE_POSITIONING = 'Secured Private Wealth Bank'
export const SITE_TAGLINE = 'Where Private Wealth Is Protected.'
export const SITE_TAGLINE_SECOND = 'Built on Integrity. Guided by Excellence.'
export const SITE_URL = 'https://evermontcredit.online'
export const SUPPORT_EMAIL = 'support@evermontcredit.online'
export const INFO_EMAIL = 'info@evermontcredit.online'
export const LOGO_PATH = '/images/evermont-logo.jpeg'
export const OG_IMAGE = `${SITE_URL}/images/evermont-logo.jpeg`
export const DISCLAIMER = 'Prototype for demonstration. Not a chartered bank. Not FDIC or NCUA insured. No real money movement.'

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`

export interface PublicRoute { path: string; title: string; description: string }

/** Public, indexable routes. Used by the router, the prerenderer and the sitemap. */
export const PUBLIC_ROUTES: PublicRoute[] = [
  { path: '/', title: `${SITE_NAME} | ${SITE_TAGLINE}`, description: `${SITE_NAME} is a private-wealth and digital banking prototype: checking, savings, lending and planning education presented with clarity and care.` },
  { path: '/about', title: `About ${SITE_NAME}`, description: `Learn about ${SITE_NAME}, our approach to private wealth, and the principles behind this digital banking prototype.` },
  { path: '/contact', title: `Contact ${SITE_NAME}`, description: `Reach the ${SITE_NAME} team by email for general questions, member portal help, and feedback.` },
  { path: '/security', title: `Security at ${SITE_NAME}`, description: `How ${SITE_NAME} approaches account security, authentication, privacy and fraud awareness.` },
  { path: '/privacy', title: `Privacy Policy | ${SITE_NAME}`, description: `How ${SITE_NAME} collects, uses and protects information in this demonstration prototype.` },
  { path: '/terms', title: `Terms of Use | ${SITE_NAME}`, description: `Terms governing use of the ${SITE_NAME} website and member portal prototype.` },
  { path: '/disclosures', title: `Disclosures | ${SITE_NAME}`, description: `Important disclosures: ${SITE_NAME} is a prototype, not a chartered bank, and not FDIC or NCUA insured.` },
  { path: '/accessibility', title: `Accessibility | ${SITE_NAME}`, description: `${SITE_NAME}'s commitment to an accessible experience for every visitor.` },
  { path: '/loans', title: `Loans | ${SITE_NAME}`, description: `Explore personal loans, auto loans and credit card education from ${SITE_NAME}.` },
  { path: '/loans/personal', title: `Personal Loans | ${SITE_NAME}`, description: `Personal loan education: how personal lending works and what to prepare before applying.` },
  { path: '/loans/auto', title: `Auto Loans | ${SITE_NAME}`, description: `Auto loan education: budgeting, terms and what to gather before financing a vehicle.` },
  { path: '/credit-cards', title: `Credit Cards | ${SITE_NAME}`, description: `Credit card education: responsible use, statements, and how card benefits typically work.` },
  { path: '/retirement', title: `Retirement & 401(k) | ${SITE_NAME}`, description: `Retirement planning education, including 401(k) fundamentals and long-term saving habits.` },
  { path: '/services/checking', title: `Checking | ${SITE_NAME}`, description: 'Everyday checking education and secure digital access.' },
  { path: '/services/savings', title: `Savings | ${SITE_NAME}`, description: 'Goal-based savings education and member-first guidance.' },
  { path: '/services/loans', title: `Lending | ${SITE_NAME}`, description: 'A lending conversation built around you.' },
  { path: '/services/wealth', title: `Private Wealth | ${SITE_NAME}`, description: 'Long-term planning and wealth-preservation education.' },
  { path: '/services/investments', title: `Investments | ${SITE_NAME}`, description: 'Investment and retirement education for your next chapter.' },
  { path: '/services/digital-assets', title: `Digital Assets | ${SITE_NAME}`, description: 'Digital-asset education covering volatility, custody and risk.' },
]

export const routeMeta = (path: string) => PUBLIC_ROUTES.find(r => r.path === path)

/** Paths that must never be indexed. Mirrored in public/robots.txt and vercel.json. */
export const PRIVATE_PREFIXES = ['/login', '/sign-in', '/register', '/signup', '/forgot-password', '/reset-password', '/auth/callback', '/dashboard', '/accounts', '/activation', '/transactions', '/insights', '/profile', '/settings', '/support', '/admin']
