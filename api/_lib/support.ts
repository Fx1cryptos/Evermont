import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { requiresStagingTarget, resolveSupabaseUrl } from '../../shared/supabasePublicConfig.js'

export type SupportRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATIONS' | 'SUPPORT' | 'COMPLIANCE' | 'READ_ONLY'
export type RequestLike = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  query?: Record<string, string | string[] | undefined>
  body?: unknown
}
export type ResponseLike = {
  status(code: number): ResponseLike
  json(value: unknown): void
  setHeader(name: string, value: string): void
  end(): void
}

export type AuthenticatedSupportUser = {
  id: string
  email?: string
  role?: SupportRole
}

const viewRoles = new Set<SupportRole>(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'])
const manageRoles = new Set<SupportRole>(['SUPER_ADMIN', 'ADMIN', 'SUPPORT'])

export function getSupabaseAdmin(): SupabaseClient {
  const url = requiresStagingTarget(process.env)
    ? resolveSupabaseUrl(process.env)
    : process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Support server configuration is incomplete')
  if (process.env.VITE_SUPABASE_URL &&
      process.env.VITE_SUPABASE_URL.trim().replace(/\/$/,'') !== url.trim().replace(/\/$/,'')) {
    throw new Error('Support API and browser Supabase targets disagree')
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getBearerToken(request: RequestLike): string | null {
  const header = request.headers.authorization
  if (typeof header !== 'string') return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

export async function authenticateSupportUser(
  client: SupabaseClient,
  request: RequestLike,
): Promise<AuthenticatedSupportUser | null> {
  const token = getBearerToken(request)
  if (!token) return null
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return null

  const { data: roleRow, error: roleError } = await client
    .from('admin_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle()

  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
    role: !roleError && roleRow?.role ? roleRow.role as SupportRole : undefined,
  }
}

export function canViewSupport(user: AuthenticatedSupportUser): boolean {
  return Boolean(user.role && viewRoles.has(user.role))
}

export function canManageSupport(user: AuthenticatedSupportUser): boolean {
  return Boolean(user.role && manageRoles.has(user.role))
}

export function setJsonHeaders(response: ResponseLike, methods: string): void {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Methods', methods)
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
}

export function getString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!normalized || normalized.length > maxLength) return null
  return normalized
}

export function getQueryString(request: RequestLike, key: string): string | null {
  const value = request.query?.[key]
  return typeof value === 'string' ? value : null
}
