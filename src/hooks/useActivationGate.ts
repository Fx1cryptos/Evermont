import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type GateResult = { activated: boolean; fee: number | null; ratePercent: number | null }

export const useActivationGate = (userId: string | undefined, availableBalance: number) => {
  const [checking, setChecking] = useState(false)
  const check = useCallback(async (): Promise<GateResult> => {
    if (!userId) return { activated: false, fee: null, ratePercent: null }
    setChecking(true)
    try {
      const { data: s } = await supabase.from('user_activation_status')
        .select('status, rate').eq('user_id', userId).maybeSingle()        // ASSUMED columns
      if (s?.status === 'activated') return { activated: true, fee: null, ratePercent: null }
      const { data: rpcFee, error } = await supabase.rpc('calculate_activation_fee',
        { p_user_id: userId, p_available_balance: availableBalance })     // ASSUMED arg names
      let rate: number | null = s?.rate != null ? Number(s.rate) : null
      if (rate == null) {
        const { data: r } = await supabase.from('activation_fee_rates')
          .select('rate').eq('user_id', userId).maybeSingle()             // ASSUMED
        rate = r?.rate != null ? Number(r.rate) : null
      }
      const fee = !error && rpcFee != null ? Number(rpcFee)
        : rate != null ? Math.round(availableBalance * (rate / 100) * 100) / 100 : null
      return { activated: false, fee, ratePercent: rate }
    } finally { setChecking(false) }
  }, [userId, availableBalance])
  return { check, checking }
}
