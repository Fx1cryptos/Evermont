import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { supabase } from '@/lib/supabase'

interface MemberAccountRow {
  id: string
  account_type: string
  account_number: string
  balance: string
  status: string
  created_at: string
}

interface MemberDetailState {
  id: string
  email: string
  first_name: string
  last_name: string
  status: string
  created_at: string
  accounts: MemberAccountRow[]
}

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<MemberDetailState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!supabase || !id) return

      try {
        const { data: memberData, error: memberError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (memberError || !memberData) throw memberError ?? new Error('Member not found')

        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', id)

        setMember({
          id: memberData.id,
          email: memberData.email,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          status: 'active',
          created_at: memberData.created_at,
          accounts: (accountData ?? []).map((account) => ({
            id: account.id,
            account_type: account.account_type,
            account_number: account.account_number,
            balance: account.balance,
            status: account.status,
            created_at: account.created_at,
          })),
        })
      } catch (error) {
        console.error('Failed to load member detail:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return (
      <AdminLayout staffName="Administrator" staffRole="ADMIN">
        <div className="p-6">Loading member details...</div>
      </AdminLayout>
    )
  }

  if (!member) {
    return (
      <AdminLayout staffName="Administrator" staffRole="ADMIN">
        <div className="p-6">Member not found.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout staffName="Administrator" staffRole="ADMIN">
      <div className="p-6 space-y-6">
        <div className="rounded-lg border border-evermont-border bg-white p-6">
          <h1 className="text-2xl font-bold">Member Details</h1>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>Name: {member.first_name} {member.last_name}</div>
            <div>Email: {member.email}</div>
            <div>Member ID: {member.id}</div>
            <div>
              Account status: <StatusBadge status="active" label={member.status} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-evermont-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Accounts</h2>

          <div className="space-y-4">
            {member.accounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{account.account_type}</p>
                    <p className="text-sm text-gray-500">Account ID: {account.account_number}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${Number(account.balance).toFixed(2)}</div>
                    <StatusBadge
                      status={account.status === 'active' ? 'active' : 'pending'}
                      label={account.status}
                    />
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Opened: {new Date(account.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
