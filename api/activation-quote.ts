// Read-only estimates. No payment or activation mutation is exposed here.
import { createClient } from '@supabase/supabase-js'
import { getBearerToken, setJsonHeaders, type RequestLike, type ResponseLike } from './_lib/support.js'
import { defaultActivationPercent, defaultFeeMinorUnits } from '../shared/activationFee.js'

import { resolveSupabaseAnonKey, resolveSupabaseUrl } from '../shared/supabasePublicConfig.js'

let verifiedKey: Promise<string> | undefined
export function minor(value: string, digits: number): bigint {
  if (!/^\d+(\.\d+)?$/.test(value)) throw Error('Unsupported amount')
  const [whole, fraction = ''] = value.split('.')
  if (/[1-9]/.test(fraction.slice(digits))) throw Error('Unsupported precision')
  return BigInt(whole + fraction.padEnd(digits,'0').slice(0,digits))
}
function decimal(units: bigint, digits: number) {
  const text = units.toString().padStart(digits + 1, '0')
  return digits ? text.slice(0,-digits) + '.' + text.slice(-digits) : text
}
export default async function handler(req: RequestLike, res: ResponseLike) {
  setJsonHeaders(res,'GET')
  if(req.method !== 'GET') return res.status(405).end()
  const token = getBearerToken(req)
  if(!token) return res.status(401).end()
  try {
    const url = resolveSupabaseUrl(process.env)
    verifiedKey ??= resolveSupabaseAnonKey(process.env,url).catch(error=>{verifiedKey=undefined; throw error})
    const client = createClient(url, await verifiedKey, {global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}})
    const {data,error} = await client.auth.getUser(token)
    if(error || !data.user) return res.status(401).end()
    const owner = data.user.id
    const [accounts,rates] = await Promise.all([
      client.from('accounts').select('id,account_type,currency,balance::text').eq('user_id',owner),
      client.from('activation_fee_rates').select('*').eq('user_id',owner).eq('is_active',true)
    ])
    if(accounts.error || rates.error) throw Error('Quote unavailable')
    const quotes = await Promise.all(accounts.data.map(async a => {
      const matching = rates.data.filter(r => !r.account_id || r.account_id === a.id)
      if(matching.length > 1 || !/^[A-Z]{3}$/.test(a.currency)) throw Error('Ambiguous configuration')
      const digits = new Intl.NumberFormat('en',{style:'currency',currency:a.currency}).resolvedOptions().maximumFractionDigits!
      const balance = minor(a.balance,digits)
      let fee = defaultFeeMinorUnits(balance), rate = defaultActivationPercent
      if(matching.length) {
        // The legacy member RPC cannot distinguish two account-specific overrides.
        if(matching[0].account_id && accounts.data.length > 1) throw Error('Account-specific verification required')
        const override = await client.rpc('calculate_activation_fee',{p_user_id:owner,p_available_balance:a.balance})
        if(override.error || override.data == null) throw Error('Override unavailable')
        fee = minor(String(override.data),digits)
        rate = matching[0].fixed_fee_amount != null ? 'Authorized fixed fee' : matching[0].fee_percentage != null ? String(matching[0].fee_percentage)+'%' : 'Authorized override'
      }
      return {id:a.id,type:a.account_type,currency:a.currency,balance:a.balance,rate,fee:decimal(fee,digits)}
    }))
    return res.status(200).json({quotes})
  } catch {return res.status(503).json({error:'Account fee estimates are unavailable.'})}
}
