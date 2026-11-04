import { Transaction } from '@/types'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { LEDGER_ENTRY_COLUMNS, LedgerDirection, mapLedgerRow, MappedLedgerEntry } from '@/utils/ledgerMapping'

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

const applyWindow = (rows: LedgerActivity[], filters: TransactionFilters) => {
  if (!filters.limit || filters.limit < 1) return rows
  const offset = filters.offset && filters.offset > 0 ? filters.offset : 0
  return rows.slice(offset, offset + filters.limit)
}

export const transactionService = {
  /**
   * Only posted ledger entries are returned in member-facing transaction history.
   */
  async getTransactions(userId: string, filters: TransactionFilters = {}): Promise<LedgerActivity[]> {
    if (!userId || !isSupabaseConfigured) return []

    try {
      let ledgerQuery = supabase
        .from('ledger_entries')
        .select(LEDGER_ENTRY_COLUMNS)
        .eq('member_id', userId)

      if (filters.accountId) {
        ledgerQuery = ledgerQuery.eq('account_id', filters.accountId)
      }
      if (filters.status) {
        ledgerQuery = ledgerQuery.eq('status', filters.status)
      }
      if (filters.startDate) {
        const start = filters.startDate.toISOString()
        ledgerQuery = ledgerQuery.gte('created_at', start)
      }
      if (filters.endDate) {
        const end = filters.endDate.toISOString()
        ledgerQuery = ledgerQuery.lte('created_at', end)
      }

      const { data: ledgerData, error: ledgerError } = await ledgerQuery

      if (ledgerError) {
        console.error('Failed to fetch ledger activity')
        throw new Error('Unable to load transaction history.')
      }

      let rows = ((ledgerData || []) as Parameters<typeof mapLedgerRow>[0][]).map(row => toActivity(mapLedgerRow(row)))

      rows.sort((a, b) => {
        const dateOrder = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return dateOrder || b.id.localeCompare(a.id)
      })

      if (filters.type) rows = rows.filter(row => row.direction === filters.type)
      return applyWindow(rows, filters)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unable to load transaction history.') throw error
      console.error('Error fetching transaction history')
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
