import { supabase } from '@/lib/supabase'

export interface LedgerEntry {
  id: string
  accountId: string
  memberId: string
  referenceId: string
  entryType: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest' | 'opening_balance'
  amount: string
  debit?: string
  credit?: string
  description: string
  category: string
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  balanceAfter: string
  createdAt: string
  updatedAt: string
}

export interface CreateLedgerParams {
  accountId: string
  memberId: string
  referenceId: string
  entryType: 'deposit' | 'withdrawal' | 'transfer' | 'fee' | 'interest' | 'opening_balance'
  amount: string
  description: string
  category: string
  status?: 'pending' | 'completed' | 'failed' | 'reversed'
  debit?: string
  credit?: string
}

export const ledgerService = {
  async createLedgerEntry(params: CreateLedgerParams): Promise<LedgerEntry> {
    const { data, error } = await supabase.rpc('create_ledger_entry', {
      p_account_id: params.accountId,
      p_member_id: params.memberId,
      p_reference_id: params.referenceId,
      p_entry_type: params.entryType,
      p_amount: params.amount,
      p_description: params.description,
      p_category: params.category,
      p_status: params.status ?? 'completed',
    })

    if (error) throw error
    if (!data) throw new Error('Ledger entry was not created')

    return {
      id: data.reference_id,
      accountId: data.account_id,
      memberId: data.member_id,
      referenceId: data.reference_id,
      entryType: params.entryType,
      amount: params.amount,
      debit: params.debit,
      credit: params.credit,
      description: params.description,
      category: params.category,
      status: params.status ?? 'completed',
      balanceAfter: data.balance_after,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },

  async getAccountHistory(accountId: string): Promise<LedgerEntry[]> {
    if (!supabase) return []

    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((entry) => ({
      id: entry.id,
      accountId: entry.account_id,
      memberId: entry.member_id,
      referenceId: entry.reference_id,
      entryType: entry.entry_type,
      amount: entry.amount,
      debit: entry.debit,
      credit: entry.credit,
      description: entry.description,
      category: entry.category,
      status: entry.status,
      balanceAfter: entry.balance_after,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }))
  },
}
