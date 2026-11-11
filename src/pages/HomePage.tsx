import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronRight, LockKeyhole, MessageCircle, Smartphone } from 'lucide-react'
import { PageMeta } from '@/components/PageMeta'
import { PublicChrome, SignInLink } from '@/components/PublicChrome'
import { pageByPath } from '@/content/publicPages'

const seo = pageByPath('/')!

const offerings = [
  { number: '01', title: 'Personal banking', text: 'Explore everyday banking categories and learn how to continue through the member portal.', href: '/personal-banking', image: '/images/banners/personal.webp', imageAlt: 'Warm modern interior with refined stone and oak finishes' },
  { number: '02', title: 'Private wealth', text: 'A thoughtful starting point for conversations about financial priorities and long-term goals.', href: '/private-wealth', image: '/images/banners/wealth.webp', imageAlt: 'Refined architecture in soft natural light' },
  { number: '03', title: 'Digital access', text: 'Sign in to the separate member portal to continue to account-related services.', href: '/open-account', image: '/images/banners/phone.webp', imageAlt: 'Mobile phone displaying a digital financial experience' },
]

const principles = [
  { title: 'Clarity comes first', text: 'Find straightforward descriptions of the services and next steps available on this site.' },
  { title: 'Your access, considered', text: 'The public website and member portal remain separate, so sign-in always continues to the portal.' },
  { title: 'Security is a shared practice', text: 'Use trusted links, protect your sign-in details, and contact support if something feels wrong.' },
]

const faqs = [
  { question: 'How do I access my account?', answer: 'Choose Member Login to continue to the separate Evermont member portal. This public website does not display account balances.' },
  { question: 'Can I open an account from this site?', answer: 'Choose Get Started to continue to the member portal registration page. This site does not submit an application.' },
  { question: 'Does Evermont publish rates or guarantee returns here?', answer: 'No rates, fees, deposit-insurance claims, regulatory approvals, or guaranteed returns are stated on this site.' },
]

export const HomePage: React.FC = () => (
  <PublicChrome>
    <PageMeta title={seo.title} description={seo.description} path={seo.path} image={seo.image} jsonLd />
    <main id="main">
      <section className="relative isolate min-h-[640px] overflow-hidden bg-[#07143D] text-white lg:min-h-[690px]">
        <img src="/images/banners/home.webp" alt="Illuminated classical columns against an evening sky" className="absolute inset-0 -z-20 size-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07143D]/95 via-[#07143D]/80 to-[#07143D]/30" />
        <div className="mx-auto flex min-h-[640px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:min-h-[690px] lg:px-12">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#E4C86F]"><span className="h-px w-9 bg-[#C8A43D]" /> EVERMONT CREDIT UNION</p>
            <h1 className="mt-7 max-w-3xl font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Build your future with <span className="text-[#E4C86F]">financial confidence.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">Discover a more thoughtful approach to banking, wealth management and financial security with EVERMONT Credit Union.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/services" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C8A43D] px-7 py-3.5 text-sm font-bold text-[#07143D] transition hover:bg-[#E4C86F]">Explore our services <ArrowRight className="size-4" /></Link>
              <SignInLink className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10" />
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-white/20 pt-5 text-xs font-medium tracking-wide text-white/70"><LockKeyhole className="size-4 text-[#E4C86F]" /> Account access continues through our separate member portal.</div>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 hidden items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70 lg:flex">Scroll to discover <ArrowDownRight className="size-4 text-[#E4C86F]" /></div>
      </section>

      <section className="bg-white" aria-labelledby="intro-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1fr] lg:gap-20 lg:px-12 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9A7620]">An Evermont perspective</p>
            <h2 id="intro-heading" className="mt-4 font-serif text-4xl leading-tight text-[#07143D] sm:text-5xl">A more considered way forward.</h2>
          </div>
          <div className="max-w-2xl">
            <p className="text-lg leading-8 text-slate-600">We believe financial experiences should feel clear, thoughtful and personal. Evermont brings information and digital access together, while keeping the public website distinct from the member portal.</p>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#080A9F] hover:underline">Get to know Evermont <ArrowUpRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F7FB]" aria-labelledby="offerings-heading">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9A7620]">Explore Evermont</p><h2 id="offerings-heading" className="mt-3 font-serif text-4xl text-[#07143D] sm:text-5xl">Services, with perspective.</h2></div>
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-[#080A9F]">View all services <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {offerings.map((item) => (
              <Link key={item.number} to={item.href} className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(7,20,61,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(7,20,61,0.12)]">
                <div className="relative h-52 overflow-hidden"><img src={item.image} alt={item.imageAlt} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#07143D]">{item.number}</span></div>
                <div className="p-6"><h3 className="font-serif text-2xl text-[#07143D]">{item.title}</h3><p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">{item.text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#080A9F]">Discover more <ChevronRight className="size-4 transition group-hover:translate-x-1" /></span></div>
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link to="/savings" className="flex items-center justify-between rounded-xl border border-[#DDE3EE] bg-white p-5 transition hover:border-[#C8A43D]"><span><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Plan with intention</span><span className="mt-1 block font-serif text-xl text-[#07143D]">Savings &amp; planning</span></span><ArrowUpRight className="size-5 text-[#080A9F]" /></Link>
            <Link to="/security" className="flex items-center justify-between rounded-xl border border-[#DDE3EE] bg-white p-5 transition hover:border-[#C8A43D]"><span><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Protect your access</span><span className="mt-1 block font-serif text-xl text-[#07143D]">Security &amp; account care</span></span><ArrowUpRight className="size-5 text-[#080A9F]" /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#07143D] text-white" aria-labelledby="difference-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:gap-20 lg:px-12 lg:py-24">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E4C86F]">The Evermont difference</p><h2 id="difference-heading" className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Thoughtful service. Clear next steps.</h2><p className="mt-5 max-w-lg leading-7 text-white/70">A helpful experience begins with knowing what a website can—and cannot—do. We keep those boundaries visible.</p><Link to="/resources" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#E4C86F] hover:underline">Explore our resources <ArrowRight className="size-4" /></Link></div>
          <div className="divide-y divide-white/15">
            {principles.map((principle, index) => <article key={principle.title} className="flex gap-5 py-5 first:pt-0 last:pb-0"><span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#C8A43D]/50 text-sm font-semibold text-[#E4C86F]">0{index + 1}</span><div><h3 className="font-serif text-xl">{principle.title}</h3><p className="mt-2 text-sm leading-6 text-white/70">{principle.text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="digital-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24">
          <div className="order-2 overflow-hidden rounded-2xl bg-[#F5F7FB] lg:order-1"><img src="/images/banners/phone.webp" alt="A mobile device ready for convenient digital access" loading="lazy" className="aspect-[4/3] size-full object-cover" /></div>
          <div className="order-1 lg:order-2"><div className="flex size-12 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#080A9F]"><Smartphone className="size-6" /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#9A7620]">Digital banking</p><h2 id="digital-heading" className="mt-3 font-serif text-4xl leading-tight text-[#07143D]">Your next step, just a sign-in away.</h2><p className="mt-5 leading-7 text-slate-600">Use the dedicated Evermont member portal for account access and registration. This public website never asks you to enter banking credentials.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><SignInLink className="inline-flex items-center justify-center gap-2 rounded-full bg-[#080A9F] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#07143D]" /><Link to="/security" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3.5 text-sm font-bold text-[#07143D] hover:border-[#C8A43D]">Account protection</Link></div></div>
        </div>
      </section>

      <section className="border-y border-[#E6EAF1] bg-[#F5F7FB]" aria-labelledby="faq-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1fr] lg:gap-20 lg:px-12 lg:py-24">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9A7620]">Good to know</p><h2 id="faq-heading" className="mt-3 font-serif text-4xl text-[#07143D]">A few helpful answers.</h2><Link to="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#080A9F]">More questions? Contact us <ArrowRight className="size-4" /></Link></div>
          <div className="divide-y divide-[#DDE3EE] border-y border-[#DDE3EE]">{faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#07143D] marker:hidden [&::-webkit-details-marker]:hidden">{faq.question}<ChevronRight className="size-5 shrink-0 text-[#080A9F] transition group-open:rotate-90" /></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="contact-heading">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12 lg:py-20">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9A7620]">Here to help</p><h2 id="contact-heading" className="mt-3 font-serif text-3xl text-[#07143D] sm:text-4xl">A conversation can be a good place to start.</h2><p className="mt-3 leading-7 text-slate-600">Reach the Evermont team with a question about the public website or your next step.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#080A9F] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#07143D]"><MessageCircle className="size-4" /> Contact Evermont</Link><Link to="/open-account" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C8A43D] px-6 py-3.5 text-sm font-bold text-[#07143D] hover:bg-[#FBF8EF]">Get Started</Link></div>
        </div>
      </section>
    </main>
  </PublicChrome>
)

export default HomePage
