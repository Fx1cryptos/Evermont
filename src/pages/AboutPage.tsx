import React, { useEffect } from 'react'
import { ArrowRight, Check, ExternalLink, Mail, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const gateway = 'https://gateway.pinata.cloud/ipfs/'
const logoUrl = `${gateway}bafkreicrwvjqxdzit62i5e2yvk24atabo2ob3ayyxluwzb2pmyrrzq6z2i`
const bannerUrl = `${gateway}bafkreibimelyavzcohlawlv6rdgbckjhumxs5wpiriay3ujhsezimlhjpi`
const storefrontImages = [
  `${gateway}bafkreifaduifhfyxsb4qk5lkywi2myv7knyierokzxwsxyltdws563aytq`,
  `${gateway}bafkreic7sm7xud7ym3hzcsn7pmd6bfpn4fephp2jefuwa7s64nbji2vaou`,
]
const loginUrl = 'https://v0-evermont.vercel.app/login'

const principles = [
  ['Discretion', 'A thoughtful approach to information, communication, and the details of every relationship.'],
  ['Integrity', 'Clear expectations and honest guidance, without promises that go beyond what we can verify.'],
  ['Individual focus', 'A closer understanding of your priorities, preferences, and long-term perspective.'],
]
const goals = ['Responsible Service', 'Privacy', 'Digital Experience', 'Transparency', 'Long-Term Perspective']
const commitments = ['We communicate with care and clarity.', 'We treat your information with respect.', 'We keep the long view in every conversation.']

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Evermont Credit Union | Private Wealth, Protected'
    const description = 'Learn about Evermont Credit Union, our philosophy, mission, and considered approach to private financial service.'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta) }
    meta.setAttribute('content', description)
  }, [])

  return <div className="min-h-screen bg-[#f8fafc] text-[#101533]">
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Evermont home"><img src={logoUrl} alt="Evermont Credit Union" className="h-11 w-11 object-contain" /><span className="text-lg font-bold tracking-[-0.04em]">EVERMONT</span></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex" aria-label="About navigation"><Link to="/" className="hover:text-[#0504AA]">Home</Link><a href="#philosophy" className="hover:text-[#0504AA]">Philosophy</a><a href="#contact" className="hover:text-[#0504AA]">Contact</a></nav>
        <div className="flex items-center gap-2"><a href={loginUrl} className="rounded-full px-3 py-2 text-sm font-semibold text-[#0504AA] hover:bg-blue-50">Sign In</a><Link to="/open-checking" className="hidden rounded-full bg-[#0504AA] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0807c8] sm:inline-flex">Open an Account</Link></div>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden bg-[#101533] text-white"><img src={bannerUrl} alt="Evermont storefront detail" className="absolute inset-0 size-full object-cover opacity-25" /><div className="absolute inset-0 bg-gradient-to-r from-[#101533] via-[#101533]/95 to-[#101533]/55" /><div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f1d56f]">About Evermont</p><h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Where private wealth<br /><span className="text-[#f1d56f]">is protected.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">Built on Integrity. Guided by Excellence. Evermont is designed around a more considered relationship with your financial goals.</p><div className="mt-9 flex flex-wrap gap-4"><a href="#philosophy" className="inline-flex items-center gap-2 rounded-full bg-[#f1d56f] px-6 py-3.5 text-sm font-semibold text-[#101533] hover:bg-white">Our philosophy <ArrowRight className="size-4" /></a><a href="#contact" className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:border-white">Contact Evermont</a></div></div></section>

      <section id="philosophy" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Who we are</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">A relationship built around your priorities.</h2></div><p className="max-w-2xl text-lg leading-8 text-slate-600">Evermont brings a private, deliberate sensibility to financial service. We believe trust is earned through consistency, thoughtful attention, and a clear understanding of what matters to each member.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{principles.map(([title, body]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex size-11 items-center justify-center rounded-xl bg-[#edf1ff] text-[#0504AA]"><ShieldCheck className="size-5" /></div><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></article>)}</div></section>

      <section className="bg-[#101533] text-white"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f1d56f]">Our mission</p><h2 className="mt-4 text-4xl font-semibold leading-tight">Make financial progress feel more considered.</h2></div><p className="max-w-xl text-lg leading-8 text-slate-300">Our mission is to provide responsible, private financial service that helps members make informed decisions with confidence, clarity, and a long-term view.</p></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="rounded-3xl border border-[#C9A227]/35 bg-[#fffaf0] p-8 sm:p-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8d6e0c]">Our vision</p><h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">To be the financial relationship members choose for thoughtful guidance and enduring trust.</h2></div></section>

      <section className="bg-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">What guides us</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Goals with a long view.</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{goals.map((goal, index) => <div key={goal} className="rounded-2xl border border-slate-200 p-6"><span className="text-sm font-bold text-[#C9A227]">0{index + 1}</span><h3 className="mt-10 font-semibold leading-6">{goal}</h3></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0504AA]">Our approach</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Private by Intention.<br />Considered in Every Detail.</h2></div><div className="grid gap-5 sm:grid-cols-2">{['Listen before advising.', 'Explain without obscuring.', 'Protect the details.', 'Keep the relationship human.'].map((principle) => <div key={principle} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6"><Check className="size-5 shrink-0 text-[#C9A227]" /><p className="font-semibold">{principle}</p></div>)}</div></div></section>

      <section className="border-y border-slate-200 bg-[#f1f4ff]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#0504AA]">Who we serve</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">For members who value a closer conversation.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Evermont is for people seeking a thoughtful, private approach to financial service—without unnecessary noise or one-size-fits-all assumptions. Product availability and eligibility are confirmed directly for each member’s circumstances.</p></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-5 md:grid-cols-3">{commitments.map((commitment) => <div key={commitment} className="rounded-2xl bg-[#101533] p-7 text-white"><Check className="size-5 text-[#f1d56f]" /><p className="mt-8 text-lg font-semibold leading-7">{commitment}</p></div>)}</div></section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="grid gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white md:grid-cols-2"><div className="grid grid-cols-2 gap-2 bg-slate-100 p-2"><img src={storefrontImages[0]} alt="Evermont storefront" className="h-full min-h-64 w-full rounded-2xl object-cover" /><img src={storefrontImages[1]} alt="Evermont storefront detail" className="h-full min-h-64 w-full rounded-2xl object-cover" /></div><div id="contact" className="flex flex-col justify-center p-8 sm:p-12"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">Connect with Evermont</p><h2 className="mt-4 text-3xl font-semibold">Let’s start a thoughtful conversation.</h2><p className="mt-4 leading-7 text-slate-600">For general questions, contact our team directly.</p><div className="mt-7 space-y-3 text-sm"><a href="mailto:support@evermontcredit.online" className="flex items-center gap-3 font-semibold text-[#0504AA] hover:underline"><Mail className="size-4" /> support@evermontcredit.online</a><a href="mailto:info@evermontcredit.online" className="flex items-center gap-3 font-semibold text-[#0504AA] hover:underline"><Mail className="size-4" /> info@evermontcredit.online</a><a href="https://www.youtube.com/@EvermontCreditUnion" target="_blank" rel="noreferrer" className="flex items-center gap-3 font-semibold text-[#0504AA] hover:underline"><ExternalLink className="size-4" /> YouTube</a></div><div className="mt-8 flex flex-wrap gap-3"><Link to="/open-checking" className="rounded-full bg-[#0504AA] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0807c8]">Contact / Open an Account</Link><Link to="/" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-[#0504AA] hover:border-[#0504AA]">Return to Home</Link></div></div></div></section>
    </main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>Where Private Wealth Is Protected.</span><span>Built on Integrity. Guided by Excellence.</span></div></footer>
  </div>
}

export default AboutPage
