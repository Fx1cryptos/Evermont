// Offline contract tests. All SDK HTTP responses are local fixtures; nothing is sent.
import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { createClient } from '@supabase/supabase-js'

const origin = 'http://127.0.0.1:1'
const member = 'fixture-member'
const requests = []
let verified = false
let role = null
let roleUnavailable = false
const previousFetch = globalThis.fetch
globalThis.fetch = async (input, options) => {
  const url = new URL(typeof input === 'string' ? input : input.url || input)
  assert.equal(url.origin, origin)
  requests.push(url)
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  if (url.pathname === '/auth/v1/user') return verified ? json({ id: member, aud: 'authenticated' }) : json({ message: 'invalid session' }, 401)
  assert.equal(options?.method || 'GET', 'GET')
  if (url.pathname === '/rest/v1/admin_roles') {
    assert.equal(url.searchParams.get('user_id'), 'eq.' + member)
    return roleUnavailable ? json({ message: 'unavailable' }, 503) : json(role ? [{ role }] : [])
  }
  if (url.pathname === "/rest/v1/accounts" && url.searchParams.has("id")) return json([{id:"requested-account",user_id:url.searchParams.get("user_id").slice(3)}])
  return json([])
}
const oldEnv = [process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY]
process.env.SUPABASE_URL = origin
process.env.SUPABASE_SERVICE_ROLE_KEY = 'unit-test-config'
globalThis.__portalTestClient = createClient(origin, 'unit-test-public', { auth: { persistSession: false, autoRefreshToken: false } })
const server = await createServer({
  configFile: false, envFile: false, logLevel: 'error', appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: [{ find: '@/lib/supabase', replacement: 'virtual:member-test-client' }, { find: '@', replacement: resolve('src') }] },
  plugins: [{ name: 'isolated-client', resolveId: id => id === 'virtual:member-test-client' ? '\0' + id : null,
    load: id => id === '\0virtual:member-test-client' ? 'export const supabase=globalThis.__portalTestClient;export const isSupabaseConfigured=true;' : null }],
})
after(async () => {
  await server.close()
  globalThis.fetch = previousFetch
  delete globalThis.__portalTestClient
  ;['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].forEach((key, i) => {
    if (oldEnv[i] === undefined) delete process.env[key]
    else process.env[key] = oldEnv[i]
  })
})
for (const [name, method] of [['support', 'GET'], ['support-gmail', 'GET'], ['support-test-email', 'POST']]) {
  test(name + ' requires a verified session and a staff role', async () => {
    const { default: handler } = await server.ssrLoadModule('/api/' + name + '.ts')
    const invoke = async (headers) => {
      const response = { code: 0, status(n) { this.code = n; return this }, json() {}, setHeader() {}, end() {} }
      await handler({ method, headers }, response)
      return response.code
    }
    verified = false; role = null
    assert.equal(await invoke({}), 401)
    assert.equal(await invoke({ authorization: 'Bearer invalid-fixture' }), 401)
    verified = true
    assert.equal(await invoke({ authorization: 'Bearer verified-fixture' }), 403)
    role = 'READ_ONLY'
    assert.equal(await invoke({ authorization: 'Bearer verified-fixture' }), 403)
    roleUnavailable = true
    try { assert.equal(await invoke({ authorization: 'Bearer verified-fixture' }), 403) }
    finally { roleUnavailable = false }
  })
}
test('account, ledger, transaction and beneficiary reads include member ownership', async () => {
  const { accountService } = await server.ssrLoadModule('/src/services/accountService.ts')
  const { transactionService } = await server.ssrLoadModule('/src/services/transactionService.ts')
  const { readBeneficiaries } = await server.ssrLoadModule('/src/services/beneficiaryService.ts')
  for (const owner of ['fixture-a', 'fixture-b']) {
    requests.length = 0
    await accountService.getAccounts(owner)
    await transactionService.getTransactions(owner, { accountId: 'requested-account' })
    await readBeneficiaries(owner)
    for (const [table, column] of [['accounts','user_id'], ['ledger_entries','member_id'], ['transactions','user_id'], ['beneficiaries','user_id']]) {
      const url = requests.find(url => url.pathname === '/rest/v1/' + table)
      assert.equal(url?.searchParams.get(column), 'eq.' + owner, table)
      if (['ledger_entries','transactions'].includes(table)) assert.equal(url.searchParams.get('account_id'), 'eq.requested-account')
    }
  }
})
