import { PageMeta } from '@/components/PageMeta'
import { PublicChrome } from '@/components/PublicChrome'
import { LOGO_PATH, pageByPath } from '@/content/publicPages'

const sections = [
  ['Wealth-service overview', 'Evermont describes a private-wealth relationship as personal, discreet, and paced. This page is an introduction. It is not an offer of a managed portfolio.'],
  ['Financial planning information', 'Planning here means organizing questions about goals, timing, and what information you may want to gather. It is not regulated investment advice.'],
  ['Long-term financial goals', 'A longer horizon can include saving, retirement questions, and how everyday accounts fit beside them. Specific products are confirmed elsewhere, not assumed here.'],
  ['A personal service approach', 'A conversation with support is the way to ask what is currently available. The public site does not assign an advisor or open an advisory account.'],
  ['Privacy and confidentiality', 'Do not email passwords or full account numbers. Sign in only on the member portal. This page does not claim a privacy certification.'],
]

const seo = pageByPath('/private-wealth')!

export const PrivateWealthPage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} image={seo.image} />
    <main id="main">
      <section className="grid min-h-[28rem] lg:grid-cols-2">
        <div className="flex items-center justify-center bg-[#080A9F] px-8 py-16">
          <img src={LOGO_PATH} alt="Evermont Credit Union" className="h-36 w-auto object-contain sm:h-44" />
        </div>
        <div className="relative flex min-h-80 items-end">
          <img src={seo.image} alt="Dark navy wood-panelled advisory room" className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative bg-gradient-to-t from-[#050418]/85 to-transparent p-8 sm:p-12">
            <h1 className="font-serif text-3xl leading-tight text-white sm:text-4xl">Evermont Private Wealth: A Legacy of Trust, A Future of Prosperity</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50">This is a brand statement. Evermont does not provide regulated investment advice, brokerage, fiduciary, or wealth-management services on this website.</p>
          </div>
        </div>
      </section>
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 lg:px-8">
        {sections.map(([title, body]) => (
          <article key={title} className="max-w-3xl border-t border-slate-200 pt-8 first:border-0 first:pt-0">
            <h2 className="font-serif text-3xl text-[#07143D]">{title}</h2>
            <p className="mt-4 leading-8 text-slate-600">{body}</p>
          </article>
        ))}
      </div>
    </section>
    </main>
  </PublicChrome>
)

export default PrivateWealthPage
