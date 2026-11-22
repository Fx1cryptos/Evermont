import { useCallback, useState } from 'react'
import { readActivation } from '@/services/activationStatus'

export type GateResult = Awaited<ReturnType<typeof readActivation>>
export const useActivationGate = (userId: string | undefined) => {
  const [checking, setChecking] = useState(false)
  const check = useCallback(async () => {
    setChecking(true)
    try { return await readActivation(userId) } finally { setChecking(false) }
  }, [userId])
  return { check, checking }
}
