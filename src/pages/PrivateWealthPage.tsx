import { PublicDocument } from '@/components/PageBanner'

const sections = [
  ['Wealth-service overview', 'Evermont describes a private-wealth relationship as personal, discreet, and paced. This page is an introduction. It is not an offer of a managed portfolio.'],
  ['Financial planning information', 'Planning here means organizing questions about goals, timing, and what information you may want to gather. It is not regulated investment advice.'],
  ['Long-term financial goals', 'A longer horizon can include saving, retirement questions, and how everyday accounts fit beside them. Specific products are confirmed elsewhere, not assumed here.'],
  ['A personal service approach', 'A conversation with support is the way to ask what is currently available. The public site does not assign an advisor or open an advisory account.'],
  ['Privacy and confidentiality', 'Do not email passwords or full account numbers. Sign in only on the member portal. This page does not claim a privacy certification.'],
]

export const PrivateWealthPage: React.FC = () => (
  <PublicDocument path="/private-wealth" eyebrow="Private Wealth" title="A private-wealth conversation, not a regulated advisory offer." lede="Evermont does not provide regulated investment advice, brokerage, fiduciary, or wealth-management services on this website." imageAlt="Evening skyline across calm water in blue and gold light" actions={[{ href: '/contact', label: 'Request a conversation' }, { href: '/services', label: 'Explore Our Services' }]}>
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 lg:px-8">
        {sections.map(([title, body]) => (
          <article key={title} className="max-w-3xl border-t border-slate-200 pt-8 first:border-0 first:pt-0">
            <h2 className="font-serif text-3xl text-[#101533]">{title}</h2>
            <p className="mt-4 leading-8 text-slate-600">{body}</p>
          </article>
        ))}
      </div>
    </section>
  </PublicDocument>
)

export default PrivateWealthPage
