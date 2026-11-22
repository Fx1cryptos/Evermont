import { Transaction } from '@/types'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { asLedgerDecimal, LedgerDirection, mapLedgerRow, MappedLedgerEntry } from '@/utils/ledgerMapping'

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
  is_demo?: boolean | null
  source?: 'ledger_entries' | 'transactions' | 'demo_ledger_entries'
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
  source: 'ledger_entries',
})


const mapTransactionRow = (row: Parameters<typeof mapLedgerRow>[0] & {user_id?: string; direction?: string}) => {
  const direction = String(row.direction || '').toLowerCase()
  const side = ['credit','deposit','in','incoming'].includes(direction) ? 'credit' :
    ['debit','withdrawal','out','outgoing'].includes(direction) ? 'debit' : undefined
  return {...toActivity(mapLedgerRow({...row, member_id:row.user_id, entry_type:row.entry_type || side})), source:'transactions' as const}
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

type DemoRow = Parameters<typeof mapLedgerRow>[0] & {is_demo?: boolean | null}

function demoActivity(row: DemoRow): LedgerActivity {
  const entry = toActivity(mapLedgerRow(row))
  const token = (entry.entryType + ' ' + entry.category).toLowerCase()
  const transfer = /transfer|wire|ach/.test(token) || /\btransfer\b/i.test(entry.description)
  if (transfer) {
    const debit = asLedgerDecimal(row.debit)
    const credit = asLedgerDecimal(row.credit)
    const amount = asLedgerDecimal(row.amount)
    const nonzero = (value: string | null) => value != null && /[1-9]/.test(value)
    const side = nonzero(debit) === nonzero(credit) ? 'unknown' : nonzero(debit) ? 'debit' : 'credit'
    entry.direction = entry.type = side
    entry.displayAmount = (side === 'debit' ? debit : side === 'credit' ? credit : amount ?? debit ?? credit)?.replace(/^-/,'') ?? ''
  }
  return {...entry, isSample:true, is_demo:row.is_demo, source:'demo_ledger_entries'}
}

async function readDemoLedger(memberId: string, accountIds: string[], filters: TransactionFilters): Promise<LedgerActivity[]> {
  const rows: LedgerActivity[] = []
  const allowed = new Set(accountIds)
  for (let offset = 0;;) {
    const query = supabase.from('demo_ledger_entries').select('*',{count:'exact'})
      .eq('member_id',memberId).in('account_id',accountIds)
      .order('created_at',{ascending:false}).order('id',{ascending:false})
    if (filters.status) query.eq('status',filters.status)
    if (filters.startDate) query.gte('created_at',filters.startDate.toISOString())
    if (filters.endDate) query.lte('created_at',filters.endDate.toISOString())
    const {data,error,count} = await query.range(offset,offset+199)
    if (error || !data || data.some(row=>row.member_id !== memberId || !allowed.has(row.account_id))) {
      throw new Error('Unable to load authorized demo activity.')
    }
    rows.push(...data.map(demoActivity))
    offset += data.length
    if (!data.length || (count == null ? data.length < 200 : offset >= count)) return rows
  }
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

  /** Member activity views only. Financial reports and insights use getTransactions. */
  async getMemberActivity(expectedMember: string, filters: TransactionFilters = {}): Promise<LedgerActivity[]> {
    const {data: auth,error: authError} = await supabase.auth.getUser()
    if (authError || !auth.user || auth.user.id !== expectedMember) throw new Error('Unable to verify member session.')
    const memberId = auth.user.id
    const {data: accounts,error} = await supabase.from('accounts').select('id,user_id').eq('user_id',memberId)
    if (error || !accounts || accounts.some(account => account.user_id !== memberId)) throw new Error('Unable to verify account access.')
    const owned = new Set<string>(accounts.map(account => account.id))
    if (filters.accountId && !owned.has(filters.accountId)) throw new Error('Unable to verify account access.')
    const allowedIds = filters.accountId ? [filters.accountId] : [...owned]
    if (!allowedIds.length) return []

    const unbounded = {...filters,limit:undefined,offset:undefined,type:undefined}
    const [recorded, samples] = await Promise.all([
      this.getTransactions(memberId,unbounded),
      readDemoLedger(memberId,allowedIds,unbounded),
    ])
    if (recorded.some(row=>!owned.has(row.accountId))) throw new Error('Unable to verify transaction ownership.')
    const references = new Set(recorded.filter(row=>row.referenceId).map(row=>JSON.stringify([row.accountId,row.referenceId])))
    const uniqueSamples = samples.filter(row=>!row.referenceId || !references.has(JSON.stringify([row.accountId,row.referenceId])))
    return applyWindow(mergeActivity(recorded,uniqueSamples).filter(row=>!filters.type || row.direction === filters.type),filters)
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
