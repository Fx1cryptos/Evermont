import React from 'react'
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'

const storefrontImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6857-l4EumMvsNPnjqLkSnnNLkUKCcRKzJh.jpeg'

const principles = [
  { title: 'Clarity first', text: 'Financial decisions should be understandable. We lead with plain language, useful context, and the next step.' },
  { title: 'Privacy by intention', text: 'We design every interaction around respect for personal information and careful communication.' },
  { title: 'Progress with perspective', text: 'A good financial relationship balances today’s needs with the goals that matter over time.' },
]

const commitments = ['Listen before advising.', 'Explain without obscuring.', 'Protect the details.', 'Keep the relationship human.']

export const AboutPage: React.FC = () => (
  <>
    <PageMeta title="About Evermont | A more considered financial relationship" description="Learn how Evermont is building a clear, private, and thoughtful digital banking experience for members." />
    <main className="bg-[#f8fafc] text-[#101533]">
      <section className="relative isolate overflow-hidden bg-[#101533] text-white">
        <img src={storefrontImage} alt="Evermont storefront" className="absolute inset-0 -z-20 size-full object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101533] via-[#101533]/95 to-[#101533]/60" />
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f1d56f]">About Evermont</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">A more considered way to move forward.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">Evermont is building a modern member experience around clarity, privacy, and thoughtful service. Less noise. Better context. A relationship that feels personal.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/open-account" className="inline-flex items-center gap-2 rounded-full bg-[#f1d56f] px-6 py-3.5 text-sm font-bold text-[#101533] transition hover:bg-white">Explore membership <ArrowRight className="size-4" /></Link>
              <Link to="/contact" className="rounded-full border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white">Talk with Evermont</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0504AA]">Our point of view</p><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Good service begins with paying attention.</h2></div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">We believe financial service should give people confidence, not more complexity. Every detail of the Evermont experience is intended to make the important things easier to understand and easier to act on.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{principles.map((principle) => <article key={principle.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf1ff] text-[#0504AA]"><ShieldCheck className="size-5" /></div><h3 className="mt-6 text-xl font-semibold">{principle.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{principle.text}</p></article>)}</div>
      </section>

      <section className="bg-[#101533] text-white"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f1d56f]">Built for the long view</p><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Where thoughtful service meets a modern experience.</h2></div><div className="rounded-3xl border border-white/10 bg-white/5 p-7"><Sparkles className="size-6 text-[#f1d56f]" /><p className="mt-6 text-lg leading-8 text-slate-200">From the first question to the next financial milestone, we aim to make the relationship feel clear, private, and genuinely useful.</p></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">Our approach</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Professional in detail. Personal in tone.</h2><p className="mt-5 leading-8 text-slate-600">A strong financial experience should feel calm, responsive, and easy to navigate. That is the standard we are working toward across our public site and member portal.</p></div><div className="grid gap-4 sm:grid-cols-2">{commitments.map((commitment) => <div key={commitment} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Check className="size-5 shrink-0 text-[#C9A227]" /><span className="font-semibold">{commitment}</span></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28"><div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]"><div className="min-h-80 bg-slate-100"><img src={storefrontImage} alt="Evermont Credit Union storefront" className="size-full min-h-80 object-cover" /></div><div className="flex flex-col justify-center p-8 sm:p-12"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0504AA]">Evermont in the community</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">A real place for a thoughtful conversation.</h2><p className="mt-5 leading-7 text-slate-600">Our storefront image is part of the Evermont story: a visible, welcoming place behind a digital experience designed to be dependable.</p><Link to="/contact" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#0504AA] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0807c8]">Contact Evermont <ArrowRight className="size-4" /></Link></div></div></section>
    </main>
  </>
)

export default AboutPage
