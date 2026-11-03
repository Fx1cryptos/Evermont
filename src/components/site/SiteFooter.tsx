import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { DISCLAIMER, LOGO_PATH, SITE_NAME, SUPPORT_EMAIL } from '@/config/site'

const columns = [
  { heading: 'Banking', links: [['Checking', '/services/checking'], ['Savings', '/services/savings'], ['Credit Cards', '/credit-cards'], ['Digital Assets', '/services/digital-assets']] },
  { heading: 'Borrow & Plan', links: [['Loans', '/loans'], ['Personal Loans', '/loans/personal'], ['Auto Loans', '/loans/auto'], ['Retirement & 401(k)', '/retirement'], ['Private Wealth', '/services/wealth'], ['Investments', '/services/investments']] },
  { heading: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Security', '/security'], ['Member Sign In', '/login']] },
  { heading: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Disclosures', '/disclosures'], ['Accessibility', '/accessibility']] },
]

export const SiteFooter: React.FC = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="grid gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div>
          <img src={LOGO_PATH} alt={`${SITE_NAME} logo`} width={48} height={48} className="h-12 w-12 rounded-xl object-contain" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">Private wealth, thoughtfully protected.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block text-sm font-semibold text-[#0504AA] hover:underline">{SUPPORT_EMAIL}</a>
        </div>
        {columns.map(col => (
          <div key={col.heading}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C9A227]">{col.heading}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              {col.links.map(([label, to]) => <li key={to}><Link to={to} className="hover:text-[#0504AA]">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        <p className="flex items-center gap-2 font-semibold text-[#101533]"><ShieldCheck className="size-4 text-[#C9A227]" aria-hidden="true" />{DISCLAIMER}</p>
      </div>
    </div>
  </footer>
)
