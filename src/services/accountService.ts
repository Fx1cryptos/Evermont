import { Account } from '@/types'
import { supabase } from '@/lib/supabase'
import { DEMO_ACCOUNTS, DEMO_USER_ID } from '@/data/demoMember'

export const accountService = {
  async getAccounts(userId: string): Promise<Account[]> {
    // Demo member data is simulated client-side; never query Supabase for it.
    if (userId === DEMO_USER_ID) return DEMO_ACCOUNTS
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
    // Demo member data is simulated client-side; never query Supabase for it.
    if (userId === DEMO_USER_ID) {
      return DEMO_ACCOUNTS.find((acc) => acc.id === accountId) || null
    }
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
