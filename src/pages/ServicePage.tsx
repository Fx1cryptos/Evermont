import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const serviceContent: Record<string, { eyebrow: string; title: string; description: string; points: string[] }> = {
  checking: {
    eyebrow: 'Everyday banking',
    title: 'Checking that keeps life moving.',
    description: 'Explore a clear, dependable foundation for everyday spending, deposits, and the moments in between.',
    points: ['Everyday account guidance', 'Secure digital access', 'Member support when you need it'],
  },
  savings: {
    eyebrow: 'Build your foundation',
    title: 'Savings with a purpose.',
    description: 'Create room for the goals ahead with thoughtful savings education and member-first support.',
    points: ['Goal-based saving education', 'Account information for members', 'Clear, responsible guidance'],
  },
  loans: {
    eyebrow: 'Borrow with clarity',
    title: 'A lending conversation built around you.',
    description: 'Learn about personal and auto lending, responsible borrowing, and the information to gather before you apply.',
    points: ['Personal loan education', 'Auto loan education', 'Application guidance when available'],
  },
  wealth: {
    eyebrow: 'Private wealth',
    title: 'Plan thoughtfully for what matters most.',
    description: 'Explore long-term planning and wealth-preservation education designed to help you ask better questions.',
    points: ['Long-term planning education', 'Wealth-preservation resources', 'A clear path to support'],
  },
  investments: {
    eyebrow: 'Investments and retirement',
    title: 'Education for your next chapter.',
    description: 'Build your understanding of investing and retirement planning without confusing education for regulated advice.',
    points: ['Investment fundamentals', 'Retirement planning education', '401(k) resources where relevant'],
  },
  'digital-assets': {
    eyebrow: 'Digital-asset education',
    title: 'Understand the opportunity and the risk.',
    description: 'Learn about volatility, security, custody, and the limitations of digital-asset services. Evermont does not claim services that are not verified.',
    points: ['Risk and volatility education', 'Security best practices', 'Clear service limitations'],
  },
}

export const ServicePage: React.FC = () => {
  const { service = 'checking' } = useParams()
  const content = serviceContent[service] ?? serviceContent.checking

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#101533]">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to={ROUTES.HOME} className="font-semibold tracking-tight text-[#0504AA]">Evermont Credit Union</Link>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link to={ROUTES.LOGIN} className="text-[#0504AA]">Member Login</Link>
            <Link to={ROUTES.REGISTER} className="rounded-full bg-[#0504AA] px-4 py-2 text-white">Open Account</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0504AA]"><ArrowLeft className="size-4" /> Back to Evermont</Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">{content.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">{content.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{content.description}</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link to={ROUTES.REGISTER} className="inline-flex items-center gap-2 rounded-full bg-[#0504AA] px-6 py-3.5 text-sm font-semibold text-white">Open an Account <ArrowRight className="size-4" /></Link><Link to={ROUTES.LOGIN} className="rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold text-[#0504AA]">Access Member Banking</Link></div>
          </div>
          <aside className="rounded-3xl bg-[#101533] p-8 text-white shadow-xl"><div className="flex size-12 items-center justify-center rounded-2xl bg-[#C9A227] text-[#101533]"><LockKeyhole className="size-6" /></div><h2 className="mt-6 text-2xl font-semibold">A thoughtful place to start</h2><ul className="mt-6 flex flex-col gap-4">{content.points.map((point) => <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-200"><CheckCircle2 className="mt-1 size-4 shrink-0 text-[#f1d56f]" />{point}</li>)}</ul></aside>
        </div>
      </section>
    </main>
  )
}

export default ServicePage

export const SERVICE_ROUTES = {
  checking: '/services/checking',
  savings: '/services/savings',
  loans: '/services/loans',
  wealth: '/services/wealth',
  investments: '/services/investments',
  'digital-assets': '/services/digital-assets',
} as const

export type ServiceKey = keyof typeof serviceContent

export const serviceHref = (service: ServiceKey) => SERVICE_ROUTES[service as keyof typeof SERVICE_ROUTES]

export const servicePageLabel = (service: ServiceKey) => serviceContent[service].eyebrow

export const servicePageDescription = (service: ServiceKey) => serviceContent[service].description

export const servicePageTitle = (service: ServiceKey) => serviceContent[service].title

export const servicePagePoints = (service: ServiceKey) => serviceContent[service].points

export const servicePageKeys = Object.keys(serviceContent) as ServiceKey[]

export const servicePageExists = (service: string): service is ServiceKey => service in serviceContent
