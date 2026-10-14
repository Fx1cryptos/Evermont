import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type GateResult = { activated: boolean; fee: number | null; ratePercent: number | null }

export const useActivationGate = (userId: string | undefined, availableBalance: number) => {
  const [checking, setChecking] = useState(false)
  const check = useCallback(async (): Promise<GateResult> => {
    if (!userId) return { activated: false, fee: null, ratePercent: null }
    setChecking(true)
    try {
      const { data: statusRow } = await supabase
        .from('user_activation_status')
        .select('activation_status, calculated_fee_amount')
        .eq('user_id', userId)
        .maybeSingle()

      if (String(statusRow?.activation_status || '').toLowerCase() === 'activated') {
        return { activated: true, fee: null, ratePercent: null }
      }

      const { data: rateRow } = await supabase
        .from('activation_fee_rates')
        .select('fee_percentage, fixed_fee_amount')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      const rate = rateRow?.fee_percentage != null ? Number(rateRow.fee_percentage) : null
      const fixedFee = rateRow?.fixed_fee_amount != null ? Number(rateRow.fixed_fee_amount) : null
      const { data: rpcFee, error } = await supabase.rpc('calculate_activation_fee', {
        p_user_id: userId,
        p_available_balance: availableBalance,
      })
      const snapshotFee = statusRow?.calculated_fee_amount != null ? Number(statusRow.calculated_fee_amount) : null
      const fee = !error && rpcFee != null
        ? Number(rpcFee)
        : fixedFee != null
          ? fixedFee
          : snapshotFee != null
            ? snapshotFee
            : rate != null
              ? Math.round(availableBalance * (rate / 100) * 100) / 100
              : null

      return { activated: false, fee, ratePercent: rate }
    } finally {
      setChecking(false)
    }
  }, [userId, availableBalance])
  return { check, checking }
}
