import React from 'react'

export const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#101533] outline-none focus:border-[#0504AA] focus:ring-2 focus:ring-[#0504AA]/20'
export const labelClass = 'block text-sm font-semibold text-[#101533]'

export const TextField: React.FC<{
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  required?: boolean
}> = ({ id, label, value, onChange, error, type = 'text', inputMode, autoComplete, required }) => (
  <div>
    <label htmlFor={id} className={labelClass}>{label}</label>
    <input id={id} className={fieldClass} type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.value)} />
    {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
  </div>
)

export const FileField: React.FC<{
  id: string
  label: string
  file: File | null
  onChange: (file: File | null) => void
  error?: string
  required?: boolean
}> = ({ id, label, file, onChange, error, required }) => (
  <div>
    <label htmlFor={id} className={labelClass}>{label}</label>
    <input id={id} className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#0504AA] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white`} type="file" accept="image/jpeg,image/png,image/webp" required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    {file && <p className="mt-1 text-xs text-slate-500">{file.name}</p>}
    {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-700">{error}</p>}
  </div>
)

export const ReviewList: React.FC<{ rows: Array<{ label: string; value: string }> }> = ({ rows }) => (
  <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
    {rows.map((row) => (
      <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-3">
        <dt className="text-xs font-semibold uppercase tracking-[.12em] text-[#C9A227]">{row.label}</dt>
        <dd className="text-sm text-[#101533]">{row.value}</dd>
      </div>
    ))}
  </dl>
)
