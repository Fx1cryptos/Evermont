// In-memory transport contract tests. No remote Supabase or Google traffic.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { createClient } from '@supabase/supabase-js'

let transport
const origin = 'http://127.0.0.1:1'
const originalFetch = global.fetch
global.fetch = (input, options = {}) => transport(new URL(input.url || input), options)
const client = createClient(origin, 'fixture-public', {
  auth: { persistSession: false, autoRefreshToken: false },
})
const member = '11111111-1111-4111-8111-111111111111',
  ticket = '22222222-2222-4222-8222-222222222222',
  notice = '33333333-3333-4333-8333-333333333333'
global.__client = client
const server = await createServer({
  configFile: false,
  envFile: false,
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: {
    alias: [
      { find: '@/lib/supabase', replacement: 'virtual:client' },
      { find: '@', replacement: resolve('src') },
    ],
  },
  plugins: [
    {
      name: 'fixture',
      resolveId: (id) => (id === 'virtual:client' ? '\0client' : null),
      load: (id) => (id === '\0client' ? 'export const supabase=globalThis.__client;export const isSupabaseConfigured=true;' : null),
    },
  ],
})
const saved = new Map()
function env(key, value) {
  if (!saved.has(key)) saved.set(key, process.env[key])
  process.env[key] = value
}
after(async () => {
  global.fetch = originalFetch
  delete global.__client
  for (const [key, value] of saved) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  await server.close()
})
const load = (path) => server.ssrLoadModule(path)
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

test('activation is owned, distinguishes missing, pending, conflict, permission and network failures', async () => {
  const { readActivation } = await load('/src/services/activationStatus.ts')
  client.auth.getUser = async () => ({ data: { user: { id: member } }, error: null })
  let rows = [],
    failure = 0,
    owned = true
  transport = async (url) => {
    assert.equal(url.searchParams.get('user_id'), 'eq.' + member)
    if (url.pathname.endsWith('/accounts')) return json(owned ? [{ user_id: member, id: 'account' }] : [])
    assert.ok(url.pathname.endsWith('/user_activation_status'))
    if (failure === 1) throw new TypeError('Failed to fetch')
    return failure ? json({ code: '42501' }, 403) : json(rows)
  }
  assert.equal((await readActivation(member)).label, 'No activation record')
  for (const [state, label] of [
    ['pending', 'Pending'],
    ['activated', 'Active'],
    ['action_required', 'Action required'],
    ['not_activated', 'Not activated'],
  ]) {
    rows = [{ user_id: member, activation_status: state }]
    assert.equal((await readActivation(member)).label, label)
  }
  rows.push({ user_id: member, activation_status: 'activated' })
  await assert.rejects(readActivation(member), /different statuses/)
  owned = false
  await assert.rejects(readActivation(member), /owned account/)
  owned = true
  await assert.rejects(readActivation('another'), /session/)
  rows = [{ user_id: 'other', activation_status: 'activated' }]
  await assert.rejects(readActivation(member), /could not be verified/)
  failure = 403
  await assert.rejects(readActivation(member), /denied/)
  failure = 1
  await assert.rejects(readActivation(member), /unreachable/)
})
test('member post uses restricted inserts; hidden or foreign messages are never requested', async () => {
  const { supportService } = await load('/src/services/supportService.ts')
  const saved = []
  client.auth.getSession = async () => ({ data: { session: null } })
  transport = async (url, opt) => {
    if (url.pathname.endsWith('/support_conversations')) {
      if (opt.method === 'POST') {
        const row = JSON.parse(opt.body)
        assert.deepEqual(Object.keys(row).sort(), ['subject', 'user_id'])
        return json({ id: ticket, ...row, status: 'open' })
      }
      return json(url.searchParams.get('user_id') === 'eq.' + member ? [{ id: ticket, status: 'open' }] : [])
    }
    assert.ok(url.pathname.endsWith('/support_messages'))
    if (opt.method === 'POST') {
      const row = JSON.parse(opt.body)
      assert.equal(row.sender_id, member)
      assert.equal(row.conversation_id, ticket)
      assert.equal(row.is_internal, false)
      saved.push(row)
      return json(null, 201)
    }
    assert.equal(url.searchParams.get('is_internal'), 'eq.false')
    assert.equal(url.searchParams.get('conversation_id'), 'eq.' + ticket)
    return json(saved)
  }
  assert.ok(!(await supportService.createConversation(member, 'Subject', 'First')).error)
  assert.ok(!(await supportService.sendMessage(member, ticket, 'Second')).error)
  assert.deepEqual(
    (await supportService.listMessages(member, ticket)).data.map((m) => m.body),
    ['First', 'Second'],
  )
  assert.ok((await supportService.listMessages('another', ticket)).error)
  assert.ok((await supportService.sendMessage('another', ticket, 'No')).error)
  assert.equal(saved.length, 2)
})
test('Gemini only receives topic labels and returns approved content; provider failure leaves ordinary support intact', async () => {
  const { approvedAnswer } = await load('/api/_lib/assistant.ts')
  env('GEMINI_MODEL', 'gemini-fixture')
  env('GEMINI_API_KEY', 'fixture')
  transport = async (url, opt) => {
    assert.equal(url.hostname, 'generativelanguage.googleapis.com')
    assert.ok(!opt.body.includes('private-personal-details'))
    return json({ candidates: [{ content: { parts: [{ text: 'activation' }] } }] })
  }
  assert.match(await approvedAnswer(['activation private-personal-details']), /^Open Activation/)
  transport = async () => json({ candidates: [{ content: { parts: [{ text: 'fabricated balance' }] } }] })
  assert.match(await approvedAnswer(['balance']), /agent/)
  transport = async () => json({}, 503)
  assert.equal(await approvedAnswer(['activation']), null)
})
test('handoff requires a verified owner; closed tickets cannot be reopened by the request', async () => {
  const { default: handler } = await load('/api/support.ts')
  env('SUPABASE_URL', origin)
  env('SUPABASE_SERVICE_ROLE_KEY', 'fixture')
  let owner = member,
    updates = 0
  transport = async (url, opt) => {
    if (url.pathname.endsWith('/user')) return json({ id: member })
    if (url.pathname.endsWith('/admin_roles')) return json([])
    if (opt.method === 'PATCH') {
      assert.equal(url.searchParams.get('user_id'), 'eq.' + member)
      assert.equal(url.searchParams.get('status'), 'not.in.(resolved,closed)')
      assert.deepEqual(JSON.parse(opt.body), { human_requested: true, status: 'pending_support' })
      updates++
      return json([{ id: ticket }])
    }
    return json([{ id: ticket, user_id: owner }])
  }
  async function run() {
    const res = {
      status(n) {
        this.code = n
        return this
      },
      json() {},
      setHeader() {},
    }
    await handler(
      {
        method: 'POST',
        headers: { authorization: 'Bearer fixture' },
        body: { action: 'handoff', conversationId: ticket },
      },
      res,
    )
    return res.code
  }
  assert.equal(await run(), 200)
  owner = 'other'
  assert.equal(await run(), 403)
  assert.equal(updates, 1)
})
test('outbox sends minimal notification; import requires mailbox, role, direct reference, SENT label and explicit publication', async () => {
  const { sendSupportEmail, supportMailbox } = await load('/api/_lib/gmail.ts')
  const { importMessage } = await load('/api/_lib/gmailSync.ts')
  for (const k of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) env(k, 'fixture')
  env('GMAIL_FROM_EMAIL', supportMailbox)
  env('SUPPORT_NOTIFICATION_EMAIL', supportMailbox)
  let label = [],
    role = 'SUPPORT',
    recipient = supportMailbox,
    reference = '<notice.' + notice + '@evermontcredit.online>',
    record = null,
    content = 'MEMBER REPLY\nYour request is under review.\nEND REPLY\nPrivate quoted history'
  transport = async (url, opt) => {
    if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'fixture' })
    if (url.pathname.endsWith('/profile')) return json({ emailAddress: supportMailbox })
    if (url.pathname.endsWith('/users/me/messages')) {
      assert.ok(url.searchParams.get('q').includes('rfc822msgid:notice.' + notice))
      return json({ messages: [{ id: 'existing-send', threadId: 'thread' }] })
    }
    if (url.pathname.endsWith('/send')) {
      const raw = Buffer.from(JSON.parse(opt.body).raw, 'base64url').toString()
      assert.ok(raw.includes('To: ' + supportMailbox))
      assert.ok(raw.includes('Message-ID: ' + reference))
      const body = Buffer.from(raw.split('\r\n\r\n')[1], 'base64').toString()
      assert.match(body, /Member: Fixture/)
      assert.ok(!body.includes('12345678'))
      assert.ok(body.includes('/admin/support/' + ticket))
      return json({ id: 'out', threadId: 'thread' })
    }
    if (url.hostname === 'gmail.googleapis.com')
      return json({
        labelIds: label,
        payload: {
          mimeType: 'text/plain',
          headers: Object.entries({ From: supportMailbox, To: recipient, 'In-Reply-To': reference }).map(
            ([name, value]) => ({ name, value }),
          ),
          body: { data: Buffer.from(content).toString('base64url') },
        },
      })
    assert.equal(url.origin, origin)
    if (url.pathname.endsWith('/support_messages') && opt.method === 'POST') {
      record = JSON.parse(opt.body)
      return json(null, 201)
    }
    if (url.pathname.endsWith('/support_messages')) return json(record ? [record] : [])
    if (url.pathname.endsWith('/profiles')) return json([{ id: member, email: supportMailbox }])
    if (url.pathname.includes('/auth/v1/admin/users/'))
      return json({ id: member, email: supportMailbox, email_confirmed_at: '2020-01-01' })
    if (url.pathname.endsWith('/admin_roles')) return json([{ role }])
    assert.ok(url.pathname.endsWith('/support_notification_outbox'))
    assert.equal(url.searchParams.get('payload->>notification_thread'), 'eq.thread')
    return json(url.searchParams.get('id') === 'eq.' + notice ? [{ conversation_id: ticket }] : [])
  }
  assert.equal(
    (
      await sendSupportEmail({
        ticketId: ticket,
        notificationId: notice,
        memberName: 'Fixture',
        subject: 'Statement 12345678',
      })
    ).threadId,
    'thread',
  )
  assert.equal(
    (await sendSupportEmail({ ticketId: ticket, notificationId: notice, subject: 'Receipt' }, true)).id,
    'existing-send',
  )
  const run = () => importMessage(client, { id: 'reply', threadId: 'thread' }, supportMailbox, 'fixture')
  assert.equal(await run(), 'ignored')
  label = ['SENT']
  role = 'READ_ONLY'
  assert.equal(await run(), 'ignored')
  role = 'SUPPORT'
  recipient = 'other@example.invalid'
  assert.equal(await run(), 'ignored')
  recipient = supportMailbox
  const ref = reference
  reference = '<unrelated>'
  assert.equal(await run(), 'ignored')
  reference = ref
  const reply = content
  content = 'Internal staff note'
  assert.equal(await run(), 'ignored')
  content = reply
  assert.equal(await run(), 'imported')
  assert.equal(record.sender_role, 'support')
  assert.equal(record.body, 'Your request is under review.')
  assert.equal(record.conversation_id, ticket)
  assert.equal(await run(), 'ignored')
})

test('assistant only commits to the owned source turn, stops after a handoff, and does not persist provider errors', async () => {
  const { assistMember } = await load('/api/_lib/assistant.ts')
  env('GEMINI_API_KEY', 'fixture')
  env('GEMINI_MODEL', 'gemini-fixture')
  let human = false,
    healthy = true,
    claimed = false,
    calls = 0
  const replies = []
  transport = async (url, opt) => {
    if (url.hostname === 'generativelanguage.googleapis.com') {
      calls++
      return healthy ? json({ candidates: [{ content: { parts: [{ text: 'security' }] } }] }) : json({}, 503)
    }
    if (url.pathname.endsWith('/support_conversations')) {
      assert.equal(url.searchParams.get('user_id'), 'eq.' + member)
      return json([{ id: ticket, human_requested: human, status: 'open' }])
    }
    if (url.pathname.endsWith('/support_messages')) {
      assert.equal(url.searchParams.get('conversation_id'), 'eq.' + ticket)
      assert.equal(url.searchParams.get('is_internal'), 'eq.false')
      return json([{ id: notice, sender_role: 'member', body: 'Security question' }])
    }
    const args = JSON.parse(opt.body)
    assert.equal(args.p_member, member)
    assert.equal(args.p_ticket, ticket)
    assert.equal(args.p_message, notice)
    if (url.pathname.endsWith('/claim_support_assistant')) {
      if (claimed) return json(false)
      claimed = true
      return json(true)
    }
    assert.ok(url.pathname.endsWith('/complete_support_assistant'))
    replies.push(args.p_body)
    return json(true)
  }
  assert.equal(await assistMember(client, ticket, member), true)
  assert.match(replies[0], /Profile & Security/)
  assert.equal(await assistMember(client, ticket, member), false)
  human = true
  claimed = false
  assert.equal(await assistMember(client, ticket, member), false)
  assert.equal(calls, 1)
  human = false
  healthy = false
  assert.equal(await assistMember(client, ticket, member), false)
  assert.equal(replies.length, 1)
})

test('four distinct owner filters return their own balance, ledger and beneficiaries',async()=>{
  const {accountService}=await load('/src/services/accountService.ts')
  const {transactionService}=await load('/src/services/transactionService.ts')
  const {readBeneficiaries}=await load('/src/services/beneficiaryService.ts')
  const owners = ['fixture-1','fixture-2','fixture-3','fixture-4']
  transport = async url => {
    const table=url.pathname.split('/').pop()
    if(table==='transactions') return json([])
    const col=table==='ledger_entries'?'member_id':'user_id'
    const rows=owners.map((owner,i)=>({id:table+i,[col]:owner,account_id:'accounts'+i,balance:String(i+1),amount:String(i+1),entry_type:'deposit',name:'Recipient '+i}))
    return json(rows.filter(r=>'eq.'+r[col]===url.searchParams.get(col)))
  }
  for(const [i,owner] of owners.entries()){
    const a=await accountService.getAccounts(owner), t=await transactionService.getTransactions(owner), b=await readBeneficiaries(owner)
    assert.deepEqual(a.map(x=>[x.userId,x.balance]),[[owner,String(i+1)]])
    assert.deepEqual(t.map(x=>[x.memberId,x.accountId]),[[owner,'accounts'+i]])
    assert.deepEqual(b.map(x=>x.user_id),[owner])
  }
})
test('default rate is 0.008, rounds once in currency minor units and never accepts negative basis',async()=>{
 const {defaultActivationRate,defaultFeeMinorUnits}=await load('/shared/activationFee.ts')
 assert.equal(defaultActivationRate.decimal,'0.008')
 assert.equal(defaultFeeMinorUnits(10000n),80n)
 assert.equal(defaultFeeMinorUnits(62n),0n)
 assert.equal(defaultFeeMinorUnits(63n),1n)
 assert.equal(defaultFeeMinorUnits(1000000000000000000n),8000000000000000n)
 assert.throws(()=>defaultFeeMinorUnits(-1n))
})

test('account quote examples use database decimal strings and currency precision', async () => {
  const { minor } = await load('/api/activation-quote.ts')
  const { defaultFeeMinorUnits } = await load('/shared/activationFee.ts')
  for (const [balance,fee] of [['1000.00',800n],['5000.00',4000n],['10000.00',8000n],['19.99',16n]]) {
    assert.equal(defaultFeeMinorUnits(minor(balance,2)),fee)
  }
  assert.throws(()=>minor('1.001',2))
})

test('trusted quote endpoint uses verified identity and database balance, never client-supplied amounts',async()=>{
  const {default:handler}=await load('/api/activation-quote.ts')
  env('SUPABASE_URL','https://gdodqiwjcezdznzroupw.supabase.co');env('VITE_SUPABASE_PUBLISHABLE_KEY','sb_publishable_fixture')
  let calls=0
  transport=async url=>{
    if(url.pathname.endsWith('/auth/v1/health')) return json({})
    if(url.pathname.endsWith('/auth/v1/user')) return json({id:member})
    assert.equal(url.searchParams.get('user_id'),'eq.'+member); calls++
    if(url.pathname.endsWith('/accounts')) return json([{id:'owned',account_type:'savings',currency:'USD',balance:'5000.00'}])
    assert.ok(url.pathname.endsWith('/activation_fee_rates')); return json([])
  }
  const res={setHeader(){},status(n){this.code=n;return this},end(){},json(v){this.body=v}}
  await handler({method:'GET',headers:{},query:{}},res)
  assert.equal(res.code,401)
  await handler({method:'GET',headers:{authorization:'Bearer fixture'},query:{balance:'1',user_id:'other'}},res)
  assert.equal(res.code,200);assert.equal(res.body.quotes[0].fee,'40.00');assert.equal(calls,2)
})

test('history walks capped pages, preserves missing fields and reports denied reads',async()=>{
 const {transactionService}=await load('/src/services/transactionService.ts')
 let deny=false
 transport=async url=>{
   if(url.pathname.endsWith('/transactions')) return deny ? json({code:'42501'},403) : json([])
   assert.equal(url.searchParams.get('member_id'),'eq.'+member)
   const offset=Number(url.searchParams.get('offset'))
   return new Response(JSON.stringify([{id:'record'+offset,member_id:member,account_id:'owned',created_at:'2026-01-01',...(offset===1?{amount:'-5.00'}:{})}]),{headers:{'content-type':'application/json','content-range':offset+'-'+offset+'/2'}})
 }
 const rows=await transactionService.getTransactions(member)
 assert.equal(rows.length,2)
 assert.equal(rows.find(r=>r.id==='record0').displayAmount,'')
 assert.equal(rows.find(r=>r.id==='record1').displayAmount,'5.00')
 deny=true
 await assert.rejects(transactionService.getTransactions(member),/Unable to load/)
})

test('public-key selection prefers an accepted publishable key and falls back to the same-project anon key',async()=>{
 const {resolveSupabaseAnonKey}=await load('/shared/supabasePublicConfig.ts')
 const ref='gdodqiwjcezdznzroupw',url='https://'+ref+'.supabase.co'
 const anon='eyJ0.'+Buffer.from(JSON.stringify({role:'anon',ref})).toString('base64url')+'.fixture'
 const pub='sb_publishable_fixture'
 const env={VITE_SUPABASE_ANON_KEY:anon,VITE_SUPABASE_PUBLISHABLE_KEY:pub}
 transport=async u=>{assert.equal(u.origin,url);return json({})}
 assert.equal(await resolveSupabaseAnonKey(env,url),pub)
 transport=async()=>json({},401)
 assert.equal(await resolveSupabaseAnonKey(env,url),anon)
 assert.equal(await resolveSupabaseAnonKey({VITE_SUPABASE_ANON_KEY:anon},url),anon)
 assert.throws(()=>createClient(url,''));assert.ok(createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}}).auth)
})
