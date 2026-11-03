/**
 * Maps a public.ledger_entries row into the activity shown to members and admins.
 *
 * Direction comes from the stored classification, then from the posted debit and
 * credit columns, then from category:
 * - deposits, interest, and opening balances are credits
 * - withdrawals, fees, and outgoing transfers are debits
 *
 * The figure shown is a stored ledger value (matching side, opposite side, or
 * amount). Nothing here recomputes balance_after or invents a transaction.
 */

export type LedgerDirection = 'debit' | 'credit'

export interface LedgerRowInput {
  id?: string | null
  account_id?: string | null
  member_id?: string | null
  reference_id?: string | null
  entry_type?: string | null
  amount?: string | number | null
  debit?: string | number | null
  credit?: string | number | null
  description?: string | null
  category?: string | null
  status?: string | null
  balance_after?: string | number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface MappedLedgerEntry {
  id: string
  accountId: string
  memberId: string
  referenceId: string
  entryType: string
  amount: string
  debit: string | null
  credit: string | null
  description: string
  category: string
  status: string
  balanceAfter: string | null
  createdAt: string
  updatedAt: string
  direction: LedgerDirection
  displayAmount: string
}

const CREDIT_ENTRY_TYPES = new Set(['deposit', 'interest', 'opening_balance'])
const DEBIT_ENTRY_TYPES = new Set(['withdrawal', 'fee', 'transfer'])
const CREDIT_CATEGORIES = new Set(['deposit', 'interest', 'opening_balance'])
const DEBIT_CATEGORIES = new Set(['withdrawal', 'fee', 'transfer', 'transfer-out', 'ach'])

export const LEDGER_ENTRY_COLUMNS =
  'id,account_id,member_id,reference_id,entry_type,amount,debit,credit,description,category,status,balance_after,created_at,updated_at'

/** Preserve a stored decimal string. Reject values that are not ledger numbers. */
export function asLedgerDecimal(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  const raw = String(value).trim()
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return null
  return raw
}

export function isPositiveLedgerAmount(value: string | null): boolean {
  if (!value) return false
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0
}

function magnitude(value: string): string {
  return value.startsWith('-') ? value.slice(1) : value
}

export function classifyLedgerEntry(row: LedgerRowInput): { direction: LedgerDirection; displayAmount: string } {
  const entryType = (row.entry_type || '').trim().toLowerCase()
  const category = (row.category || '').trim().toLowerCase()
  const debit = asLedgerDecimal(row.debit)
  const credit = asLedgerDecimal(row.credit)
  const amount = asLedgerDecimal(row.amount)

  let direction: LedgerDirection | null = null
  if (CREDIT_ENTRY_TYPES.has(entryType)) direction = 'credit'
  else if (DEBIT_ENTRY_TYPES.has(entryType)) direction = 'debit'
  else if (isPositiveLedgerAmount(credit) && !isPositiveLedgerAmount(debit)) direction = 'credit'
  else if (isPositiveLedgerAmount(debit) && !isPositiveLedgerAmount(credit)) direction = 'debit'
  else if (CREDIT_CATEGORIES.has(category)) direction = 'credit'
  else if (DEBIT_CATEGORIES.has(category)) direction = 'debit'

  // An unclassified row is not presented as a deposit.
  const resolved: LedgerDirection = direction ?? 'debit'
  const matchingSide = resolved === 'credit' ? credit : debit
  const otherSide = resolved === 'credit' ? debit : credit
  const stored =
    (isPositiveLedgerAmount(amount) ? amount : null) ||
    (isPositiveLedgerAmount(matchingSide) ? matchingSide : null) ||
    (isPositiveLedgerAmount(otherSide) ? otherSide : null)

  return {
    direction: resolved,
    displayAmount: stored ? magnitude(stored) : '0.00',
  }
}

export function mapLedgerRow(row: LedgerRowInput): MappedLedgerEntry {
  const classification = classifyLedgerEntry(row)
  const amount = asLedgerDecimal(row.amount)
  const status = (row.status || '').trim()
  return {
    id: String(row.id || ''),
    accountId: String(row.account_id || ''),
    memberId: String(row.member_id || ''),
    referenceId: row.reference_id ? String(row.reference_id) : '',
    entryType: row.entry_type ? String(row.entry_type) : '',
    amount: amount ?? classification.displayAmount,
    debit: asLedgerDecimal(row.debit),
    credit: asLedgerDecimal(row.credit),
    description: row.description ? String(row.description) : '',
    category: row.category ? String(row.category) : '',
    status,
    balanceAfter: asLedgerDecimal(row.balance_after),
    createdAt: row.created_at ? String(row.created_at) : '',
    updatedAt: row.updated_at ? String(row.updated_at) : '',
    direction: classification.direction,
    displayAmount: classification.displayAmount,
  }
}

export function sumLedgerAmounts(values: Array<string | null | undefined>): number {
  const cents = values.reduce((sum, value) => {
    const decimal = asLedgerDecimal(value)
    if (!decimal) return sum
    const negative = decimal.startsWith('-')
    const [whole, fraction = ''] = decimal.replace('-', '').split('.')
    const asCents = Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2))
    if (!Number.isSafeInteger(asCents)) return sum
    return sum + (negative ? -asCents : asCents)
  }, 0)
  return cents / 100
}
