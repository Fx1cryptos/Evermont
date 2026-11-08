import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type GateResult = { activated: boolean }

export const useActivationGate = (userId: string | undefined) => {
  const [checking, setChecking] = useState(false)
  const check = useCallback(async (): Promise<GateResult> => {
    if (!userId) return { activated: false }
    setChecking(true)
    try {
      const { data: statusRow } = await supabase
        .from('user_activation_status')
        .select('activation_status')
        .eq('user_id', userId)
        .maybeSingle()
      return { activated: String(statusRow?.activation_status || '').toLowerCase() === 'activated' }
    } finally {
      setChecking(false)
    }
  }, [userId])
  return { check, checking }
}
