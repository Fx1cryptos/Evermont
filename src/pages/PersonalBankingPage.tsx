import { Link } from 'react-router-dom'
import { PublicDocument, StatusPill } from '@/components/PageBanner'

const categories = [
  { title: 'Everyday banking', status: 'Information available', text: 'Checking is described on its own page. This website does not publish fees.', href: '/checking' },
  { title: 'Savings information', status: 'Information available', text: 'Savings is described without a yield or a promotional return.', href: '/savings' },
  { title: 'Payment services', status: 'Planned', text: 'Bill pay, wires, and similar payment tools are not offered as live services on this public website.', href: '/services' },
  { title: 'Account access', status: 'Available through the member portal', text: 'Sign-in is on the separate member portal. This site does not show balances.', href: '/open-account' },
  { title: 'Digital banking support', status: 'Information available', text: 'Questions about access can go to support. Online security habits are in Resources.', href: '/resources' },
  { title: 'Financial education', status: 'Available', text: 'Short articles on savings, budgeting, planning basics, and online security.', href: '/resources' },
]

export const PersonalBankingPage: React.FC = () => (
  <PublicDocument path="/personal-banking" eyebrow="Personal Banking" title="Personal financial services, labeled honestly." lede="These categories explain what you can read now and what is still planned. A planned item is not an active product." imageAlt="Empty marble hall with blue glass and restrained gold details" actions={[{ href: '/services', label: 'View the directory' }, { href: '/contact', label: 'Contact Our Team' }]}>
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-20 md:grid-cols-2 lg:px-8">
        {categories.map((item) => (
          <article key={item.title} className="rounded-3xl border border-slate-200 p-7">
            <StatusPill status={item.status} />
            <h2 className="mt-4 font-serif text-2xl text-[#101533]">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            <Link to={item.href} className="mt-5 inline-flex text-sm font-semibold text-[#0504AA] underline-offset-4 hover:underline">Learn more</Link>
          </article>
        ))}
      </div>
    </section>
  </PublicDocument>
)

export default PersonalBankingPage
