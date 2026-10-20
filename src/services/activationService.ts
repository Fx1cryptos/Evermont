import { supabase } from '@/lib/supabase'

export type ActivationPaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'

export type ActivationPaymentLog = {
  id: string
  amount: number
  currency: string
  payment_method: string | null
  payment_reference: string | null
  status: ActivationPaymentStatus
  fee_snapshot: number | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export const activationService = {
  async listPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from('activation_payment_logs')
      .select('id,amount,currency,payment_method,payment_reference,status,fee_snapshot,metadata,created_at,updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data: (data || []) as ActivationPaymentLog[], error }
  },
}
