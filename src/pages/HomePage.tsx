import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import {
  ArrowRight,
  Car,
  Check,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Gem,
  Landmark,
  LockKeyhole,
  Menu,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react'

const logoUrl = 'https://gateway.pinata.cloud/ipfs/bafkreicrwvjqxdzit62i5e2yvk24atabo2ob3ayyxluwzb2pmyrrzq6z2i'
const logoFallbackUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-Fvq3xmsjYnN3STSbbZwGgSbLWX7M4H.jpeg'
const pinataGateway = 'https://gateway.pinata.cloud/ipfs/'
const supportEmail = 'support@evermontcredit.online'

const products = [
  { name: 'Checking Account', path: '/banking/private-checking', description: 'A simpler way to manage everyday money.', benefit: 'No monthly maintenance fees', icon: WalletCards, tone: 'blue', image: `${pinataGateway}bafkreidchfnomj35rvey7yabgyvckshfm4s56onupq2g5nuhsf5cbuzbwy` },
  { name: 'Savings Account', path: '/banking/private-savings', description: 'Build a stronger financial foundation.', benefit: 'Competitive dividend rates', icon: PiggyBank, tone: 'gold', image: `${pinataGateway}bafybeidiwp4dtjw2662f5vqwollfbtfj7dfmuk746kwsxiy2fkaryb7kva` },
  { name: 'Credit Card', path: '/banking/credit-card', description: 'Flexible spending with member-first benefits.', benefit: 'Rewards on every purchase', icon: CreditCard, tone: 'ink', image: `${pinataGateway}bafkreibw4situowzxkn7xeaupaxltjbqwffw44hrstgp6er27lyx2fyymq` },
  { name: '401(k)', path: '/banking/retirement-401k', description: 'Invest in the future you are building.', benefit: 'Guidance for every chapter', icon: TrendingUp, tone: 'blue', image: `${pinataGateway}bafkreiarkceaf2lkozxg4donpczcgxv7nwxtukvrvh2j4d7dzajfqmn4qm` },
  { name: 'Crypto Loan', path: '/banking/digital-asset-lending', description: 'Access liquidity without selling your assets.', benefit: 'Thoughtful digital asset lending', icon: Gem, tone: 'ink', image: `${pinataGateway}bafkreiahf6sasjnaxbwvpiylqd3k3dyeos32dwlpb6qyir6u3v4cmvybpm` },
  { name: 'Personal Loan', path: '/loans/personal', description: 'Make room for what matters most.', benefit: 'Rates designed around you', icon: Landmark, tone: 'blue', image: `${pinataGateway}bafybeifr5exhupokbda4vilfwuuqkhkogxtq4lzbt7huciou6t3jkd2eja` },
  { name: 'Auto Loan', path: '/loans/auto', description: 'Get moving with a confident plan.', benefit: 'Fast, local decisions', icon: Car, tone: 'gold', image: `${pinataGateway}bafybeifk33kwar6p5myte4d3a6gwovyiutnip75t2onj2kbxtmdsjv7bxe` },
]

const benefits = ['Member-owned and community-led', 'Straightforward products and pricing', 'People who know your name and goals']
const faqs = [
  ['How do I open an account?', 'Choose Open an Account to begin registration, or contact our support team for personal guidance.'],
  ['How do I access member banking?', 'Use Sign In to access the separate Evermont member banking portal with your existing credentials.'],
  ['How does Evermont protect my information?', 'We use layered account security and careful service practices to help protect your information and financial goals.'],
]

export const HomePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const navItems = [['Products', 'products'], ['Checking', '/checking'], ['Savings', '/savings'], ['Crypto', '/cryptocurrency'], ['Loans', '/loans'], ['Retirement', '/retirement'], ['Security', 'security'], ['About', '/about'], ['Contact', 'contact']]

  return (
    <>
      <PageMeta
        title="Evermont Credit Union | Secured Private Wealth Banking"
        description="Evermont Credit Union provides a refined private-wealth banking experience focused on discretion, clarity, and responsible service. Explore accounts, manage your finances, and access member services with confidence."
        canonical="https://evermontcredit.online/"
      />
      <div className="min-h-screen bg-[#f8fafc] text-[#101533]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Evermont home">
            <img src={logoUrl} alt="Evermont secured private wealth bank" className="h-11 w-11 object-contain" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = logoFallbackUrl }} />
            <span className="text-lg font-bold tracking-[-0.04em] text-[#101533]">EVERMONT</span>
            <span className="hidden border-l border-slate-200 pl-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">Secured Private Wealth Bank</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Primary navigation">
            {navItems.map(([label, id]) => id.startsWith('/') ? <Link key={id} to={id} className="transition-colors hover:text-[#0504AA]">{label}</Link> : <a key={id} href={`#${id}`} className="transition-colors hover:text-[#0504AA]">{label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <a href="https://v0-evermont.vercel.app/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#0504AA] transition-colors hover:bg-blue-50">Sign In</a>
            <Link to="/open-checking" className="rounded-full bg-[#0504AA] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#0807c8]">Open an Account</Link>
          </div>
          <button className="rounded-lg p-2 text-[#0504AA] sm:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white px-5 py-4 sm:hidden" aria-label="Mobile navigation">{navItems.map(([label, id]) => id.startsWith('/') ? <Link key={id} to={id} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50">{label}</Link> : <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50">{label}</a>)}<a href="https://v0-evermont.vercel.app/login" className="mt-2 rounded-lg bg-[#0504AA] px-3 py-3 text-center text-sm font-semibold text-white">Sign In</a><Link to="/open-checking" className="rounded-lg border border-[#0504AA] px-3 py-3 text-center text-sm font-semibold text-[#0504AA]">Open an Account</Link></nav>}
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#fffaf0] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#8d6e0c]"><Sparkles className="size-3.5" /> Private wealth, thoughtfully protected</div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#101533] sm:text-6xl lg:text-[72px]">Where private wealth<br /><span className="text-[#0504AA]">is protected.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Discover a more considered approach to private banking, with a focus on discretion, responsible service, and the financial goals that matter most to you.</p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#8d6e0c]">Built on Integrity. Guided by Excellence.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4"><Link to="/open-checking" className="inline-flex items-center gap-2 rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#0807c8]">Open an Account <ArrowRight className="size-4" /></Link><a href="https://v0-evermont.vercel.app/login" className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0504AA] transition hover:border-[#0504AA]">Sign In</a></div>
              <div className="mt-11 flex items-center gap-3 text-sm text-slate-500"><div className="flex -space-x-2"><div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#0504AA] text-[10px] font-bold text-white">JM</div><div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#C9A227] text-[10px] font-bold text-white">RS</div><div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-[10px] font-bold text-white">AK</div></div><span>Trusted by members across our community</span></div>
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Made for your next move</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Financial solutions<br className="hidden sm:block" /> built around you.</h2></div><p className="max-w-sm text-base leading-7 text-slate-500">From first accounts to long-term plans, our products are designed to make progress feel possible.</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map(({ name, path, description, benefit, icon: Icon, tone, image }) => <Link to={path} key={name} className="group flex min-h-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#0504AA]/30 hover:shadow-xl"><div className="relative h-40 overflow-hidden bg-slate-100"><img src={image} alt={`${name} illustration`} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /><div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" /></div><div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone === 'gold' ? 'bg-[#fff8df] text-[#a17c0b]' : tone === 'ink' ? 'bg-slate-100 text-slate-700' : 'bg-[#edf1ff] text-[#0504AA]'}`}><Icon className="size-5" /></div><span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Evermont</span></div><h3 className="mt-5 text-lg font-semibold">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-[#0504AA]">{benefit}</span><ArrowRight className="size-4 text-[#C9A227]" /></div></div></Link>)}</div></section>

        <section id="loans" className="border-y border-slate-200 bg-[#f1f4ff]"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0504AA]">Borrow with clarity</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Plans for the life you are building.</h2><p className="mt-4 max-w-xl leading-7 text-slate-600">Explore personal, auto, and digital asset lending with a team that takes the time to understand your next move.</p></div><Link to="/open-checking" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#0807c8]">Start a conversation <ArrowRight className="size-4" /></Link></div></section>

        <section id="about" className="bg-[#101533] text-white"><div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f1d56f]">Why Evermont</p><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">A financial partner<br />that feels closer.</h2><p className="mt-6 max-w-lg text-base leading-8 text-slate-300">We are a not-for-profit credit union, which means our success is measured by the progress of our members—not by shareholders. Every decision starts with you.</p><a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#f1d56f] hover:text-white">Meet the Evermont difference <ArrowRight className="size-4" /></a></div><div className="grid gap-4 sm:grid-cols-2">{benefits.map((benefit, index) => <div key={benefit} className={`rounded-2xl border border-white/10 p-5 ${index === 0 ? 'bg-white/10 sm:col-span-2' : 'bg-white/5'}`}><div className="flex items-start gap-4"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C9A227] text-[#101533]"><Check className="size-4" /></div><p className="font-medium leading-6 text-slate-100">{benefit}</p></div></div>)}</div></div></section>

        <section id="security" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24"><div className="grid gap-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10 lg:grid-cols-[1fr_1.5fr] lg:p-14"><div><div className="flex size-12 items-center justify-center rounded-xl bg-[#edf1ff] text-[#0504AA]"><LockKeyhole className="size-6" /></div><h2 className="mt-5 text-3xl font-semibold tracking-tight">Your security is our standard.</h2><p className="mt-4 leading-7 text-slate-500">We combine thoughtful technology with people who are ready to help protect what matters.</p></div><div className="grid gap-7 sm:grid-cols-3"><div><ShieldCheck className="size-5 text-[#C9A227]" /><h3 className="mt-3 font-semibold">Protected accounts</h3><p className="mt-2 text-sm leading-6 text-slate-500">Federally insured deposits and layered protection.</p></div><div><Users className="size-5 text-[#C9A227]" /><h3 className="mt-3 font-semibold">Human support</h3><p className="mt-2 text-sm leading-6 text-slate-500">Real people, ready when you need a hand.</p></div><div><Landmark className="size-5 text-[#C9A227]" /><h3 className="mt-3 font-semibold">Local perspective</h3><p className="mt-2 text-sm leading-6 text-slate-500">Decisions made with your community in mind.</p></div></div></div></section>

        <section id="business" className="bg-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="rounded-3xl bg-[#101533] p-8 text-white sm:p-12"><div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f1d56f]">Business &amp; Operations</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">The operational side of Evermont.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Visit our dedicated Business &amp; Operations application for operational resources and services.</p></div><a href="https://evermont-credit-unio-2tld.bolt.host" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f1d56f] px-6 py-3.5 text-sm font-semibold text-[#101533] transition hover:bg-white">Visit Business &amp; Operations <ExternalLink className="size-4" /></a></div></div></div></section>

        <section id="faq" className="mx-auto max-w-4xl px-5 py-20 lg:py-24"><div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Helpful answers</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Questions, answered.</h2></div><div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">{faqs.map(([question, answer], index) => <div key={question}><button className="flex w-full items-center justify-between gap-6 py-5 text-left font-semibold" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<ChevronDown className={`size-5 shrink-0 text-[#0504AA] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="-mt-2 max-w-2xl pb-5 pr-8 text-sm leading-7 text-slate-500">{answer}</p>}</div>)}</div></section>

        <section id="open-account" className="bg-[#eef1ff]"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 py-16 sm:flex-row sm:items-center lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0504AA]">Start where you are</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your future has room to grow.</h2></div><Link to="/open-checking" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#0807c8]">Open an Account <ArrowRight className="size-4" /></Link></div></section>
      </main>

      <footer id="contact" className="bg-white"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex flex-col justify-between gap-10 border-b border-slate-200 pb-10 md:flex-row"><div><img src={logoUrl} alt="Evermont secured private wealth bank" className="h-12 w-12 object-contain" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = logoFallbackUrl }} /><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">Where Private Wealth Is Protected. Built on Integrity. Guided by Excellence.</p><a href={`mailto:${supportEmail}`} className="mt-4 inline-block text-sm font-semibold text-[#0504AA] hover:underline">{supportEmail}</a><div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8d6e0c]">Connect with Evermont</p><div className="mt-3 flex items-center gap-3"><a href="https://www.instagram.com/evermontcreditunion" target="_blank" rel="noopener noreferrer" aria-label="Evermont Credit Union on Instagram" className="flex size-9 items-center justify-center rounded-full bg-[#0504AA] text-white transition hover:bg-[#C9A227] hover:text-[#101533]"><img src="https://cdn.simpleicons.org/instagram/FFFFFF" alt="Instagram" className="size-4" /></a><a href="https://www.facebook.com/share/1GupMnFfkt/" target="_blank" rel="noopener noreferrer" aria-label="Evermont Credit Union on Facebook" className="flex size-9 items-center justify-center rounded-full bg-[#0504AA] text-white transition hover:bg-[#C9A227] hover:text-[#101533]"><img src="https://cdn.simpleicons.org/facebook/FFFFFF" alt="Facebook" className="size-4" /></a></div></div><p className="mt-4 text-xs text-slate-400">Official domain: evermontcredit.online</p></div><div className="grid grid-cols-2 gap-x-14 gap-y-4 text-sm text-slate-500 sm:grid-cols-3"><a href="#products" className="hover:text-[#0504AA]">Products</a><a href="#loans" className="hover:text-[#0504AA]">Loans</a><a href="#security" className="hover:text-[#0504AA]">Security</a><a href="#about" className="hover:text-[#0504AA]">About</a><a href="#faq" className="hover:text-[#0504AA]">FAQ</a><a href="#contact" className="hover:text-[#0504AA]">Contact Support</a><a href="https://v0-evermont-credit.vercel.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-[#0504AA]">Member Portal <ExternalLink className="size-3" /></a><a href="https://evermont-credit-unio-2tld.bolt.host" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-[#0504AA]">Business &amp; Operations <ExternalLink className="size-3" /></a></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-xs text-slate-400 sm:flex-row"><span>© 2026 Evermont Secured Private Wealth Bank. All rights reserved.</span><div className="flex gap-5"><a href="#privacy" className="hover:text-[#0504AA]">Privacy</a><a href="#terms" className="hover:text-[#0504AA]">Terms</a><a href="#security" className="hover:text-[#0504AA]">Security</a></div></div></div></footer>
    </div>
    </>
  )
}

export default HomePage
