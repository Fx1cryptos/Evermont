import type { LedgerActivity } from '@/services/transactionService'
import { asLedgerDecimal } from '@/utils/ledgerMapping'

export function activityDescription(row: LedgerActivity) {
  const description = row.description.replace(/^(?:\s*\[DEMO\]\s*[-:–—]?\s*)+/i,'').trim()
  return description || 'Ledger entry'
}

export function activityMoney(value: unknown, currency: string | undefined) {
  const decimal = asLedgerDecimal(value)
  if (!decimal || !currency || !/^[A-Z]{3}$/.test(currency)) return 'Unavailable'
  // Intl.NumberFormat in supported browsers accepts exact decimal strings.
  const format = new Intl.NumberFormat('en-US',{style:'currency',currency}).format as unknown as (amount: string) => string
  return format(decimal)
}

export function activityDate(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('en-US',{
    month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',
  }) : 'Date unavailable'
}

export const activityDisclosure = 'This activity includes demonstration records for illustration. They do not represent real money movement.'
