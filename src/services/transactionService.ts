import { Transaction } from '@/types'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Demo transactions (same as in accountService)
const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    accountId: '1',
    type: 'debit',
    amount: '45.99',
    description: 'Grocery Store - Whole Foods',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    accountId: '1',
    type: 'credit',
    amount: '2500.00',
    description: 'Direct Deposit - Salary',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    accountId: '1',
    type: 'debit',
    amount: '1200.00',
    description: 'Rent Payment - Monthly',
    status: 'completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export interface TransactionFilters {
  accountId?: string
  type?: 'debit' | 'credit'
  status?: 'pending' | 'completed' | 'failed'
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export const transactionService = {
  async getTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)

      if (filters.accountId) {
        query = query.eq('account_id', filters.accountId)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
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

      query = query.order('created_at', { ascending: false })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Failed to fetch transactions from Supabase:', error)
        return DEMO_TRANSACTIONS.slice(
          filters.offset || 0,
          (filters.offset || 0) + (filters.limit || 10)
        )
      }

      return (
        data?.map((txn) => ({
          id: txn.id,
          accountId: txn.account_id,
          type: txn.type,
          amount: txn.amount,
          description: txn.description,
          status: txn.status,
          createdAt: txn.created_at,
          completedAt: txn.completed_at,
        })) || []
      )
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return DEMO_TRANSACTIONS
    }
  },

  async getTransactionById(transactionId: string, userId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('Failed to fetch transaction:', error)
        return DEMO_TRANSACTIONS.find((txn) => txn.id === transactionId) || null
      }

      return data
        ? {
            id: data.id,
            accountId: data.account_id,
            type: data.type,
            amount: data.amount,
            description: data.description,
            status: data.status,
            createdAt: data.created_at,
            completedAt: data.completed_at,
          }
        : null
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return DEMO_TRANSACTIONS.find((txn) => txn.id === transactionId) || null
    }
  },

  async createTransfer(
    userId: string,
    sourceAccountId: string,
    recipientName: string,
    amount: string,
    description: string
  ): Promise<Transaction> {
    const id = uuidv4()
    const now = new Date().toISOString()

    try {
      const { data, error } = await supabase.from('transactions').insert([
        {
          id,
          user_id: userId,
          account_id: sourceAccountId,
          type: 'debit',
          amount,
          description: `Transfer to ${recipientName}: ${description}`,
          status: 'completed',
          created_at: now,
          completed_at: now,
        },
      ])

      if (error) {
        console.warn('Failed to create transfer in Supabase:', error)
      }

      return {
        id,
        accountId: sourceAccountId,
        type: 'debit',
        amount,
        description: `Transfer to ${recipientName}: ${description}`,
        status: 'completed',
        createdAt: now,
        completedAt: now,
      }
    } catch (error) {
      console.error('Error creating transfer:', error)
      throw new Error('Failed to create transfer')
    }
  },
}
