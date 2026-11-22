import { supabase } from '@/lib/supabase'

export type MemberBeneficiary = { id: string; user_id: string; name: string }

export async function readBeneficiaries(userId: string): Promise<MemberBeneficiary[]> {
  const { data, error } = await supabase.from('beneficiaries')
    .select('id,user_id,name').eq('user_id', userId).order('name')
  if (error || !data || !data.every(row => row.user_id === userId && typeof row.name === 'string')) {
    throw new Error('Beneficiary records unavailable')
  }
  return data
}
