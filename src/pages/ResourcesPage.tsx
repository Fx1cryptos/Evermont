import { PublicDocument } from '@/components/PageBanner'

const articles = [
  { id: 'savings', title: 'Savings guidance', body: 'Decide what the money is for before you move it. This article does not name a yield. If a savings relationship is available to you, the terms belong in the member portal or in a reply from support, not in a headline.' },
  { id: 'budgeting', title: 'Budgeting', body: 'A simple budget lists money coming in, money that must go out, and what is left. Start with a month you can actually remember. The point is clarity, not a perfect spreadsheet.' },
  { id: 'planning', title: 'Planning basics', body: 'Planning starts with a time horizon and a question: what has to be true later? Write the question down. This page does not project returns or recommend a product.' },
  { id: 'online-security', title: 'Online security', body: 'Use the member portal link published on this site. Do not send a password, a one-time code, or a full account number by email. If a message asks for those, stop and call the published phone number.' },
]

const faqs = [
  ['How do I open an account?', 'Use Open an Account. Registration continues on the member portal. This website does not submit the application.'],
  ['How do I sign in?', 'Member Login opens the separate portal. Use the credentials you already have there.'],
  ['Does this site show rates?', 'No. Rates, fees, and approvals are not published here.'],
  ['How do I report something suspicious?', 'Call (302) 626-7525 or email support@evermontcredit.online. Do not include a password in that message.'],
]

export const ResourcesPage: React.FC = () => (
  <PublicDocument path="/resources" eyebrow="Resources" title="Financial education, written to be read." lede="Short articles on savings, budgeting, planning basics, and online security. Nothing here is a product recommendation." imageAlt="Open blank notebook and a ceramic cup on a linen desk in warm light" actions={[{ href: '/contact', label: 'Ask a question' }]}>
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <nav aria-label="Articles" className="flex flex-wrap gap-3 text-sm font-semibold text-[#080A9F]">
          {articles.map((article) => <a key={article.id} href={`#${article.id}`} className="rounded-full border border-[#080A9F]/20 px-4 py-2">{article.title}</a>)}
          <a href="#faq" className="rounded-full border border-[#080A9F]/20 px-4 py-2">FAQ</a>
        </nav>
        <div className="mt-12 grid gap-10">
          {articles.map((article) => (
            <article key={article.id} id={article.id} className="max-w-3xl scroll-mt-28">
              <h2 className="font-serif text-3xl text-[#07143D]">{article.title}</h2>
              <p className="mt-4 leading-8 text-slate-600">{article.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
    <section id="faq" className="scroll-mt-28 bg-[#F5F7FB]">
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h2 className="font-serif text-3xl text-[#07143D]">Questions</h2>
        <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="cursor-pointer list-none font-semibold text-[#07143D] [&::-webkit-details-marker]:hidden">{question}</summary>
              <p className="mt-3 leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  </PublicDocument>
)

export default ResourcesPage
