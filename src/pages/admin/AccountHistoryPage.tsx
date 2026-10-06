import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

interface LedgerRow {
  id: string
  reference_id: string
  description: string
  category: string
  entry_type: string
  amount: string
  debit?: string
  credit?: string
  status: string
  balance_after: string
  created_at: string
}

export const AccountHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [rows, setRows] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!supabase || !id) return

      try {
        const { data, error } = await supabase
          .from('ledger_entries')
          .select('*')
          .eq('account_id', id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setRows(data ?? [])
      } catch (error) {
        console.error('Failed to load account history', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return (
      <AdminLayout staffName="Administrator" staffRole="ADMIN">
        <div className="p-6">Loading account history...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout staffName="Administrator" staffRole="ADMIN">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Account history</h1>

        <div className="mb-4 text-sm text-red-600 font-semibold">
          SIMULATED DATA NOTICE: Prototype financial figures shown here are demo-only and not live customer records.
        </div>

        <div className="overflow-auto rounded-lg border border-evermont-border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Reference</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Deposit</th>
                <th className="p-3 text-left">Withdrawal</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="p-3">{row.reference_id}</td>
                  <td className="p-3">{row.description}</td>
                  <td className="p-3">{row.entry_type}</td>
                  <td className="p-3">{row.credit ? `$${Number(row.credit).toFixed(2)}` : '-'}</td>
                  <td className="p-3">{row.debit ? `$${Number(row.debit).toFixed(2)}` : '-'}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">${Number(row.balance_after).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
