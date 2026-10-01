import React from 'react'

interface AdminTableProps {
  columns: Array<{
    key: string
    label: string
    render?: (value: unknown, row: unknown) => React.ReactNode
  }>
  data: unknown[]
  isLoading?: boolean
  emptyMessage?: string
}

export const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-evermont-border p-6 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-evermont-border p-6 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-evermont-border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-evermont-border bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-evermont-border hover:bg-gray-50">
              {columns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key]
                return (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-600">
                    {col.render ? col.render(value, row) : String(value)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
