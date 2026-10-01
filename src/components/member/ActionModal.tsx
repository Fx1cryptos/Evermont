import React, { useEffect, useState } from 'react'
import { X, Check, Copy, CheckCircle2 } from 'lucide-react'
import { Account } from '@/types'
import { formatCurrency, accountTypeLabel } from '@/utils/formatting'

export interface QuickActionField {
  name: string
  label: string
  type: 'select' | 'currency' | 'text' | 'date'
  options?: string[]
  placeholder?: string
  helpText?: string
  required?: boolean
}

export interface QuickActionDef {
  id: string
  label: string
  description: string
  fields: QuickActionField[]
  successNote: string
  /** 'receive' shows a share-details screen instead of a form */
  shareable?: boolean
}

interface ActionModalProps {
  action: QuickActionDef | null
  accounts: Account[]
  onClose: () => void
}

type Step = 'form' | 'confirm' | 'success'

const AccountOption: React.FC<{ account: Account }> = ({ account }) => (
  <option value={account.id}>
    {accountTypeLabel(account.accountType)} {account.accountNumber}
  </option>
)

const ActionModal: React.FC<ActionModalProps> = ({ action, accounts, onClose }) => {
  const [step, setStep] = useState<Step>('form')
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (action) {
      setStep('form')
      setValues({})
      setError(null)
    }
  }, [action])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!action) return null

  const setValue = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }))

  const validate = (): string | null => {
    for (const field of action.fields) {
      const val = (values[field.name] ?? '').trim()
      if (field.type === 'currency') {
        const amount = parseFloat(val)
        if (!val || isNaN(amount) || amount <= 0) return 'Enter an amount greater than $0.'
      } else if (field.type === 'select' || field.required) {
        if (!val) return `Please choose ${field.label.toLowerCase()}.`
      }
    }
    return null
  }

  const handleContinue = () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setStep('confirm')
  }

  const handleConfirm = () => {
    setStep('success')
  }

  const labelFor = (field: QuickActionField, raw: string): string => {
    if (field.type === 'select' && field.options?.includes('account')) {
      const acc = accounts.find((a) => a.id === raw)
      return acc ? `${accountTypeLabel(acc.accountType)} ${acc.accountNumber}` : raw
    }
    if (field.type === 'currency') return formatCurrency(raw)
    return raw
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable in this context — ignore */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-evermont-border">
          <h2 className="text-lg font-bold text-evermont-dark">{action.label}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-evermont-muted" />
          </button>
        </div>

        {step === 'form' && action.shareable && (
          <div className="px-6 py-6">
            <p className="text-sm text-evermont-muted mb-5">{action.description}</p>
            <div className="rounded-xl border border-evermont-border bg-evermont-light p-4 space-y-3">
              {[
                { label: 'Evermont Member ID', value: 'EVM-4821-9037' },
                { label: 'Checking account', value: '****4821' },
                { label: 'Email', value: 'member@evermont.demo' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-evermont-muted">{row.label}</p>
                    <p className="text-sm font-semibold text-evermont-dark truncate">{row.value}</p>
                  </div>
                  <button
                    onClick={() => copy(row.value)}
                    className="p-2 rounded-lg border border-evermont-border hover:bg-white text-evermont-blue"
                    aria-label={`Copy ${row.label}`}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-gray-400">
              Sharing these details lets another Evermont member (or the demo) send money to you.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-lg bg-evermont-blue text-white font-semibold hover:bg-blue-800 transition"
            >
              Done
            </button>
          </div>
        )}

        {step === 'form' && !action.shareable && (
          <div className="px-6 py-6">
            <p className="text-sm text-evermont-muted mb-5">{action.description}</p>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {action.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`field-${field.name}`}>
                    {field.label}
                  </label>
                  {field.type === 'select' && field.options?.includes('account') ? (
                    <select
                      id={`field-${field.name}`}
                      value={values[field.name] ?? ''}
                      onChange={(e) => setValue(field.name, e.target.value)}
                      className="w-full px-4 py-2.5 border border-evermont-border rounded-lg text-sm focus:ring-2 focus:ring-evermont-gold focus:border-transparent"
                    >
                      <option value="">Select account…</option>
                      {accounts.map((a) => (
                        <AccountOption key={a.id} account={a} />
                      ))}
                    </select>
                  ) : field.type === 'select' ? (
                    <select
                      id={`field-${field.name}`}
                      value={values[field.name] ?? ''}
                      onChange={(e) => setValue(field.name, e.target.value)}
                      className="w-full px-4 py-2.5 border border-evermont-border rounded-lg text-sm focus:ring-2 focus:ring-evermont-gold focus:border-transparent"
                    >
                      <option value="">Select…</option>
                      {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'currency' ? (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-evermont-muted">$</span>
                      <input
                        id={`field-${field.name}`}
                        inputMode="decimal"
                        value={values[field.name] ?? ''}
                        onChange={(e) => setValue(field.name, e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        className="w-full pl-7 pr-4 py-2.5 border border-evermont-border rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-evermont-gold focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type}
                      value={values[field.name] ?? ''}
                      onChange={(e) => setValue(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 border border-evermont-border rounded-lg text-sm focus:ring-2 focus:ring-evermont-gold focus:border-transparent"
                    />
                  )}
                  {field.helpText && <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>}
                </div>
              ))}
            </div>
            <button
              onClick={handleContinue}
              className="mt-6 w-full py-3 rounded-lg bg-evermont-blue text-white font-semibold hover:bg-blue-800 transition"
            >
              Review
            </button>
            <p className="mt-3 text-[11px] text-center text-gray-400">
              Simulated in demo mode — no real funds will be moved.
            </p>
          </div>
        )}

        {step === 'confirm' && (
          <div className="px-6 py-6">
            <div className="rounded-xl border border-evermont-border overflow-hidden">
              <div className="bg-evermont-light px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-evermont-muted">
                  Confirm details
                </p>
              </div>
              {action.fields.map((field) => (
                <div key={field.name} className="flex items-center justify-between px-4 py-2.5 border-t border-evermont-border">
                  <span className="text-xs text-evermont-muted">{field.label}</span>
                  <span className="text-sm font-semibold text-evermont-dark text-right">
                    {labelFor(field, values[field.name] ?? '—')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-lg bg-evermont-blue text-white font-semibold hover:bg-blue-800 transition"
              >
                Confirm {action.label}
              </button>
              <button
                onClick={() => setStep('form')}
                className="w-full py-3 rounded-lg border border-evermont-border text-evermont-dark font-medium hover:bg-gray-50 transition"
              >
                Edit details
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="px-6 py-10 text-center">
            <span className="mx-auto mb-5 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </span>
            <h3 className="text-lg font-bold text-evermont-dark">{action.label} complete</h3>
            <p className="mt-2 text-sm text-evermont-muted leading-relaxed">
              {action.successNote}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <Check className="h-3 w-3" /> Simulated — no funds moved
            </span>
            <button
              onClick={onClose}
              className="mt-7 w-full py-3 rounded-lg bg-evermont-blue text-white font-semibold hover:bg-blue-800 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActionModal
