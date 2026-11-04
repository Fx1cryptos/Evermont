import { Transaction } from '@/types'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { asLedgerDecimal, LEDGER_ENTRY_COLUMNS, LedgerDirection, mapLedgerRow, MappedLedgerEntry } from '@/utils/ledgerMapping'

export interface TransactionFilters {
  accountId?: string
  type?: LedgerDirection
  status?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface LedgerActivity extends Transaction {
  memberId: string
  referenceId: string
  entryType: string
  category: string
  debit: string | null
  credit: string | null
  balanceAfter: string | null
  direction: LedgerDirection
  displayAmount: string
}

const toActivity = (entry: MappedLedgerEntry): LedgerActivity => ({
  id: entry.id,
  accountId: entry.accountId,
  memberId: entry.memberId,
  type: entry.direction,
  direction: entry.direction,
  amount: entry.amount,
  displayAmount: entry.displayAmount,
  description: entry.description,
  status: entry.status,
  createdAt: entry.createdAt,
  completedAt: entry.status === 'completed' ? entry.createdAt : null,
  referenceId: entry.referenceId,
  entryType: entry.entryType,
  category: entry.category,
  debit: entry.debit,
  credit: entry.credit,
  balanceAfter: entry.balanceAfter,
})

const TRANSACTION_COLUMNS = 'id,user_id,account_id,amount,description,status,created_at,direction'

const mapTransactionRow = (row: {
  id?: string | null
  user_id?: string | null
  account_id?: string | null
  amount?: string | number | null
  description?: string | null
  status?: string | null
  created_at?: string | null
  direction?: string | null
}): LedgerActivity => {
  const amount = asLedgerDecimal(row.amount)
  const rawDirection = String(row.direction || '').trim().toLowerCase()
  const direction: LedgerDirection = ['debit', 'withdrawal', 'out', 'outgoing'].includes(rawDirection) || Boolean(amount?.startsWith('-'))
    ? 'debit'
    : 'credit'
  const display = amount ? amount.replace(/^-/, '') : '0.00'
  return {
    id: String(row.id || ''),
    accountId: String(row.account_id || ''),
    memberId: String(row.user_id || ''),
    type: direction,
    direction,
    amount: amount ?? display,
    displayAmount: display,
    description: row.description ? String(row.description) : '',
    status: row.status ? String(row.status) : '',
    createdAt: row.created_at ? String(row.created_at) : '',
    completedAt: String(row.status || '').toLowerCase() === 'completed' && row.created_at ? String(row.created_at) : null,
    referenceId: '',
    entryType: direction === 'credit' ? 'deposit' : 'withdrawal',
    category: '',
    debit: direction === 'debit' ? display : null,
    credit: direction === 'credit' ? display : null,
    balanceAfter: null,
  }
}

/** Ledger rows win when the same id is present in both tables. */
export function mergeActivity(ledger: LedgerActivity[], transactions: LedgerActivity[]): LedgerActivity[] {
  const byId = new Map<string, LedgerActivity>()
  for (const row of transactions) {
    if (row.id) byId.set(row.id, row)
  }
  for (const row of ledger) {
    if (row.id) byId.set(row.id, row)
  }
  return [...byId.values()].sort((a, b) => {
    const time = b.createdAt.localeCompare(a.createdAt)
    return time || b.id.localeCompare(a.id)
  })
}

const applyWindow = (rows: LedgerActivity[], filters: TransactionFilters) => {
  if (!filters.limit || filters.limit < 1) return rows
  const offset = filters.offset && filters.offset > 0 ? filters.offset : 0
  return rows.slice(offset, offset + filters.limit)
}

export function isTransferActivity(row: Pick<LedgerActivity, 'entryType' | 'category' | 'direction'>): boolean {
  const type = row.entryType.trim().toLowerCase()
  const category = row.category.trim().toLowerCase()
  if (type === 'transfer' || type.includes('transfer') || type === 'wire' || type === 'ach') return true
  return category.includes('transfer') && row.direction === 'debit'
}

export function isDepositActivity(row: Pick<LedgerActivity, 'entryType' | 'direction'>): boolean {
  const type = row.entryType.trim().toLowerCase()
  return row.direction === 'credit' || type === 'deposit' || type === 'interest' || type === 'opening_balance' || type === 'inheritance'
}

export const transactionService = {
  /**
   * Member activity comes from public.ledger_entries and public.transactions.
   * Where an id exists in both, the ledger row is kept. An empty result stays empty.
   */
  async getTransactions(userId: string, filters: TransactionFilters = {}): Promise<LedgerActivity[]> {
    if (!userId || !isSupabaseConfigured) return []

    try {
      const ledgerByMember = supabase
        .from('ledger_entries')
        .select(LEDGER_ENTRY_COLUMNS)
        .eq('member_id', userId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
      const accountIdsQuery = supabase.from('accounts').select('id').eq('user_id', userId)
      const transactionQuery = supabase
        .from('transactions')
        .select(TRANSACTION_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters.accountId) {
        ledgerByMember.eq('account_id', filters.accountId)
        transactionQuery.eq('account_id', filters.accountId)
      }
      if (filters.status) {
        ledgerByMember.eq('status', filters.status)
        transactionQuery.eq('status', filters.status)
      }
      if (filters.startDate) {
        const start = filters.startDate.toISOString()
        ledgerByMember.gte('created_at', start)
        transactionQuery.gte('created_at', start)
      }
      if (filters.endDate) {
        const end = filters.endDate.toISOString()
        ledgerByMember.lte('created_at', end)
        transactionQuery.lte('created_at', end)
      }

      const [ledgerResult, accountResult, transactionResult] = await Promise.all([
        ledgerByMember,
        filters.accountId ? Promise.resolve({ data: [{ id: filters.accountId }], error: null }) : accountIdsQuery,
        transactionQuery,
      ])
      if (ledgerResult.error) {
        console.error('Failed to fetch ledger entries')
        throw new Error('Unable to load transaction history.')
      }

      const accountIds = ((accountResult.data || []) as Array<{ id?: string }>).map((row) => row.id).filter((id): id is string => Boolean(id))
      let ledgerRows = ((ledgerResult.data || []) as Parameters<typeof mapLedgerRow>[0][])
      if (!filters.accountId && accountIds.length) {
        const byAccount = await supabase
          .from('ledger_entries')
          .select(LEDGER_ENTRY_COLUMNS)
          .in('account_id', accountIds)
          .order('created_at', { ascending: false })
        if (!byAccount.error && byAccount.data) ledgerRows = ledgerRows.concat(byAccount.data as Parameters<typeof mapLedgerRow>[0][])
      }

      const ledger = ledgerRows.map((row) => toActivity(mapLedgerRow(row)))
      const transactions = transactionResult.error ? [] : ((transactionResult.data || []) as Parameters<typeof mapTransactionRow>[0][]).map(mapTransactionRow)
      let rows = mergeActivity(ledger, transactions)
      if (filters.type) rows = rows.filter((row) => row.direction === filters.type)
      return applyWindow(rows, filters)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unable to load transaction history.') throw error
      console.error('Error fetching ledger entries')
      throw new Error('Unable to load transaction history.')
    }
  },

  async getTransactionById(transactionId: string, userId: string): Promise<LedgerActivity | null> {
    if (!transactionId || !userId || !isSupabaseConfigured) return null

    const { data, error } = await supabase
      .from('ledger_entries')
      .select(LEDGER_ENTRY_COLUMNS)
      .eq('id', transactionId)
      .eq('member_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch ledger entry')
      throw new Error('Unable to load transaction.')
    }

    return data ? toActivity(mapLedgerRow(data)) : null
  },

  /**
   * Browser code must not insert a completed transfer or change a balance.
   * Posting belongs to the database function public.create_ledger_entry.
   */
  async createTransfer(
    userId: string,
    sourceAccountId: string,
    recipientName: string,
    amount: string,
    description: string
  ): Promise<Transaction> {
    void userId
    void sourceAccountId
    void recipientName
    void amount
    void description
    throw new Error('Transfers are not posted from the browser. No ledger entry was created.')
  },
}
