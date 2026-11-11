import React, { useState } from 'react'
import { PublicDocument } from '@/components/PageBanner'
import { MAILING_ADDRESS, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '@/content/publicPages'

const categories = ['General question', 'Personal banking', 'Private wealth', 'Account opening', 'Security concern', 'Something else']

export const ContactPage: React.FC = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const category = String(data.get('category') || '')
    const message = String(data.get('message') || '').trim()
    const next: Record<string, string> = {}
    if (name.length < 2) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!categories.includes(category)) next.category = 'Choose a category.'
    if (message.length < 10) next.message = 'Enter at least 10 characters.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const subject = encodeURIComponent(`Evermont enquiry: ${category}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\n${message}`)
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <PublicDocument path="/contact" eyebrow="Contact Us" title="Reach Evermont directly." lede="Use the phone, the email, or the mailing address. The form opens your email application with the fields filled in. It does not send the message by itself, and it does not confirm that a message was delivered." imageAlt="Writing desk with a blank envelope, a fountain pen, and a brass lamp" actions={[{ href: SUPPORT_PHONE_TEL, label: `Call ${SUPPORT_PHONE_DISPLAY}`, external: true }]}>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <address className="space-y-4 text-sm not-italic leading-7 text-slate-700">
            {MAILING_ADDRESS.map((line) => <p key={line}>{line}</p>)}
            <p>Mailing address only. No branch address is listed.</p>
            <p><a className="font-semibold text-[#080A9F] hover:underline" href={SUPPORT_PHONE_TEL}>{SUPPORT_PHONE_DISPLAY}</a></p>
            <p><a className="font-semibold text-[#080A9F] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
            <p>Do not include passwords or full account numbers. Hours and a response time are not published.</p>
          </address>
          <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-3xl border border-slate-200 p-6 sm:p-8">
            <p className="text-sm leading-6 text-slate-600">Required fields are marked. Submitting opens a pre-filled email. You will not see a success message on this page.</p>
            <label className="block text-sm font-semibold text-[#07143D]">Name
              <input name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
              {errors.name && <span id="name-error" className="mt-1 block font-normal text-red-700">{errors.name}</span>}
            </label>
            <label className="block text-sm font-semibold text-[#07143D]">Email
              <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
              {errors.email && <span id="email-error" className="mt-1 block font-normal text-red-700">{errors.email}</span>}
            </label>
            <label className="block text-sm font-semibold text-[#07143D]">Enquiry category
              <select name="category" defaultValue="" aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal">
                <option value="" disabled>Choose one</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              {errors.category && <span id="category-error" className="mt-1 block font-normal text-red-700">{errors.category}</span>}
            </label>
            <label className="block text-sm font-semibold text-[#07143D]">Message
              <textarea name="message" rows={5} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" />
              {errors.message && <span id="message-error" className="mt-1 block font-normal text-red-700">{errors.message}</span>}
            </label>
            <button type="submit" className="rounded-full bg-[#080A9F] px-6 py-3.5 text-sm font-semibold text-white">Open email</button>
          </form>
        </div>
      </section>
    </PublicDocument>
  )
}

export default ContactPage
