import { Link } from 'react-router-dom'
import { Landmark, PiggyBank, CreditCard, CircleDollarSign, SunMedium, ShieldCheck, GraduationCap, WalletCards } from 'lucide-react'
import { PublicDocument, StatusPill } from '@/components/PageBanner'

const cards = [
  { icon: Landmark, title: 'Checking', description: 'Everyday account information. Fees are not published here.', status: 'Information available', href: '/checking' },
  { icon: PiggyBank, title: 'Savings', description: 'How savings is described, without a stated yield.', status: 'Information available', href: '/savings' },
  { icon: CreditCard, title: 'Credit card', description: 'A card relationship in plain language. No pricing is listed.', status: 'Information available', href: '/credit-card' },
  { icon: CircleDollarSign, title: 'Loans', description: 'A starting point for borrowing questions. No rates or approvals.', status: 'Information available', href: '/loans' },
  { icon: SunMedium, title: 'Retirement', description: 'Retirement questions without a claim that Evermont administers a plan.', status: 'Information available', href: '/retirement' },
  { icon: WalletCards, title: 'Private wealth', description: 'A thoughtful overview. Not regulated investment, advisory, or fiduciary service.', status: 'Information available', href: '/private-wealth' },
  { icon: ShieldCheck, title: 'Security', description: 'Sign-in habits, fraud awareness, and how to report a concern.', status: 'Available', href: '/security' },
  { icon: GraduationCap, title: 'Financial education', description: 'Articles on savings, budgeting, planning basics, and online security.', status: 'Available', href: '/resources' },
]

export const ServicesDirectoryPage: React.FC = () => (
  <PublicDocument path="/services" eyebrow="Services" title="A directory of what you can read, and what is not live." lede="Each card has a status. Planned or unavailable services are not presented as operating products." imageAlt="Conference table with a closed notebook, a glass of water, and a small gold object against a blue wall" actions={[{ href: '/contact', label: 'Contact Our Team' }]}>
    <section className="bg-[#F5F7FB]">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-20 md:grid-cols-2 lg:px-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.title} className="flex h-full flex-col rounded-3xl bg-white p-7">
              <Icon className="size-6 text-[#080A9F]" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-2xl text-[#07143D]">{card.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{card.description}</p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <StatusPill status={card.status} />
                <Link to={card.href} className="text-sm font-semibold text-[#080A9F] underline-offset-4 hover:underline">Learn More</Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  </PublicDocument>
)

export default ServicesDirectoryPage
