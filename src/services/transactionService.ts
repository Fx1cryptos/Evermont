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
  isSample?: boolean
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
  isSample: false,
})


const mapTransactionRow = (row: Parameters<typeof mapLedgerRow>[0] & {user_id?: string; direction?: string}) => {
  const direction = String(row.direction || '').toLowerCase()
  const side = ['credit','deposit','in','incoming'].includes(direction) ? 'credit' :
    ['debit','withdrawal','out','outgoing'].includes(direction) ? 'debit' : undefined
  return toActivity(mapLedgerRow({...row, member_id:row.user_id, entry_type:row.entry_type || side}))
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
    const time = (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)
    return time || b.id.localeCompare(a.id)
  })
}

const applyWindow = (rows: LedgerActivity[], filters: TransactionFilters) => {
  const offset = filters.offset && filters.offset > 0 ? filters.offset : 0
  return rows.slice(offset, filters.limit && filters.limit > 0 ? offset + filters.limit : undefined)
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
    if (!userId || !isSupabaseConfigured) throw new Error('Sign in to load transaction history.')

    try {
      // Use the member JWT and owner predicate on every page. Optional columns differ across
      // historical records; their absence must not invalidate the entire projection.
      if (filters.accountId) {
        const owned = await supabase.from('accounts').select('id,user_id').eq('user_id',userId).eq('id',filters.accountId).maybeSingle()
        if (owned.error || owned.data?.id !== filters.accountId || owned.data?.user_id !== userId) throw new Error('Unable to load transaction history.')
      }
      const read = async (table: 'ledger_entries' | 'transactions') => {
        const entries: LedgerActivity[] = []
        let offset = 0
        const cap = filters.limit && !filters.type ? Math.max(0, filters.offset || 0) + filters.limit : Infinity
        while (offset < cap) {
          const size = Math.min(200, cap-offset)
          const query = supabase.from(table).select('*',{count:'exact'})
            .eq(table === 'ledger_entries' ? 'member_id' : 'user_id',userId)
            .order('created_at',{ascending:false}).order('id',{ascending:false})
          if (filters.accountId) query.eq('account_id',filters.accountId)
          if (filters.status) query.eq('status',filters.status)
          if (filters.startDate) query.gte('created_at',filters.startDate.toISOString())
          if (filters.endDate) query.lte('created_at',filters.endDate.toISOString())
          const {data,error,count} = await query.range(offset,offset+size-1)
          if (error) {
            if (table === 'transactions' && ['42P01','PGRST205'].includes(error.code)) break
            throw new Error('Unable to load transaction history.')
          }
          if (!data?.length) break
          for (const row of data) entries.push(table === 'ledger_entries' ? toActivity(mapLedgerRow(row)) : mapTransactionRow(row))
          offset += data.length
          if (count == null ? data.length < size : offset >= count) break
        }
        return entries
      }
      const [ledger,transactions] = await Promise.all([read('ledger_entries'),read('transactions')])
      if ([...ledger,...transactions].some(row => row.memberId !== userId)) throw new Error('Unable to load transaction history.')
      let rows = mergeActivity(ledger, transactions)
      if (filters.type) rows = rows.filter((row) => row.direction === filters.type)
      return applyWindow(rows, filters)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unable to load transaction history.') throw error
      console.error('Error fetching ledger entries')
      throw new Error('Unable to load transaction history.')
    }
  },

  /** Sample records are read-only and intentionally kept separate from genuine member activity. */
  async getSampleTransactions(userId: string, accountIds: string[]): Promise<LedgerActivity[]> {
    if (!userId || !accountIds.length || !isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('demo_ledger_entries')
      .select(LEDGER_ENTRY_COLUMNS)
      .eq('member_id', userId)
      .in('account_id', accountIds)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
    if (error) {
      console.error('Failed to fetch sample ledger entries')
      throw new Error('Unable to load sample transaction history.')
    }
    return ((data || []) as Parameters<typeof mapLedgerRow>[0][]).map((row) => ({ ...toActivity(mapLedgerRow(row)), isSample: true }))
  },

  async getTransactionById(transactionId: string, userId: string): Promise<LedgerActivity | null> {
    if (!transactionId || !userId || !isSupabaseConfigured) throw new Error('Unable to load transaction.')

    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('id', transactionId)
      .eq('member_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch ledger entry')
      throw new Error('Unable to load transaction.')
    }

    if (data && data.member_id !== userId) throw new Error('Unable to load transaction.')
    if (data) return toActivity(mapLedgerRow(data))
    const legacy = await supabase.from('transactions').select('*').eq('id',transactionId).eq('user_id',userId).maybeSingle()
    if (legacy.error && !['42P01','PGRST205'].includes(legacy.error.code)) throw new Error('Unable to load transaction.')
    if (legacy.data && legacy.data.user_id !== userId) throw new Error('Unable to load transaction.')
    return legacy.data ? mapTransactionRow(legacy.data) : null
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
