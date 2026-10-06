import { Account } from '@/types'
import { supabase } from '@/lib/supabase'

// Demo data for accounts when Supabase is not configured
const DEMO_ACCOUNTS: Account[] = [
  {
    id: '1',
    userId: 'demo-user',
    accountNumber: '****2891',
    accountType: 'checking',
    balance: '5250.00',
    currency: 'USD',
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'demo-user',
    accountNumber: '****7429',
    accountType: 'savings',
    balance: '12500.00',
    currency: 'USD',
    status: 'active',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const accountService = {
  async getAccounts(userId: string): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Failed to fetch accounts from Supabase:', error)
        return DEMO_ACCOUNTS
      }

      return (
        data?.map((acc) => ({
          id: acc.id,
          userId: acc.user_id,
          accountNumber: acc.account_number,
          accountType: acc.account_type,
          balance: acc.balance,
          currency: acc.currency,
          status: acc.status,
          createdAt: acc.created_at,
          updatedAt: acc.updated_at,
        })) || DEMO_ACCOUNTS
      )
    } catch (error) {
      console.error('Error fetching accounts:', error)
      return DEMO_ACCOUNTS
    }
  },

  async getAccountById(accountId: string, userId: string): Promise<Account | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('Failed to fetch account:', error)
        return DEMO_ACCOUNTS.find((acc) => acc.id === accountId) || null
      }

      return data
        ? {
            id: data.id,
            userId: data.user_id,
            accountNumber: data.account_number,
            accountType: data.account_type,
            balance: data.balance,
            currency: data.currency,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : null
    } catch (error) {
      console.error('Error fetching account:', error)
      return DEMO_ACCOUNTS.find((acc) => acc.id === accountId) || null
    }
  },
}
