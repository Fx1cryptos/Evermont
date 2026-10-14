import { Transaction } from '@/types'
import { supabase } from '@/lib/supabase'

export interface TransactionFilters {
  accountId?: string
  type?: 'debit' | 'credit'
  status?: 'pending' | 'completed' | 'failed'
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

const mapLedgerEntry = (entry: {
  id: string
  account_id: string
  entry_type: string
  amount: string | number
  description: string
  category?: string
  status: string
  balance_after?: string | number | null
  created_at: string
}): Transaction => ({
  id: entry.id,
  accountId: entry.account_id,
  type:
    entry.entry_type === 'withdrawal' || entry.entry_type === 'fee'
      ? 'debit'
      : 'credit',
  amount: String(entry.amount),
  description: entry.description,
  category: entry.category,
  balanceAfter: entry.balance_after == null ? undefined : String(entry.balance_after),
  status: entry.status === 'reversed' ? 'failed' : entry.status === 'pending' ? 'pending' : entry.status === 'failed' ? 'failed' : 'completed',
  createdAt: entry.created_at,
  completedAt: entry.status === 'completed' ? entry.created_at : null,
})

export const transactionService = {
  async getTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<Transaction[]> {
    let query = supabase
      .from('ledger_entries')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })

    if (filters.accountId) {
      query = query.eq('account_id', filters.accountId)
    }

    if (filters.type) {
      const entryTypes =
        filters.type === 'debit'
          ? ['withdrawal', 'fee']
          : ['deposit', 'transfer', 'interest', 'opening_balance']

      query = query.in('entry_type', entryTypes)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }

    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch ledger entries:', error)
      throw new Error('Unable to load transaction history.')
    }

    return (data || []).map(mapLedgerEntry)
  },

  async getTransactionById(
    transactionId: string,
    userId: string
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('id', transactionId)
      .eq('member_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }

      console.error('Failed to fetch transaction:', error)
      throw new Error('Unable to load transaction.')
    }

    return data ? mapLedgerEntry(data) : null
  },

  async createTransfer(
    userId: string,
    sourceAccountId: string,
    recipientName: string,
    amount: string,
    description: string
  ): Promise<Transaction> {
    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Transfer amount must be greater than zero.')
    }

    const referenceId = `TRF-${crypto.randomUUID()}`

    const { error } = await supabase.rpc('create_ledger_entry', {
      p_account_id: sourceAccountId,
      p_member_id: userId,
      p_reference_id: referenceId,
      p_entry_type: 'withdrawal',
      p_amount: numericAmount,
      p_description: `Transfer to ${recipientName}: ${description}`,
      p_category: 'transfer',
      p_status: 'completed',
    })

    if (error) {
      console.error('Failed to create transfer:', error)
      throw new Error('Transfer could not be completed.')
    }

    return {
      id: referenceId,
      accountId: sourceAccountId,
      type: 'debit',
      amount: numericAmount.toFixed(2),
      description: `Transfer to ${recipientName}: ${description}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }
  },
}
