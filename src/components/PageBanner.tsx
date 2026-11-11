import React from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '@/components/PageMeta'
import { MemberLoginLink, PublicChrome } from '@/components/PublicChrome'
import { pageByPath, type PageSeo } from '@/content/publicPages'

type Action = { href: string; label: string; external?: boolean }

export const PageBanner: React.FC<{ image: string; alt: string; eyebrow?: string; title: string; lede?: string; actions?: Action[] }> = ({ image, alt, eyebrow, title, lede, actions }) => (
  <section className="relative overflow-hidden bg-[#080A9F] text-white">
    <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover opacity-45" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#080A9F]/90 via-[#080A9F]/75 to-[#080A9F]/35" />
    <div className="relative mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C8A43D]">{eyebrow}</p>}
      <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
      {lede && <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50">{lede}</p>}
      {actions && actions.length > 0 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {actions.map((action) => action.external ? (
            <a key={action.label} href={action.href} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#080A9F]">{action.label}</a>
          ) : (
            <Link key={action.label} to={action.href} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#080A9F] first:bg-[#C8A43D] first:text-[#07143D]">{action.label}</Link>
          ))}
        </div>
      )}
    </div>
  </section>
)

export const PublicDocument: React.FC<{ path: string; eyebrow?: string; title: string; lede?: string; imageAlt: string; actions?: Action[]; children: React.ReactNode }> = ({ path, eyebrow, title, lede, imageAlt, actions, children }) => {
  const seo = pageByPath(path) as PageSeo
  return (
    <PublicChrome>
      <PageMeta title={seo.title} description={seo.description} path={seo.path} image={seo.image} jsonLd={seo.jsonLd} />
      <main id="main">
        <PageBanner image={seo.image} alt={imageAlt} eyebrow={eyebrow} title={title} lede={lede} actions={actions} />
        {children}
      </main>
    </PublicChrome>
  )
}

export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const planned = /planned|not offered/i.test(status)
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${planned ? 'bg-[#F5F7FB] text-[#6E5610]' : 'bg-[#eef1ff] text-[#080A9F]'}`}>{status}</span>
}

export const PortalNote: React.FC = () => (
  <p className="text-sm leading-7 text-slate-600">Sign-in stays on the separate portal. <MemberLoginLink className="font-semibold text-[#080A9F] underline-offset-4 hover:underline" /></p>
)
