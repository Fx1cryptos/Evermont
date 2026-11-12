import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PublicDocument } from '@/components/PageBanner'
import { LEGAL_LAST_UPDATED, legalDocuments, type LegalPageKey } from '@/content/legalDocuments'

const LegalDocumentPage: React.FC = () => {
  const pathname = useLocation().pathname
  const pageKey: LegalPageKey = pathname === '/terms' ? 'terms' : 'privacy'
  const document = legalDocuments[pageKey]
  const otherPage: LegalPageKey = pageKey === 'privacy' ? 'terms' : 'privacy'
  const otherDocument = legalDocuments[otherPage]
  const otherPath = otherPage === 'privacy' ? '/privacy' : '/terms'

  return (
    <PublicDocument
      path={pathname === '/terms' ? '/terms' : '/privacy'}
      eyebrow="Legal information · Draft for review"
      title={document.title}
      lede={document.lede}
      imageAlt={document.imageAlt}
    >
      <section aria-label={`${document.title} details`} className="bg-white">
        <div className="border-b border-[#C8A43D]/40 bg-[#FBF8EF]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="inline-flex w-fit items-center rounded-full border border-[#C8A43D] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#07143D]">
              Draft · legal review required
            </p>
            <p className="text-sm leading-6 text-[#07143D]">
              Last updated: <time dateTime="2026-11-12">{LEGAL_LAST_UPDATED}</time> · Not effective until approved and published
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label={`${document.title} contents`} className="self-start rounded-2xl border border-slate-200 bg-[#F5F7FB] p-5 lg:sticky lg:top-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#07143D]">On this page</h2>
            <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm leading-5 sm:grid-cols-3 lg:grid-cols-1">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="rounded-sm text-slate-700 underline decoration-[#C8A43D] underline-offset-4 hover:text-[#080A9F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#080A9F]"
                  >
                    {section.heading.replace(/^\d+\.\s*/, '')}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0">
            <aside aria-label="Publication review notice" className="mb-9 rounded-2xl border-l-4 border-[#C8A43D] bg-[#FBF8EF] p-5 sm:p-6">
              <h2 className="font-serif text-2xl text-[#07143D]">Before publication</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                This is a substantive draft for U.S. legal review, not an approved legal notice. Bracketed items and operational practices must be verified, completed, and approved by qualified counsel before this document is treated as effective.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-[#080A9F]">
                {document.reviewNotes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </aside>

            <div className="space-y-9">
              {document.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-8 border-b border-slate-200 pb-8 last:border-b-0">
                  <h2 className="font-serif text-2xl leading-tight text-[#07143D] sm:text-3xl">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.bullets && (
                      <ul className="list-disc space-y-2 pl-6 marker:text-[#C8A43D]">
                        {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-600">This page is available without signing in.</p>
              <Link
                to={otherPath}
                className="w-fit rounded-sm font-semibold text-[#080A9F] underline decoration-[#C8A43D] underline-offset-4 hover:text-[#07143D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#080A9F]"
              >
                Read the {otherDocument.title}
              </Link>
            </div>
          </article>
        </div>
      </section>
    </PublicDocument>
  )
}

export default LegalDocumentPage
