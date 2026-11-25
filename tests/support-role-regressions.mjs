import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createServer } from 'vite'

// Load the same NodeNext .js -> TypeScript module graph as the API contract tests.
const loader = await createServer({configFile:false,envFile:false,server:{middlewareMode:true,hmr:false,watch:null}})
const { canManageSupport, canViewSupport } = await loader.ssrLoadModule('/api/_lib/support.ts')
await loader.close()

const migration = readFileSync('supabase/migrations/20261124120000_support_staff_reply_permissions.sql', 'utf8')

test('OPERATIONS can view support but cannot reply', () => {
  const operations = { id: 'operations-user', role: 'OPERATIONS' }
  assert.equal(canViewSupport(operations), true)
  assert.equal(canManageSupport(operations), false)
})

test('only SUPER_ADMIN, ADMIN, and SUPPORT can manage support', () => {
  for (const role of ['SUPER_ADMIN', 'ADMIN', 'SUPPORT']) {
    const staff = { id: `${role.toLowerCase()}-user`, role }
    assert.equal(canViewSupport(staff), true)
    assert.equal(canManageSupport(staff), true)
  }
})

test('COMPLIANCE, READ_ONLY, and non-staff cannot access support', () => {
  for (const role of ['COMPLIANCE', 'READ_ONLY', undefined]) {
    const user = { id: `${role ?? 'member'}-user`, role }
    assert.equal(canViewSupport(user), false)
    assert.equal(canManageSupport(user), false)
  }
})

test('migration replaces broad staff policy with separate read and reply policies', () => {
  assert.match(migration, /drop policy if exists support_messages_staff_all/i)
  assert.match(migration, /create policy support_messages_staff_select[\s\S]*?for select/i)
  assert.match(migration, /create policy support_messages_staff_insert[\s\S]*?for insert/i)
  assert.doesNotMatch(migration, /create policy[\s\S]*?for\s+(?:all|update|delete)\b/i)
  assert.match(migration, /'SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'/)
  assert.match(migration, /'SUPER_ADMIN', 'ADMIN', 'SUPPORT'/)
})


test('realtime inserts coalesce into a fresh authorized read and unsubscribe drops pending refreshes',async()=>{
 const {subscribeToInbox}=await import('../src/lib/supportRealtime.ts')
 let onInsert,reads=0,removed=false
 const channel={on(_kind,filter,callback){assert.equal(filter.table,'support_messages');onInsert=callback;return this},subscribe(){return this}}
 const stop=subscribeToInbox({channel:()=>channel,removeChannel:c=>{assert.equal(c,channel);removed=true}},'staff',()=>reads++)
 onInsert();onInsert();await new Promise(resolve=>setTimeout(resolve,200));assert.equal(reads,1)
 onInsert();stop();onInsert();await new Promise(resolve=>setTimeout(resolve,200));assert.equal(reads,1);assert.ok(removed)
})
