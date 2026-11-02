import { DISCLAIMER, INFO_EMAIL, SITE_NAME, SUPPORT_EMAIL } from '@/config/site'

export interface Section { heading: string; body?: string; bullets?: string[] }
export interface PageContent { eyebrow: string; heading: string; intro: string; sections: Section[]; related?: [string, string][]; cta?: boolean }

const n = SITE_NAME

export const PAGES: Record<string, PageContent> = {
  '/about': {
    eyebrow: `About ${n}`, heading: 'Private wealth, thoughtfully protected.',
    intro: `${n} is a digital banking and private-wealth experience designed around discretion, clarity and long-term relationships. This website and member portal are a working prototype that demonstrates how that experience could feel.`,
    sections: [
      { heading: 'Our approach', body: 'We believe financial services should be calm, transparent and personal. Every screen is designed to explain before it asks, and to put your goals at the centre of the conversation.' },
      { heading: 'What we stand for', bullets: ['Discretion and respect for your privacy', 'Plain-language explanations, no hidden surprises', 'Security designed into every interaction', 'Education first: we explain products rather than pressure you into them'] },
      { heading: 'A prototype, stated plainly', body: `${DISCLAIMER} Product descriptions on this site are educational and illustrate a future service.` },
    ],
    related: [['Security', '/security'], ['Private Wealth', '/services/wealth'], ['Contact', '/contact']], cta: true,
  },
  '/contact': {
    eyebrow: 'Contact', heading: 'We are here to help.',
    intro: 'Questions about the website, the member portal, or feedback on the prototype? Reach our team by email and we will respond as soon as we can.',
    sections: [
      { heading: 'Member portal support', body: `Email ${SUPPORT_EMAIL}. Signed-in members can also open a secure message from Help & Support inside the portal.` },
      { heading: 'General enquiries', body: `Email ${INFO_EMAIL} for partnership, press or general questions.` },
      { heading: 'Protect yourself', bullets: [`${n} will never ask for your password or one-time codes by email, text or phone.`, 'Only sign in at the official domain shown in your browser address bar.', 'If something looks suspicious, stop and contact us directly.'] },
    ],
    related: [['Security', '/security'], ['Accessibility', '/accessibility']],
  },
  '/security': {
    eyebrow: 'Security', heading: 'Your security is our standard.',
    intro: `Security is designed into ${n} from the first sign-in. Here is how the prototype protects access and what you can do to stay safe.`,
    sections: [
      { heading: 'How we protect access', bullets: ['Encrypted connections (HTTPS) across the site and portal', 'Authenticated sessions with automatic expiry', 'Account activation checks before sensitive features are enabled', 'Row-level data access controls so members only see their own records'] },
      { heading: 'Fraud awareness', bullets: ['We never request passwords, PINs or one-time codes', 'Be wary of urgent requests to move money or share information', 'Check that links point to our official domain before signing in'] },
      { heading: 'Report a concern', body: `If you believe your sign-in details have been exposed, reset your password immediately and email ${SUPPORT_EMAIL}.` },
    ],
    related: [['Privacy', '/privacy'], ['Contact', '/contact']],
  },
  '/privacy': {
    eyebrow: 'Legal', heading: 'Privacy Policy',
    intro: `This policy explains how the ${n} prototype handles information. Because this is a demonstration, please do not submit sensitive personal or financial information.`,
    sections: [
      { heading: 'Information we collect', bullets: ['Account details you provide when registering (such as name and email)', 'Messages you send through the support centre', 'Basic usage analytics that help us improve the site'] },
      { heading: 'How we use it', bullets: ['To provide sign-in and portal features', 'To respond to support requests', 'To understand and improve the experience'] },
      { heading: 'Sharing', body: 'We do not sell personal information. Service providers that host the site, authentication and analytics process data on our behalf.' },
      { heading: 'Your choices', body: `You may request access to or deletion of your information by emailing ${SUPPORT_EMAIL}.` },
    ],
    related: [['Terms', '/terms'], ['Disclosures', '/disclosures']],
  },
  '/terms': {
    eyebrow: 'Legal', heading: 'Terms of Use',
    intro: `By using the ${n} website or member portal you agree to these terms.`,
    sections: [
      { heading: 'Prototype service', body: `${DISCLAIMER} Nothing on this site is an offer of credit, deposit, investment or any regulated financial product.` },
      { heading: 'Acceptable use', bullets: ['Use the portal only for lawful, personal purposes', 'Do not attempt to access accounts or data that are not yours', 'Do not submit real sensitive financial information'] },
      { heading: 'No advice', body: 'Content is general education only and is not financial, legal, tax or investment advice.' },
      { heading: 'Changes', body: 'We may update these terms as the prototype evolves. Continued use means you accept the current version.' },
    ],
    related: [['Privacy', '/privacy'], ['Disclosures', '/disclosures']],
  },
  '/disclosures': {
    eyebrow: 'Legal', heading: 'Important Disclosures',
    intro: 'Please read these disclosures carefully.',
    sections: [
      { heading: 'Not a bank', body: `${n} is a demonstration prototype. It is not a bank, credit union, broker-dealer or investment adviser and holds no banking charter.` },
      { heading: 'No deposit insurance', body: 'Nothing on this site is FDIC or NCUA insured. No deposits are accepted.' },
      { heading: 'No real money movement', body: 'Balances or activity shown in the portal come only from records in the prototype database. No funds are transferred, held or lent.' },
      { heading: 'Educational content', body: 'Product pages describe how financial products commonly work. They do not quote rates, terms or eligibility.' },
    ],
    related: [['Terms', '/terms'], ['Privacy', '/privacy']],
  },
  '/accessibility': {
    eyebrow: 'Accessibility', heading: 'Built for everyone.',
    intro: `${n} aims to meet WCAG 2.1 AA guidelines so that every visitor can use the site and portal comfortably.`,
    sections: [
      { heading: 'What we do', bullets: ['Semantic headings and landmarks for screen readers', 'Keyboard-accessible navigation and forms', 'Colour contrast designed around our Royal Blue and Gold palette', 'Descriptive text alternatives for meaningful images'] },
      { heading: 'Feedback', body: `If any part of the experience is difficult to use, email ${SUPPORT_EMAIL} and tell us how we can improve.` },
    ],
    related: [['Contact', '/contact']],
  },
  '/loans': {
    eyebrow: 'Borrow with clarity', heading: 'Lending, explained before you apply.',
    intro: 'Explore how common lending products work, what to prepare, and the questions worth asking before you borrow.',
    sections: [
      { heading: 'Personal loans', body: 'Fixed-amount borrowing for planned expenses, repaid over a set term.' },
      { heading: 'Auto loans', body: 'Vehicle financing where the vehicle typically secures the loan.' },
      { heading: 'Credit cards', body: 'Revolving credit for everyday spending, best used with a plan to pay in full.' },
      { heading: 'Before you borrow', bullets: ['Know your budget and monthly capacity', 'Compare total cost, not just the monthly payment', 'Understand fees, term length and what happens if a payment is late'] },
    ],
    related: [['Personal Loans', '/loans/personal'], ['Auto Loans', '/loans/auto'], ['Credit Cards', '/credit-cards']], cta: true,
  },
  '/loans/personal': {
    eyebrow: 'Personal loans', heading: 'Make room for what matters most.',
    intro: 'A personal loan provides a lump sum repaid in fixed instalments. Here is what to understand before considering one.',
    sections: [
      { heading: 'Common uses', bullets: ['Consolidating higher-cost balances', 'Home improvements', 'Major planned purchases or life events'] },
      { heading: 'What lenders usually review', bullets: ['Income and employment', 'Credit history', 'Existing debt obligations'] },
      { heading: 'Availability', body: `Applications are not available in this prototype. ${n} does not offer or quote loan rates.` },
    ],
    related: [['Loans overview', '/loans'], ['Auto Loans', '/loans/auto']], cta: true,
  },
  '/loans/auto': {
    eyebrow: 'Auto loans', heading: 'Get moving with a confident plan.',
    intro: 'Auto financing spreads the cost of a vehicle over time. Planning ahead helps you negotiate with confidence.',
    sections: [
      { heading: 'Plan your purchase', bullets: ['Set a total budget including insurance and maintenance', 'Consider the down payment and loan term together', 'Shorter terms usually mean less total interest'] },
      { heading: 'Documents to gather', bullets: ['Proof of identity and income', 'Vehicle details or purchase agreement', 'Insurance information'] },
      { heading: 'Availability', body: `Applications are not available in this prototype. ${n} does not offer or quote loan rates.` },
    ],
    related: [['Loans overview', '/loans'], ['Personal Loans', '/loans/personal']], cta: true,
  },
  '/credit-cards': {
    eyebrow: 'Credit cards', heading: 'Flexible spending, used wisely.',
    intro: 'A credit card is a revolving line of credit. Used thoughtfully, it can simplify spending and build credit history.',
    sections: [
      { heading: 'Good habits', bullets: ['Pay the full statement balance when possible', 'Keep utilisation comfortably below your limit', 'Review statements and alerts regularly'] },
      { heading: 'Understanding terms', bullets: ['Annual percentage rate (APR) and grace periods', 'Annual, foreign transaction and late fees', 'How rewards programmes are earned and redeemed'] },
      { heading: 'Availability', body: `${n} does not issue credit cards in this prototype.` },
    ],
    related: [['Loans overview', '/loans'], ['Security', '/security']], cta: true,
  },
  '/retirement': {
    eyebrow: 'Retirement & 401(k)', heading: 'Invest in the future you are building.',
    intro: 'Retirement planning is a long game. These fundamentals help you ask better questions of a qualified adviser.',
    sections: [
      { heading: '401(k) fundamentals', bullets: ['Employer-sponsored plans may include matching contributions', 'Contributions can be pre-tax or Roth, depending on the plan', 'Annual contribution limits are set by the IRS'] },
      { heading: 'Long-term habits', bullets: ['Start early and contribute consistently', 'Diversify according to your time horizon', 'Revisit your plan at major life events'] },
      { heading: 'Important', body: 'This is general education, not investment advice. Consult a licensed professional for guidance on your situation.' },
    ],
    related: [['Investments', '/services/investments'], ['Private Wealth', '/services/wealth']], cta: true,
  },
}
