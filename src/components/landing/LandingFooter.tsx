import React from 'react'
import Logo from '@/components/brand/Logo'

const footerColumns = [
  {
    title: 'Products',
    links: ['Evermont Checking', 'High-Yield Savings', 'Investments', '401(k) & Retirement', 'Crypto Accounts', 'Personal & Auto Loans', 'Home Loans'],
  },
  {
    title: 'Digital Banking',
    links: ['Mobile Deposit', 'Transfers & Payments', 'Bill Pay', 'Account Alerts', 'Card Controls', 'Statements & Documents'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact Us', 'Security Center', 'Privacy Policy', 'Terms of Use', 'Accessibility'],
  },
]

const LandingFooter: React.FC = () => (
  <footer className="bg-[#050440] text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Logo variant="dark" size="md" />
          <p className="mt-5 text-sm leading-relaxed text-gray-400 max-w-sm">
            Evermont Credit Union — member-focused digital banking for your everyday checking,
            savings, investing, lending and crypto needs.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-evermont-gold uppercase">
            Your money. Your community. Your future.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-default">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-white/10 space-y-3">
        <p className="text-xs leading-relaxed text-gray-500">
          <strong className="text-gray-400">Important disclosure:</strong> Evermont Credit Union is a
          demonstration project. It is not a licensed, chartered or regulated bank or credit union,
          holds no deposits, and does not originate real loans. All balances, rates, accounts and
          transactions shown in this application are <strong className="text-gray-400">DEMO /
          SIMULATED data</strong> and no real financial transactions are processed. Nothing on this
          site is an offer of financial services, a solicitation, or investment advice.
        </p>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Evermont Credit Union (demo). All rights reserved. APY and
          rate figures shown are illustrative examples only.
        </p>
      </div>
    </div>
  </footer>
)

export default LandingFooter
