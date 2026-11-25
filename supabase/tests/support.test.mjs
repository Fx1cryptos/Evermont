import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {PGlite} from '@electric-sql/pglite'
test('database role matrix, private notes, handoff notification and article publication',async()=>{
 const db=new PGlite()
 try {
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$ select current_setting('test.uid')::uuid $$;
 grant usage on schema auth to authenticated;
 create table admin_roles(user_id uuid primary key,role text); grant select on admin_roles to authenticated;
 create table support_conversations(id uuid primary key,subject text,assigned_to uuid,user_id uuid,human_requested boolean,status text);
 create table support_messages(id uuid primary key default gen_random_uuid(),body text,source text, assistant_claimed_at timestamptz,client_request_id uuid,conversation_id uuid,sender_id uuid,sender_role text,is_internal boolean,created_at timestamptz default now());
 alter table support_messages enable row level security;
 create table support_notification_outbox(conversation_id uuid,message_id uuid,event_type text,dedupe_key text unique,payload jsonb);
 grant select,insert on support_messages to authenticated;
 create policy owner_messages on support_messages for select to authenticated using(not is_internal and exists(select from support_conversations where id=conversation_id and user_id=auth.uid()));
 grant select on support_conversations to authenticated;`)
 for(const f of ['supabase/migrations/20261124120000_support_staff_reply_permissions.sql','supabase/review/support_knowledge.sql'])
  await db.exec(readFileSync(f,'utf8'))
 const owner=crypto.randomUUID(),ticket=crypto.randomUUID()
 await db.query("insert into support_conversations(id,user_id,human_requested,status) values($1,$2,false,'open')",[ticket,owner])
 await db.query("insert into support_messages(conversation_id,sender_id,sender_role,is_internal) values($1,$2,'member',false),($1,$2,'support',true)",[ticket,owner])
 await db.query("update support_conversations set human_requested=true,status='pending_support' where id=$1",[ticket])
 assert.equal((await db.query('select count(*)::int as n from support_notification_outbox')).rows[0].n,1)
 for(const role of ['SUPER_ADMIN','ADMIN','SUPPORT','OPERATIONS','COMPLIANCE','READ_ONLY','member','other']){
  const id=role==='member'?owner:crypto.randomUUID()
  if(role!=='member'&&role!=='other')await db.query('insert into admin_roles values($1,$2)',[id,role])
  await db.query("select set_config('test.uid',$1,false)",[id]);await db.exec('set role authenticated')
  const view=['ADMIN','SUPER_ADMIN','SUPPORT','OPERATIONS'].includes(role), manage=view&&role!=='OPERATIONS'
  assert.deepEqual((await db.query('select is_support_view_staff() as view,is_support_reply_staff() as manage')).rows[0],{view,manage})
  const rows=(await db.query('select * from support_messages')).rows
  assert.equal(rows.some(r=>r.is_internal),manage)
  assert.equal(rows.length>0,view||id===owner)
  const reply=()=>db.query("insert into support_messages(conversation_id,sender_id,sender_role,is_internal) values($1,$2,'support',false)",[ticket,id])
  if(manage)await reply();else await assert.rejects(reply)
  const article=()=>db.query("insert into support_knowledge_articles values($1,'topic','approved answer',false)",[role.toLowerCase()])
  if(['SUPER_ADMIN','ADMIN'].includes(role))await article();else await assert.rejects(article)
  await db.exec('reset role')
 }
 }finally{await db.close()}
})
test('atomic member -> AI -> human -> reply -> follow-up with isolated PostgreSQL sessions',async()=>{
 const db=new PGlite()
 try {
 const file=f=>readFileSync(f,'utf8')
 await db.exec(file('supabase/tests/fixtures/support_base_schema.sql'))
 for(const f of ['supabase/migrations/20261121130000_support_gmail_inbox.sql','supabase/review/member_support.sql','supabase/review/support_message_submission.sql','supabase/migrations/20261124120000_support_staff_reply_permissions.sql','supabase/review/support_knowledge.sql']) await db.exec(file(f))
 const member=crypto.randomUUID(),staff=crypto.randomUUID(),other=crypto.randomUUID(),req=crypto.randomUUID()
 const session=async(id,role)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role)}
 await db.query("insert into admin_roles values($1,'ADMIN')",[staff])
 await session(member,'authenticated')
 const submit=async(key,ticket,subject,body)=>(await db.query('select submit_member_support_message($1,$2,$3,$4) as ticket',[key,ticket,subject,body])).rows[0].ticket
 const ticket=await submit(req,null,'Question: statements','Where are statements?')
 assert.equal(await submit(req,null,'Question: statements','Where are statements?'),ticket)
 const msg=(await db.query('select id from support_messages')).rows[0].id
 await session('','service_role')
 const lease=crypto.randomUUID()
 const claim=async(id)=>(await db.query('select claim_support_assistant($1,$2,$3,$4) as ok',[ticket,member,id,lease])).rows[0].ok
 const complete=async(id)=>(await db.query("select complete_support_assistant($1,$2,$3,$4,'Open Statements.') as ok",[ticket,member,id,lease])).rows[0].ok
 assert.equal(await claim(msg),true);assert.equal(await complete(msg),true);assert.equal(await complete(msg),false)
 await db.query("update support_conversations set human_requested=true,status='pending_support' where id=$1",[ticket])
 assert.equal(await complete(msg),false)
 await db.query("insert into support_messages(conversation_id,sender_id,sender_role,body) values($1,$2,'support','Staff reply')",[ticket,staff])
 await db.query("select add_internal_support_note($1,$2,'Private note')",[ticket,staff])
 await session(member,'authenticated')
 const visible=(await db.query('select sender_role,body from support_messages order by created_at,id')).rows
 assert.deepEqual(visible.map(m=>m.sender_role),['member','system','support'])
 await submit(crypto.randomUUID(),ticket,null,'Thank you')
 assert.equal((await db.query('select status from support_conversations')).rows[0].status,'pending_support')
 await session(other,'authenticated');assert.equal((await db.query('select id from support_messages')).rows.length,0)
 await assert.rejects(submit(crypto.randomUUID(),ticket,null,'Other member'))
 await session('','service_role')
 const follow=(await db.query("select id from support_messages where body='Thank you'")).rows[0].id
 assert.equal(await claim(follow),false)
 await db.query("update support_conversations set assistant_resumed=true,human_requested=false,status='open' where id=$1",[ticket])
 assert.equal(await claim(follow),false) // A resume only authorizes new member turns.
 } finally {await db.close()}
})

test('Gmail policy compatibility, complaint replay, AI lease races and protected control fields',async()=>{
 const db=new PGlite(), owner=crypto.randomUUID(),staff=crypto.randomUUID()
 const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0]
 const submit=(subject,body,key=crypto.randomUUID(),ticket=null)=>scalar('select submit_member_support_message($1,$2,$3,$4)',[key,ticket,subject,body])
 const session=async(role)=>{await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[role==='authenticated'?owner:'']);await db.exec('set role '+role)}
 try{
  for(const f of ['supabase/tests/fixtures/support_base_schema.sql','supabase/migrations/20261121120000_support_outbox_worker.sql','supabase/migrations/20261121123000_support_notification_scoped_claim.sql','supabase/migrations/20261121130000_support_gmail_inbox.sql','supabase/review/member_support.sql','supabase/review/support_message_submission.sql','supabase/migrations/20261124120000_support_staff_reply_permissions.sql','supabase/review/support_knowledge.sql'])await db.exec(readFileSync(f,'utf8'))
  for(const [table,columns] of Object.entries({support_conversations:['human_requested','assigned_to','status','assistant_resumed','handling_changed_at'],support_messages:['delivery_status','assistant_lease','assistant_claimed_at','assistant_attempts','read_by_support']}))
   for(const column of columns)for(const perm of ['INSERT','UPDATE'])assert.equal(await scalar("select has_column_privilege('authenticated',$1,$2,$3)",[table,column,perm]),false)
  assert.equal(await scalar("select has_column_privilege('authenticated','support_conversations','user_id','UPDATE')"),false)
  await session('authenticated')
  for(const category of ['Account Access','Transactions','Cards','Beneficiaries','Statements','Account Activation','General Enquiry']){
   const subject=category+': need help',key=crypto.randomUUID()
   const id=await submit(subject,'Please respond',key)
   assert.equal(await submit(subject,'Please respond',key),id)
   assert.equal(await scalar('select status from support_conversations where id=$1',[id]),'pending_support')
  }
  const ticket=await submit('Question: navigation','Where are my statements?')
  let msg=await scalar('select id from support_messages where conversation_id=$1',[ticket])
  const claim=lease=>scalar('select claim_support_assistant($1,$2,$3,$4)',[ticket,owner,msg,lease])
  const finish=(lease,answer)=>scalar('select complete_support_assistant($1,$2,$3,$4,$5)',[ticket,owner,msg,lease,answer])
  const expire=()=>db.query("update support_messages set assistant_claimed_at=now()-interval '1 day' where id=$1",[msg])
  await session('service_role')
  assert.equal(await scalar("select count(*)::int from support_notification_outbox where event_type='support_message'"),8)
  const notice=await scalar('select id from claim_support_notification_for_conversation($1)',[ticket])
  assert.ok(notice)
  assert.equal(await scalar('select count(*)::int from claim_support_notification_for_conversation($1)',[ticket]),0)
  await db.query("update support_notification_outbox set locked_at=now()-interval '6 minutes' where id=$1",[notice])
  assert.equal(await scalar('select attempt_count from claim_support_notification_for_conversation($1)',[ticket]),2)
  const first=crypto.randomUUID(),retry=crypto.randomUUID()
  assert.equal(await claim(first),true);assert.equal(await claim(retry),false)
  await expire();assert.equal(await scalar('select count(*)::int from expired_support_turns()'),1)
  assert.equal(await claim(retry),true);assert.equal(await finish(first,null),false);assert.equal(await finish(first,'Late'),false)
  await db.query("update support_conversations set human_requested=true,assigned_to=$2,status='pending_support' where id=$1",[ticket,staff])
  assert.equal(await finish(retry,'Late'),false)
  await db.query("update support_conversations set human_requested=false,assistant_resumed=true,assigned_to=null,status='open' where id=$1",[ticket])
  assert.equal(await finish(retry,null),false);assert.equal(await claim(first),false)
  const handoffCount=()=>scalar("select count(*)::int from support_notification_outbox where conversation_id=$1 and payload->>'handoff'='true'",[ticket])
  assert.equal(await handoffCount(),1)
  for(let i=0;i<2;i++) await db.query("update support_conversations set human_requested=true,status='pending_support' where id=$1",[ticket])
  assert.equal(await handoffCount(),2) // second legitimate handoff, no duplicate on re-acknowledgement
  await db.query("update support_conversations set human_requested=false,assistant_resumed=true,status='open' where id=$1",[ticket])
  const mail=role=>db.query("insert into support_messages(conversation_id,sender_id,sender_role,source,body) values($1,$2,$3,'gmail','Reply')",[ticket,role==='member'?owner:staff,role])
  await assert.rejects(mail('support'),e=>e.code==='PT409')
  await mail('member')
  assert.deepEqual((await db.query('select status,human_requested from support_conversations where id=$1',[ticket])).rows[0],{status:'open',human_requested:false})
  msg=await scalar("select id from support_messages where conversation_id=$1 and source='gmail'",[ticket])
  for(let attempt=0;attempt<3;attempt++){assert.equal(await claim(crypto.randomUUID()),true);await expire()}
  assert.equal(await claim(crypto.randomUUID()),false)
  assert.equal(await scalar('select status from support_conversations where id=$1',[ticket]),'pending_support')
  await db.query("update support_conversations set status='closed' where id=$1",[ticket])
  for(const role of ['member','support'])await assert.rejects(mail(role),e=>e.code==='PT409')
  await session('authenticated')
  const next=await submit('Question: help','Please explain Statements')
  msg=await scalar('select id from support_messages where conversation_id=$1',[next])
  await session('service_role')
  const recoveryLease=crypto.randomUUID()
  assert.equal(await scalar('select claim_support_assistant($1,$2,$3,$4)',[next,owner,msg,first]),true)
  await expire()
  assert.equal(await scalar('select claim_support_assistant($1,$2,$3,$4)',[next,owner,msg,recoveryLease]),true)
  for(const [lease,expected] of [[first,false],[recoveryLease,true],[recoveryLease,false]])
   assert.equal(await scalar("select complete_support_assistant($1,$2,$3,$4,'Open Statements.')",[next,owner,msg,lease]),expected)
  assert.equal(await scalar('select count(*)::int from support_messages where assistant_reply_to=$1',[msg]),1)
  await session('authenticated')
  // The existing per-minute member trigger rejects the 13th turn. A new
  // conversation created immediately before that rejection must roll back too.
  while(await scalar("select count(*)::int from support_messages where sender_id=$1 and created_at>now()-interval '1 minute'",[owner])<12)
   await submit(null,'Follow up',crypto.randomUUID(),next)
  const before=await scalar('select count(*)::int from support_conversations')
  await assert.rejects(submit('Account Access: again','Help'),/Message limit/)
  assert.equal(await scalar('select count(*)::int from support_conversations'),before)
 }finally{await db.close()}
})
