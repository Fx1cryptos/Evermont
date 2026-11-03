import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ledgerService, type LedgerEntry } from '@/services/ledgerService'

const money = (value: string | null) => value == null
  ? '—'
  : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))

export const AccountHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [rows, setRows] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false)
        setError('Account not found.')
        return
      }

      try {
        setRows(await ledgerService.getAccountHistory(id))
      } catch {
        console.error('Failed to load account history')
        setError('Account history could not be loaded from the ledger.')
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
          Prototype notice: this page reads ledger entries for the selected account. It does not move money and is not a claim of chartered-bank deposit insurance or live settlement.
        </div>
        {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}

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
              {!rows.length && <tr><td className="p-6 text-slate-500" colSpan={8}>No ledger entries are posted for this account.</td></tr>}
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</td>
                  <td className="p-3">{row.referenceId || '—'}</td>
                  <td className="p-3">{row.description}</td>
                  <td className="p-3">{row.entryType || '—'}</td>
                  <td className="p-3">{row.direction === 'credit' ? money(row.displayAmount) : '—'}</td>
                  <td className="p-3">{row.direction === 'debit' ? money(row.displayAmount) : '—'}</td>
                  <td className="p-3">{row.status || '—'}</td>
                  <td className="p-3">{money(row.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
