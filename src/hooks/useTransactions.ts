import { useEffect, useState } from 'react'
import { Transaction } from '@/types'
import { transactionService, TransactionFilters } from '@/services/transactionService'

export const useTransactions = (userId: string | undefined, filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await transactionService.getTransactions(userId, filters)
        setTransactions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId, filters])

  return { transactions, loading, error }
}
