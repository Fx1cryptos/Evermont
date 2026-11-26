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
  const articles=[{topic:'activation',keywords:'activate,activation',answer:'Open Activation for your current requirements.'}]
  const { approvedAnswer } = await load('/api/_lib/assistant.ts')
  env('GEMINI_MODEL', 'gemini-fixture')
  env('GEMINI_API_KEY', 'fixture')
  transport = async (url, opt) => {
    assert.equal(url.hostname, 'generativelanguage.googleapis.com')
    assert.ok(!opt.body.includes('private-personal-details'))
    return json({ candidates: [{ content: { parts: [{ text: 'activation' }] } }] })
  }
  assert.match(await approvedAnswer(['activation private-personal-details'],articles), /^Open Activation/)
  let sensitiveCalls = 0
  transport = async () => { sensitiveCalls++; return json({}) }
  assert.match(await approvedAnswer(['Unauthorized transaction on my statement'], articles), /agent/)
  assert.equal(sensitiveCalls, 0)
  transport = async () => json({ candidates: [{ content: { parts: [{ text: 'fabricated balance' }] } }] })
  assert.match(await approvedAnswer(['balance'],articles), /agent/)
  transport = async () => json({}, 503)
  assert.equal(await approvedAnswer(['activation'],articles), null)
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
    if(url.pathname.endsWith('/support_knowledge_articles')){
      assert.equal(url.searchParams.get('published'),'eq.true')
      return json([{topic:'security',keywords:'security',answer:'Open Profile & Security.'}])
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
    if(args.p_body!==null) replies.push(args.p_body)
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

test('member views read 18 authorized demo rows across pages and preserve provenance, amounts and posted fields',async()=>{
  const {transactionService}=await load('/src/services/transactionService.ts')
  const {activityDescription,activityMoney}=await load('/src/utils/activityPresentation.ts')
  const savedGetUser=client.auth.getUser
  client.auth.getUser=async()=>({data:{user:{id:member}},error:null})
  const rows=Array.from({length:18},(_,i)=>({
    id:'demo-'+i, member_id:member, account_id:'owned', is_demo:true,
    reference_id:'REF-'+i, description:i===0?'[DEMO] Transfer – Fixed Asset':'[DEMO] Deposit',
    entry_type:i<3?'transfer':i===3?'withdrawal':'deposit',
    amount:i===0?'0.00':'12.34', debit:i===1?'12.34':'0.00', credit:i===2?'12.34':'0.00',
    status:i===4?null:'completed', created_at:new Date(Date.UTC(2026,0,18-i)).toISOString(),
  }))
  let requests=0, foreign=false
  transport=async url=>{
    requests++
    if(url.pathname.endsWith('/accounts')){
      assert.equal(url.searchParams.get('user_id'),'eq.'+member)
      return json([{id:'owned',user_id:member}])
    }
    if(!url.pathname.endsWith('/demo_ledger_entries')) return json([])
    assert.equal(url.searchParams.get('member_id'),'eq.'+member)
    assert.equal(url.searchParams.get('account_id'),'in.(owned)')
    const offset=Number(url.searchParams.get('offset'))
    const page=rows.slice(offset,offset+7)
    if(foreign && page.length) page[0]={...page[0],account_id:'foreign'}
    return new Response(JSON.stringify(page),{headers:{'content-type':'application/json','content-range':offset+'-'+(offset+page.length-1)+'/18'}})
  }
  try {
    await assert.rejects(transactionService.getMemberActivity('another-member'),/session/)
    assert.equal(requests,0)
    await assert.rejects(transactionService.getMemberActivity(member,{accountId:'foreign'}),/account access/)
    const activity=await transactionService.getMemberActivity(member)
    assert.equal(activity.length,18)
    assert.deepEqual(activity.slice(0,5).map(row=>row.direction),['unknown','debit','credit','debit','credit'])
    assert.deepEqual(activity.map(row=>row.referenceId),rows.map(row=>row.reference_id))
    assert.deepEqual(activity.map(row=>row.createdAt),rows.map(row=>row.created_at))
    assert.ok(activity.every(row=>row.is_demo && row.isSample && row.source==='demo_ledger_entries'))
    assert.equal(activity[0].description,rows[0].description)
    assert.equal(activityDescription(activity[0]),'Transfer – Fixed Asset')
    assert.equal(activityMoney(activity[0].displayAmount,'USD'),'$0.00')
    assert.equal(activityMoney('9007199254740993.13','USD'),'$9,007,199,254,740,993.13')
    assert.equal(activity[4].status,'')
    assert.equal(activity[4].balanceAfter,null)
    assert.equal((await transactionService.getMemberActivity(member,{limit:8})).length,8)
    foreign=true
    await assert.rejects(transactionService.getMemberActivity(member),/authorized demo activity/)
  } finally {client.auth.getUser=savedGetUser}
})

test('staff retry reconciles an accepted Gmail notification before attempting another send', async () => {
  const { default: handler } = await load('/api/support.ts')
  const { supportMailbox } = await load('/api/_lib/gmail.ts')
  env('SUPABASE_URL', origin)
  env('SUPABASE_SERVICE_ROLE_KEY', 'fixture')
  for (const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN']) env(key,'fixture')
  env('GMAIL_FROM_EMAIL',supportMailbox)
  env('SUPPORT_NOTIFICATION_EMAIL',supportMailbox)
  let attempts = 6
  let reconciled = false
  let recorded = false
  transport = async (url, opt) => {
    if (url.hostname === 'oauth2.googleapis.com') return json({access_token:'fixture'})
    if (url.pathname.endsWith('/profile')) return json({emailAddress:supportMailbox})
    if (url.hostname === 'gmail.googleapis.com') {
      assert.equal(url.pathname,'/gmail/v1/users/me/messages','must not send again')
      assert.match(url.searchParams.get('q'),/rfc822msgid:notice\./)
      reconciled = true
      return json({messages:[{id:'already-sent',threadId:'existing-thread'}]})
    }
    if (url.pathname.endsWith('/auth/v1/user')) return json({id:member})
    if (url.pathname.includes('/auth/v1/admin/users/')) return json({id:member})
    if (url.pathname.endsWith('/admin_roles')) return json([{role:'SUPPORT'}])
    if (url.pathname.endsWith('/support_conversations')) {
      const row = {id:ticket,user_id:member,subject:'Statements'}
      return json(url.searchParams.get('select') === 'id,user_id' ? [row] : row)
    }
    if (url.pathname.endsWith('/support_messages')) return json({id:notice,sender_role:'member',is_internal:false})
    if (url.pathname.endsWith('/claim_support_notification_for_conversation')) {
      assert.ok(attempts<6)
      return json([{ id: notice, conversation_id:ticket, message_id:notice, event_type:'support_message', attempt_count:++attempts,locked_at:'2026-11-20T04:00:00Z' }])
    }
    assert.ok(url.pathname.endsWith('/support_notification_outbox'))
    const patch = JSON.parse(opt.body)
    if (patch.status === 'pending') attempts = patch.attempt_count
    else {
      assert.equal(patch.status,'sent')
      assert.equal(patch.payload.notification_message,'already-sent')
      assert.equal(url.searchParams.get('locked_at'),'eq.2026-11-20T04:00:00Z')
      assert.equal(url.searchParams.get('status'),'eq.processing')
      recorded = true
      return json([{id:notice}])
    }
    return json(null)
  }
  const res = {status(n){this.code=n;return this},json(body){this.body=body},setHeader(){}}
  await handler({method:'POST',headers:{authorization:'Bearer fixture'},body:{action:'retry',conversationId:ticket}},res)
  assert.equal(res.code,200)
  assert.deepEqual(res.body.result,{sent:1,failed:0})
  assert.ok(reconciled && recorded)
})

test('automation health is restricted to administrators and reports checks without secret values', async () => {
  const { default:handler } = await load('/api/automation-health.ts')
  env('SUPABASE_URL',origin);env('SUPABASE_SERVICE_ROLE_KEY','fixture-secret-value')
  env('GEMINI_API_KEY','fixture-model-secret');env('GEMINI_MODEL','gemini-fixture')
  env('GOOGLE_CLIENT_ID','fixture-client');env('GOOGLE_CLIENT_SECRET','fixture-oauth-secret')
  env('GOOGLE_REFRESH_TOKEN','fixture-refresh-secret');env('GMAIL_FROM_EMAIL','evermontcreditunion@gmail.com')
  env('SUPPORT_NOTIFICATION_EMAIL','evermontcreditunion@gmail.com')
  let role='SUPPORT', providers=0, geminiOk=true, queueOk=true
  transport=async (url,opt)=>{
    if (url.hostname==='generativelanguage.googleapis.com') {
      providers++
      assert.equal(opt.headers['x-goog-api-key'],'fixture-model-secret')
      return geminiOk ? json({supportedGenerationMethods:['generateContent']}) : json({error:'secret'},429)
    }
    if (url.hostname==='oauth2.googleapis.com') {providers++;return json({access_token:'fixture-access-secret'})}
    if (url.hostname==='gmail.googleapis.com') {providers++;return json({emailAddress:'evermontcreditunion@gmail.com'})}
    if (url.pathname.endsWith('/auth/v1/user')) return json({id:member})
    if (url.pathname.endsWith('/admin_roles')) return json([{role}])
    if (url.pathname === '/auth/v1/health') return json({name:'GoTrue'})
    if (url.pathname.endsWith('/support_worker_health')) {
      if (!queueOk) return json({message:'denied'},403)
      if (url.searchParams.get('healthy') === 'eq.true') return json([])
      return json([{id:'run',finished_at:'2026-01-01T00:00:00Z',failed_checks:['gmail']}])
    }
    if (url.pathname.endsWith('/support_gmail_sync_state')) return json([{last_synced_at:'2026-01-01T00:00:00Z'}])
    if (url.pathname.endsWith('/support_notification_outbox') && !queueOk) return json({message:'denied'},403)
    if (url.pathname.endsWith('/support_notification_outbox') && opt.method !== 'HEAD') {
      assert.equal(url.searchParams.get('select'), 'status,attempt_count,updated_at')
      assert.equal(url.searchParams.get('status'), 'in.(sent,failed)')
      assert.equal(url.searchParams.get('order'), 'updated_at.desc,id.desc')
      assert.equal(url.searchParams.get('limit'), '10')
      return json([{status:'failed',attempt_count:2,updated_at:'2026-01-01T00:00:00Z'}])
    }
    if (opt.method==='HEAD') return new Response(null,{status:200,headers:{'content-range':'0-0/3'}})
    throw Error('Unexpected health request')
  }
  async function run(headers={authorization:'Bearer fixture'}) {
    const res={status(n){this.code=n;return this},json(value){this.body=value},setHeader(){},end(){}}
    await handler({method:'GET',headers},res)
    return res
  }
  assert.equal((await run({})).code,401)
  assert.equal((await run()).code,403)
  assert.equal(providers,0)
  role='ADMIN'
  const {probePlatform} = await load('/api/_lib/platformHealth.ts')
  assert.deepEqual(await probePlatform(client),[])
  const result=await run()
  assert.equal(result.code,200)
  assert.equal(result.body.gemini.state,'available')
  assert.equal(result.body.gmail.state,'available')
  assert.equal(result.body.supportOpen,3)
  assert.deepEqual(result.body.workerHealth.latest.failed_checks,['gmail'])
  assert.equal(result.body.workerHealth.lastSuccess,null)
  assert.equal(result.body.workerHealth.recentFailures.length,1)
  assert.equal(result.body.failedNotifications,3)
  assert.deepEqual(result.body.recentNotifications, [
    {status:'failed',attempts:2,updatedAt:'2026-01-01T00:00:00Z'},
  ])
  assert.match(result.body.gmail.detail,/delivery has not been checked/)
  assert.ok(!JSON.stringify(result.body).includes('fixture-'))
  geminiOk=false;queueOk=false
  assert.deepEqual(await probePlatform(client),['gemini','database'])
  const failed=await run()
  assert.equal(failed.code,200)
  assert.equal(failed.body.gemini.state,'unavailable')
  assert.equal(failed.body.failedNotifications,null)
  assert.equal(failed.body.recentNotifications,null)
  assert.equal(failed.body.workerHealth,null)
  assert.ok(!JSON.stringify(failed.body).includes('secret'))
})

test('missing Gemini configuration requests human support for the owned active ticket', async () => {
  const {assistMember}=await load('/api/_lib/assistant.ts')
  env('GEMINI_API_KEY','')
  env('GEMINI_MODEL','')
  let handoffs=0
  transport=async(url,opt)=>{
    if(url.pathname.endsWith('/claim_support_assistant')) return json(true)
    if(url.pathname.endsWith('/complete_support_assistant')) {
      const args=JSON.parse(opt.body)
      assert.equal(args.p_member,member);assert.equal(args.p_ticket,ticket)
      assert.equal(args.p_message,notice);assert.ok(args.p_lease);assert.equal(args.p_body,null)
      handoffs++;return json(true)
    }
    if(url.pathname.endsWith('/support_conversations')) return json([{id:ticket,human_requested:false,status:'open',assigned_to:null}])
    if(url.pathname.endsWith('/support_messages')) return json([{id:notice,sender_role:'member',body:'Help'}])
    throw Error('Unexpected request')
  }
  assert.equal(await assistMember(client,ticket,member),false)
  assert.equal(handoffs,1)
})

test('atomic member submission keeps identity server-side and retries an ambiguous acknowledgement with the same key', async () => {
  const {supportService} = await load('/src/services/supportService.ts')
  const requests = []
  client.auth.getSession = async () => ({ data: { session: null } })
  transport = async (url, opt) => {
    assert.ok(url.pathname.endsWith('/rpc/submit_member_support_message'))
    requests.push(JSON.parse(opt.body))
    return requests.length === 1 ? json({message:'Acknowledgement unavailable'}, 503) : json(ticket)
  }
  assert.ok((await supportService.submit(notice, null, 'Question', ' Hello ')).error)
  assert.equal((await supportService.submit(notice, null, 'Question', ' Hello ')).data, ticket)
  assert.deepEqual(requests, Array(2).fill({p_request:notice,p_ticket:null,p_subject:'Question',p_body:'Hello'}))
})

test('authenticated inbox, admin reply and member retrieval with Google unavailable (transport fixture)',async()=>{
 const {default: handler}=await load('/api/support.ts')
 const {supportService}=await load('/src/services/supportService.ts')
 env('SUPABASE_URL',origin); env('SUPABASE_SERVICE_ROLE_KEY','fixture')
 client.auth.getSession=async()=>({data:{session:null}})
 const rows=[], conversation={id:ticket,user_id:member,status:'open',subject:'Test'}
 let staff=true
 transport=async (url,opt)=>{
  const path=url.pathname, p=url.searchParams
  if (path.endsWith('/submit_member_support_message')) {
   const args=JSON.parse(opt.body); rows.push({conversation_id:ticket,id:notice,body:args.p_body,sender_role:'member'}); return json(ticket)
  }
  if(path.endsWith('/auth/v1/user'))return json({id:staff?'staff':member})
  if(path.endsWith('/admin_roles'))return json(staff?[{role:'ADMIN'}]:[])
  if(path.endsWith('/profiles'))return json([{id:member,first_name:'Test'}])
  if(path.endsWith('/support_conversations')){
   if(opt.method==='PATCH')return json(null)
   if(p.get('select')?.includes('latest:support_messages'))return json([{...conversation,latest:[{body:rows[0].body}],unread:[{count:1}]}])
   return json([conversation])
  }
  if(path.endsWith('/support_messages')){
   if(opt.method==='POST'){ const row={...JSON.parse(opt.body),created_at:new Date().toISOString()}; if(rows.some(r=>r.id===row.id))return json({code:'23505',message:'duplicate'},409); rows.push(row);return json(row,201) }
   assert.equal(p.get('conversation_id'),'eq.'+ticket)
   if(p.has('id')){
     assert.equal(p.get('sender_id'),'eq.staff');assert.equal(p.get('sender_role'),'eq.support')
     assert.equal(p.get('is_internal'),'eq.false')
     return json(rows.filter(r=>'eq.'+r.id===p.get('id')))
   }
   return json(rows)
  }
  throw Error('External provider unavailable')
 }
 const request=async(method,body)=>{const res={status(n){this.code=n;return this},json(b){this.body=b},setHeader(){}}
 await handler({method,body,query:{},headers:{authorization:'Bearer fixture'}},res);return res}
 assert.equal((await supportService.submit(notice,null,'Test','Synthetic question')).data,ticket)
 assert.equal((await request('GET')).body.conversations[0].preview,'Synthetic question')
 const reply = {action:'reply',conversationId:ticket,message:'Synthetic answer',requestId:crypto.randomUUID()}
 assert.equal((await request('POST',reply)).code,201)
 assert.equal((await request('POST',reply)).code,200)
 assert.equal((await request('POST',{...reply,message:'Different answer'})).code,409)
 assert.deepEqual((await supportService.listMessages(member,ticket)).data.map(m=>m.body),['Synthetic question','Synthetic answer'])
 await supportService.submit(crypto.randomUUID(),ticket,null,'Member follow-up')
 assert.equal(rows.at(-1).body,'Member follow-up')
 staff=false
 assert.equal((await request('GET')).code,403)
 assert.equal((await request('POST',{action:'reply',conversationId:ticket,message:'Denied'})).code,403)
})

test('categorized human complaints never call Gemini or enqueue an AI response', async () => {
  const { assistMember } = await load('/api/_lib/assistant.ts')
  const { complaintCategories, complaintSubject } = await load('/shared/supportCategories.ts')
  for (const category of complaintCategories) {
    let calls = 0
    transport = async (url) => {
      assert.ok(url.pathname.endsWith('/support_conversations'))
      calls++
      return json([{id:ticket,subject:complaintSubject(category,'Complaint'),status:'open'}])
    }
    assert.equal(await assistMember(client,ticket,member),false)
    assert.equal(calls,1)
  }
})

test('dashboard unread total requires an authorized inbox viewer and excludes internal and staff messages',async()=>{
  const {default:handler}=await load('/api/support.ts')
  env('SUPABASE_URL',origin);env('SUPABASE_SERVICE_ROLE_KEY','fixture')
  let authorized=false, reads=0
  transport=async (url,opt)=>{
    if(url.pathname.endsWith('/auth/v1/user')) return json({id:member})
    if(url.pathname.endsWith('/admin_roles')) return json(authorized?[{role:'OPERATIONS'}]:[])
    assert.ok(url.pathname.endsWith('/support_messages'))
    assert.equal(opt.method,'HEAD')
    for(const [field,value] of Object.entries({sender_role:'eq.member',is_internal:'eq.false',read_by_support:'eq.false'}))
      assert.equal(url.searchParams.get(field),value)
    reads++
    return new Response(null,{headers:{'content-range':'0-0/7'}})
  }
  const get=async()=>{
    const res={status(n){this.code=n;return this},json(b){this.body=b},setHeader(){}}
    await handler({method:'GET',headers:{authorization:'Bearer fixture'},query:{summary:'unread'}},res)
    return res
  }
  assert.equal((await get()).code,403); assert.equal(reads,0)
  authorized=true
  assert.deepEqual((await get()).body,{unread:7}); assert.equal(reads,1)
})

test('staff alerts retry temporary Gmail failures and reconcile an accepted send without duplicating it', async () => {
  const { deliverSupportNotification } = await load('/api/_lib/notifications.ts')
  const { supportMailbox } = await load('/api/_lib/gmail.ts')
  for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) env(key, 'fixture')
  env('GMAIL_FROM_EMAIL', supportMailbox)
  env('SUPPORT_NOTIFICATION_EMAIL', supportMailbox)

  let accepted = false
  const bodies = []
  const writes = []
  transport = async (url, opt) => {
    if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'fixture' })
    if (url.pathname.endsWith('/profile')) return json({ emailAddress: supportMailbox })
    if (url.pathname.endsWith('/users/me/messages')) {
      assert.match(url.searchParams.get('q'), new RegExp('rfc822msgid:notice\\.' + notice))
      return json({ messages: accepted ? [{ id: 'accepted', threadId: 'thread' }] : [] })
    }
    if (url.pathname.endsWith('/send')) {
      const mime = Buffer.from(JSON.parse(opt.body).raw, 'base64url').toString()
      assert.ok(mime.includes('To: ' + supportMailbox))
      bodies.push(Buffer.from(mime.split('\r\n\r\n')[1], 'base64').toString())
      if (bodies.length === 1) return json({}, 503)
      accepted = true
      return json({ id: 'accepted', threadId: 'thread' })
    }
    if (url.pathname.endsWith('/support_conversations')) {
      assert.equal(url.searchParams.get('id'), 'eq.' + ticket)
      return json({ subject: 'OTP secret-fixture', priority: 'high', status: 'pending_support' })
    }
    assert.ok(url.pathname.endsWith('/support_notification_outbox'))
    assert.equal(url.searchParams.get('id'), 'eq.' + notice)
    assert.equal(opt.method, 'PATCH')
    assert.equal(url.searchParams.get('status'), 'eq.processing')
    assert.equal(url.searchParams.get('locked_at'), 'eq.2026-01-01T00:00:00Z')
    writes.push(JSON.parse(opt.body))
    return json({ id: notice })
  }

  const job = {
    id: notice, conversation_id: ticket, message_id: null, created_at: '2026-01-01T00:00:00Z',
    locked_at: '2026-01-01T00:00:00Z', event_type: 'support_staff_alert', payload: { alert: 'handoff' }, attempt_count: 1,
  }
  assert.equal(await deliverSupportNotification(client, job), false)
  assert.equal(writes[0].status, 'failed')
  assert.ok(Date.parse(writes[0].available_at) >= Date.parse(writes[0].updated_at) + 59_000)
  assert.equal(await deliverSupportNotification(client, { ...job, attempt_count: 2 }), true)
  assert.equal(await deliverSupportNotification(client, { ...job, attempt_count: 3 }), true)
  assert.equal(bodies.length, 2)
  for (const body of bodies) {
    assert.ok(body.includes('Human support requested'))
    assert.ok(body.includes('/admin/support/' + ticket))
    assert.ok(body.includes(job.created_at))
    assert.doesNotMatch(body, /secret-fixture|MEMBER REPLY/)
  }
  assert.deepEqual(writes.map((row) => row.status), ['failed', 'sent', 'sent'])
  assert.ok(writes.every((row) => !('payload' in row)))
})

test('published article revisions ground contextual follow-ups; sensitive and unknown turns escalate', async()=>{
 const { approvedAnswer } = await load('/api/_lib/assistant.ts')
 env('GEMINI_API_KEY','fixture');env('GEMINI_MODEL','gemini-fixture')
 let calls=0
 const articles=[{topic:'statements',keywords:'statement,document',answer:'Approved updated article.'}]
 transport=async(url,opt)=>{
   calls++
   assert.equal(url.hostname,'generativelanguage.googleapis.com')
   assert.match(opt.body,/Approved updated article/)
   return json({candidates:[{content:{parts:[{text:'statements'}]}}]})
 }
 assert.equal(await approvedAnswer(['My documents','where is that?'],articles),'Approved updated article.')
 assert.match(await approvedAnswer(['My statement has an unauthorized transfer'],articles),/agent/)
 assert.match(await approvedAnswer(['Something else'],articles),/agent/)
 assert.equal(calls,1)
})

test('staff HTTP actions reject unauthorized roles before reading or writing a ticket',async()=>{
 const support=(await load('/api/support.ts')).default
 const gmail=(await load('/api/support-gmail.ts')).default
 const email=(await load('/api/support-test-email.ts')).default
 env('SUPABASE_URL',origin); env('SUPABASE_SERVICE_ROLE_KEY','fixture')
 for(const role of ['OPERATIONS','COMPLIANCE','READ_ONLY',null]){
  let unexpected=0
  transport=async(url)=>{
   if(url.pathname.endsWith('/auth/v1/user'))return json({id:member})
   if(url.pathname.endsWith('/admin_roles'))return json(role?[{role}]:[])
   unexpected++;throw Error('Unexpected access')
  }
  const cases=[[support,'POST',{action:'reply'}],[support,'POST',{action:'note'}],[support,'POST',{action:'retry'}],
    [support,'PATCH',{assignSelf:true}],[support,'PATCH',{handling:'ai'}],[support,'PATCH',{handling:'human'}],
    [support,'PATCH',{status:'open'}],[gmail,'POST',{}],[gmail,'GET',{}],[email,'POST',{}]]
  if(role!=='OPERATIONS')cases.push([support,'GET',{}])
  for(const [route,method,body] of cases){
   const res={status(n){this.code=n;return this},json(){},setHeader(){}}
   await route({method,headers:{authorization:'Bearer fixture'},query:{id:ticket},body:{conversationId:ticket,...body}},res)
   assert.equal(res.code,403)
  }
  assert.equal(unexpected,0)
 }
})

test('explicit staging project fails closed on malformed, missing, conflicting or production targets',async()=>{
 const {resolveSupabaseUrl,resolveSupabaseAnonKey}=await load('/shared/supabasePublicConfig.ts')
 const url='https://isolatedstage.supabase.co'
 assert.equal(resolveSupabaseUrl({VITE_SUPABASE_URL:url}),url)
 assert.throws(()=>resolveSupabaseUrl({SUPABASE_URL:url},true),/explicitly/)
 const {getSupabaseAdmin}=await load('/api/_lib/support.ts')
 env('VITE_SUPABASE_URL',url);env('SUPABASE_URL',origin)
 assert.throws(()=>getSupabaseAdmin(),/targets disagree/)
 env('VITE_SUPABASE_URL','')
 for(const env of [{},{VITE_SUPABASE_URL:'http://localhost'},{VITE_SUPABASE_URL:url,SUPABASE_URL:'https://different.supabase.co'},{VITE_SUPABASE_URL:url,VERCEL_ENV:'production'}]) assert.throws(()=>resolveSupabaseUrl(env))
 const anon=ref=>'eyJ0.'+Buffer.from(JSON.stringify({role:'anon',ref})).toString('base64url')+'.fixture'
 assert.equal(await resolveSupabaseAnonKey({VITE_SUPABASE_ANON_KEY:anon('isolatedstage')},url),anon('isolatedstage'))
 for(const value of [anon('different'),'sb_secret_localfixture']) await assert.rejects(resolveSupabaseAnonKey({VITE_SUPABASE_ANON_KEY:value},url))
})

test('malformed or absent knowledge escalates without invoking Gemini',async()=>{
 const {approvedAnswer}=await load('/api/_lib/assistant.ts')
 env('GEMINI_MODEL','gemini-fixture');env('GEMINI_API_KEY','fixture')
 let calls=0;transport=async()=>{calls++;return json({})}
 const bad=[null,{topic:'human',keywords:'support',answer:'wrong'},{topic:'topic',keywords:null,answer:'wrong'},{topic:'topic',keywords:'support',answer:' '}]
 assert.match(await approvedAnswer(['support'],bad),/agent/)
 assert.equal(calls,0)
})

test('authenticated staff list and detail use the role-checked API; OPERATIONS detail excludes notes',async()=>{
 const handler=(await load('/api/support.ts')).default
 env('SUPABASE_URL',origin);env('SUPABASE_SERVICE_ROLE_KEY','fixture')
 for(const role of ['SUPER_ADMIN','ADMIN','SUPPORT','OPERATIONS']){
  const row={id:ticket,user_id:member,status:'open',subject:'Test'}
  transport=async(url,opt)=>{
   if(url.pathname.endsWith('/auth/v1/user'))return json({id:member})
   if(url.pathname.endsWith('/admin_roles'))return json([{role}])
   if(url.pathname.includes('/auth/v1/admin/users/'))return json({id:member})
   if(url.pathname.endsWith('/support_conversations'))return json([row])
   if(url.pathname.endsWith('/support_messages')){
    assert.equal(opt.method,'GET')
    assert.equal(url.searchParams.get('is_internal'),role==='OPERATIONS'?'eq.false':null)
    return json(role==='OPERATIONS'?[{body:'Public'}]:[{body:'Public'},{body:'Private',is_internal:true}])
   }
   return json([])
  }
  for(const query of [{},{id:ticket}]){
   const res={status(n){this.code=n;return this},json(b){this.body=b},setHeader(){}}
   await handler({method:'GET',headers:{authorization:'Bearer fixture'},query},res)
   assert.equal(res.code,200)
   if(query.id){assert.equal(res.body.conversation.id,ticket);assert.equal(res.body.messages.length,role==='OPERATIONS'?1:2)}
   else assert.equal(res.body.conversations[0].id,ticket)
  }
 }
})

test('Preview browser build and privileged API/worker clients require the same independent staging pin', async()=>{
 const {resolveSupabaseUrl,resolveSupabaseAnonKey}=await load('/shared/supabasePublicConfig.ts')
 const {getSupabaseAdmin}=await load('/api/_lib/support.ts')
 const quote=(await load('/api/activation-quote.ts')).default
 const stage='evermontisolatedtest', prod='gdodqiwjcezdznzroupw'
 const url=ref=>'https://'+ref+'.supabase.co'
 const anon=ref=>'eyJ0.'+Buffer.from(JSON.stringify({role:'anon',ref})).toString('base64url')+'.synthetic'
 const good={VERCEL_ENV:'preview',STAGING_SUPABASE_PROJECT_REF:stage,VITE_SUPABASE_URL:url(stage),
   SUPABASE_URL:url(stage),NEXT_PUBLIC_SUPABASE_URL:url(stage),VITE_SUPABASE_ANON_KEY:anon(stage),
   VITE_SUPABASE_PUBLISHABLE_KEY:'',SUPABASE_SERVICE_ROLE_KEY:'fixture'}
 const bind=cfg=>{for(const k of Object.keys(good)){env(k,cfg[k]??'');if(cfg[k]===undefined)delete process.env[k]}}
 const requestQuote=async()=>{
   const res={status(n){this.code=n;return this},json(){},end(){},setHeader(){}}
   await quote({method:'GET',headers:{authorization:'Bearer fixture'}},res)
   return res.code
 }
 let calls=0
 transport=async()=>{calls++;throw Error('Unexpected network request')}
 for(const change of [
   {VITE_SUPABASE_URL:url(prod),SUPABASE_URL:url(prod),NEXT_PUBLIC_SUPABASE_URL:url(prod)},
   {STAGING_SUPABASE_PROJECT_REF:prod,VITE_SUPABASE_URL:url(prod),SUPABASE_URL:url(prod),NEXT_PUBLIC_SUPABASE_URL:url(prod)},
   {STAGING_SUPABASE_PROJECT_REF:undefined},{STAGING_SUPABASE_PROJECT_REF:''},{STAGING_SUPABASE_PROJECT_REF:'anotherproject'},
   {VITE_SUPABASE_URL:undefined},{SUPABASE_URL:undefined},{VITE_SUPABASE_URL:url(prod)},
   {SUPABASE_URL:url('anotherproject')},{NEXT_PUBLIC_SUPABASE_URL:url(prod)},
   {VERCEL_ENV:undefined,SUPABASE_URL:url(prod)} // private scheduler with no Vercel metadata
 ]){
   const cfg={...good,...change};bind(cfg)
   assert.throws(()=>resolveSupabaseUrl(cfg,true),/Preview/)
   assert.throws(()=>getSupabaseAdmin(),/Preview/) // same initializer used by scripts/support-worker.ts
   assert.equal(await requestQuote(),503)
 }
 assert.equal(calls,0)
 bind(good)
 assert.equal(resolveSupabaseUrl(good,true),url(stage))
 await assert.rejects(resolveSupabaseAnonKey({},url(stage)))
 await assert.rejects(resolveSupabaseAnonKey({VITE_SUPABASE_ANON_KEY:anon(prod)},url(stage)))
 assert.equal(await resolveSupabaseAnonKey(good,url(stage)),anon(stage))
 transport=async u=>{assert.equal(u.origin,url(stage));calls++;return json({})}
 await getSupabaseAdmin().from('support_conversations').select('id').limit(1)
 assert.equal(calls,1)
 transport=async u=>{assert.equal(u.origin,url(stage));return json({message:'No session'},401)}
 assert.equal(await requestQuote(),401) // reached fixture Auth on staging
 const production={VERCEL_ENV:'production',VITE_SUPABASE_URL:url(prod),SUPABASE_URL:url(prod)}
 assert.equal(resolveSupabaseUrl(production,true),url(prod))
 assert.throws(()=>resolveSupabaseUrl({...production,VITE_SUPABASE_URL:url(stage)},true))
})

test('worker recovery distinguishes failed database reads from skipped support turns', async () => {
  const { recoverExpiredSupportTurns } = await load('/api/_lib/assistant.ts')
  transport = async () => json({ message: 'unavailable' }, 503)
  assert.equal(await recoverExpiredSupportTurns(client), false)

  for (const status of [403, 200]) {
    transport = async (url) => {
      if (url.pathname.endsWith('/rpc/expired_support_turns')) {
        return json([{ ticket, member, message: notice }])
      }
      assert.ok(url.pathname.endsWith('/support_conversations'))
      return status === 200 ? json({ human_requested: true }) : json({ message: 'denied' }, status)
    }
    assert.equal(await recoverExpiredSupportTurns(client), status === 200)
  }
})
