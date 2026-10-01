import { useEffect, useState } from 'react'
import { Account } from '@/types'
import { accountService } from '@/services/accountService'

export const useAccounts = (userId: string | undefined) => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchAccounts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await accountService.getAccounts(userId)
        setAccounts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts')
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [userId])

  return { accounts, loading, error }
}
