import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { PageBanner } from '@/components/PageBanner'
import { PublicChrome } from '@/components/PublicChrome'
import { pageByPath } from '@/content/publicPages'

const seo = pageByPath('/')!

const services = [
  { href: '/checking', title: 'Checking', text: 'Everyday money, described plainly. Fees are not published here.', status: 'Information available' },
  { href: '/savings', title: 'Savings', text: 'A place to set money aside. No yield is stated on this site.', status: 'Information available' },
  { href: '/credit-card', title: 'Credit card', text: 'How a card relationship is described, without unpublished pricing.', status: 'Information available' },
  { href: '/loans', title: 'Loans', text: 'A conversation about borrowing. No rates or approvals are listed.', status: 'Information available' },
  { href: '/retirement', title: 'Retirement', text: 'Longer-term questions, without a claim that Evermont administers a plan.', status: 'Information available' },
  { href: '/private-wealth', title: 'Private wealth', text: 'A thoughtful approach to long-term goals. Not a regulated advisory offer.', status: 'Information available' },
]

export const HomePage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} image={seo.image} jsonLd />
    <main id="main">
      <PageBanner image={seo.image} alt="Stone colonnade in warm evening light under a deep blue sky" eyebrow="Evermont Credit Union" title="Where Private Wealth Is Protected." lede="Built on integrity. Guided by excellence. This public site explains the relationship. Account opening and sign-in continue in the member portal." actions={[{ href: '/services', label: 'Explore Our Services' }, { href: '/contact', label: 'Contact Our Team' }]} />
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E5610]">About</p>
            <h2 className="mt-3 font-serif text-4xl text-[#101533]">A more thoughtful approach.</h2>
            <p className="mt-4 leading-8 text-slate-600">Evermont Credit Union is built around financial responsibility, personal service, and clear communication. The full story, mission, and values are on the About page.</p>
            <Link to="/about" className="mt-6 inline-flex text-sm font-semibold text-[#0504AA] underline-offset-4 hover:underline">Read About Us</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {['Integrity', 'Excellence', 'Customer Commitment'].map((value) => (
              <article key={value} className="rounded-3xl border border-slate-200 p-6">
                <h3 className="font-serif text-2xl text-[#0504AA]">{value}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">A standard for how Evermont describes its work. No unpublished claims sit behind the word.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#f8f7f4]" aria-labelledby="services-heading">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <h2 id="services-heading" className="font-serif text-4xl text-[#101533]">Services</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">Each card opens a real page. None of them quote a rate, a customer count, or a testimonial.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((item) => (
              <Link key={item.href} to={item.href} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E5610]">{item.status}</p>
                <h3 className="mt-3 font-serif text-2xl text-[#101533]">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{item.text}</p>
                <span className="mt-6 text-sm font-semibold text-[#0504AA]">Learn more</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#0504AA] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl">Security is a practice, not a promise of perfection.</h2>
            <p className="mt-4 leading-7 text-blue-100">Sign in only on the member portal. Do not email a password or a full account number. Evermont does not claim a security certification.</p>
          </div>
          <Link to="/security" className="inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA]">Read security practices</Link>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-3xl text-[#101533]">Talk with the team.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">Phone, email, and the mailing address are on the contact page. There is no stated response time.</p>
          </div>
          <Link to="/contact" className="inline-flex rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white">Contact Evermont</Link>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default HomePage
