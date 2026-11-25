-- Review on isolated staging after member_support.sql and the reply permissions migration.
begin;
alter table public.support_conversations add column if not exists assistant_resumed boolean not null default false;
-- The staff API writes using its separately authorized server role. Restrict direct
-- client INSERT columns so a caller cannot pre-set AI ownership or delivery fields.
revoke insert on public.support_conversations,public.support_messages from public,anon,authenticated;
grant insert(user_id,subject) on public.support_conversations to authenticated;
grant insert(conversation_id,sender_id,sender_role,body,is_internal,client_request_id) on public.support_messages to authenticated;
drop policy if exists support_conversations_staff_all on public.support_conversations;
create or replace function public.can_edit_support_knowledge() returns boolean language sql stable
 security definer set search_path='' as $$
 select exists(select 1 from public.admin_roles where user_id=(select auth.uid()) and role in ('ADMIN','SUPER_ADMIN'));
$$;
revoke all on function public.can_edit_support_knowledge() from public,anon;
grant execute on function public.can_edit_support_knowledge() to authenticated;
drop policy if exists support_notes_writer_visibility on public.support_messages;
create policy support_notes_writer_visibility on public.support_messages as restrictive for select to authenticated
 using (not is_internal or public.is_support_reply_staff());
create table if not exists public.support_knowledge_articles (
 topic text primary key check (topic ~ '^[a-z][a-z0-9_-]{0,39}$' and topic <> 'human'),
 keywords text not null check(length(trim(keywords)) between 1 and 500),
 answer text not null check(length(trim(answer)) between 1 and 1800),
 published boolean not null default false
);
alter table public.support_knowledge_articles enable row level security;
revoke all on public.support_knowledge_articles from public,anon,authenticated;
grant select,insert,update on public.support_knowledge_articles to authenticated;
grant select on public.support_knowledge_articles to service_role;
drop policy if exists support_knowledge_admin on public.support_knowledge_articles;
create policy support_knowledge_admin on public.support_knowledge_articles to authenticated
 using(public.can_edit_support_knowledge())
 with check(public.can_edit_support_knowledge());
insert into public.support_knowledge_articles(topic,keywords,answer,published) values
 ('activation','activation,activate','Open Activation to review your verification status and requirements.',true),
 ('security','security,profile','Open Profile & Security to manage sign-in settings. Never share a password or sign-in code in chat.',true),
 ('login','login,sign in,password reset','Use Member Sign In. Choose Forgot Password if you need a recovery link.',true),
 ('beneficiaries','beneficiar,recipient','Open Beneficiaries to view recipients linked to your membership.',true),
 ('transactions','transaction,history','Open Transaction History to review activity on your own accounts.',true),
 ('cards','card','Open Cards for available card services. Contact human support for a card issue.',true),
 ('statements','statement','Open Statements to view available documents.',true),
 ('transfers','transfer,payment','Open Transfers & Payments for available options. Contact human support to investigate a specific payment.',true),
 ('ticket_status','ticket status,complaint status','You can follow this ticket in Help & Support.',true),
 ('company','evermont,contact','EVERMONT Credit Union provides member support through Help & Support in the member portal.',true)
 on conflict(topic) do nothing;
-- One job per committed false -> true transition. Repeating the UPDATE does
-- not fire the trigger; a later legitimate handoff of the same turn is a new event.
-- Gmail retries keep the original outbox id, independent of later transitions.
create or replace function public.notify_support_handoff() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.support_notification_outbox(conversation_id,message_id,event_type,dedupe_key,payload)
 select new.id,m.id,'support_message','handoff:'||gen_random_uuid(),jsonb_build_object('handoff',true)
 from public.support_messages m where m.conversation_id=new.id and m.sender_role='member' and not m.is_internal
 order by m.created_at desc,m.id desc limit 1 on conflict(dedupe_key) do nothing;
 return new;
end; $$;
drop trigger if exists support_handoff_notification on public.support_conversations;
create trigger support_handoff_notification after update of human_requested on public.support_conversations
 for each row when (new.human_requested and not old.human_requested and new.status='pending_support')
 execute function public.notify_support_handoff();
-- Keep the conversation INSERT open for its original RLS check. Its first member
-- turn routes the complaint in the atomic submit transaction below.
drop trigger if exists initialize_support_handling on public.support_conversations;
drop function if exists public.initialize_support_handling();
-- A late Gemini response cannot follow a newer turn, a handoff, or a resume.
alter table public.support_conversations add column if not exists handling_changed_at timestamptz;
create or replace function public.track_support_handling_change() returns trigger language plpgsql
 security invoker set search_path='' as $$
begin new.handling_changed_at=clock_timestamp(); return new; end; $$;
drop trigger if exists track_support_handling_change on public.support_conversations;
create trigger track_support_handling_change before update on public.support_conversations for each row
 when(old.assistant_resumed is distinct from new.assistant_resumed or old.human_requested is distinct from new.human_requested or old.assigned_to is distinct from new.assigned_to
      or (old.status in ('resolved','closed')) is distinct from (new.status in ('resolved','closed')))
 execute function public.track_support_handling_change();
-- Even a repeated explicit "return to AI" invalidates work started before that decision.
drop trigger if exists explicit_support_handling_decision on public.support_conversations;
create trigger explicit_support_handling_decision before update of assistant_resumed on public.support_conversations
 for each row execute function public.track_support_handling_change();
-- Retire unfenced entry points in the same transaction as installing their replacements.
drop function if exists public.claim_support_assistant(uuid,uuid,uuid);
drop function if exists public.complete_support_assistant(uuid,uuid,uuid,text);
alter table public.support_messages add column if not exists assistant_lease uuid,
 add column if not exists assistant_attempts smallint not null default 0;

create or replace function public.claim_support_assistant(p_ticket uuid,p_member uuid,p_message uuid,p_lease uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare changed timestamptz; turn public.support_messages%rowtype;
begin
 if p_lease is null then return false; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_member::text,0));
 select handling_changed_at into changed from public.support_conversations where id=p_ticket and user_id=p_member
   and not human_requested and assigned_to is null and status not in ('closed','resolved') for update;
 if not found then return false; end if;
 select * into turn from public.support_messages where conversation_id=p_ticket and not is_internal
   order by created_at desc,id desc limit 1;
 if turn.id is distinct from p_message or turn.sender_role <> 'member' or turn.sender_id is distinct from p_member
   or turn.created_at < changed or turn.assistant_claimed_at > clock_timestamp()-interval '1 minute' then return false; end if;
 if turn.assistant_attempts >= 3 or
    (select count(*) from public.support_messages where sender_id=p_member and assistant_claimed_at>now()-interval '1 hour')>=12 then
   update public.support_conversations set human_requested=true,status='pending_support' where id=p_ticket;
   return false;
 end if;
 update public.support_messages set assistant_claimed_at=clock_timestamp(),assistant_attempts=assistant_attempts+1,
   assistant_lease=p_lease where id=p_message;
 return true;
end; $$;

-- A NULL body means hand off. Both outcomes use the same lock and lease fence.
create or replace function public.complete_support_assistant(p_ticket uuid,p_member uuid,p_message uuid,p_lease uuid,p_body text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare changed timestamptz; turn public.support_messages%rowtype;
begin
 select handling_changed_at into changed from public.support_conversations where id=p_ticket and user_id=p_member
   and not human_requested and assigned_to is null and status not in ('closed','resolved') for update;
 if not found then return false; end if;
 select * into turn from public.support_messages where conversation_id=p_ticket and not is_internal
   order by created_at desc,id desc limit 1;
 if turn.id is distinct from p_message or turn.sender_role <> 'member' or turn.sender_id is distinct from p_member
   or p_lease is null or turn.assistant_lease is distinct from p_lease or turn.created_at < changed
   or turn.assistant_claimed_at <= clock_timestamp()-interval '1 minute' then return false; end if;
 if p_body is null then
   update public.support_conversations set human_requested=true,status='pending_support' where id=p_ticket;
   return true;
 end if;
 insert into public.support_messages(conversation_id,sender_role,body,is_internal,read_by_support,read_by_member,assistant_reply_to)
   values(p_ticket,'system','EVERMONT AI Support: '||p_body,false,true,false,p_message)
   on conflict(assistant_reply_to) where assistant_reply_to is not null do nothing;
 return found;
end; $$;
-- Recover interrupted work even if its Gmail notification has already been sent.
create or replace function public.expired_support_turns() returns table(ticket uuid,member uuid,message uuid)
language sql stable security invoker set search_path='' as $$
 select c.id,c.user_id,m.id from public.support_messages m join public.support_conversations c on c.id=m.conversation_id
 where m.assistant_claimed_at <= now()-interval '1 minute' and m.sender_role='member' and not m.is_internal
 and m.sender_id=c.user_id and m.created_at>=coalesce(c.handling_changed_at,'-infinity'::timestamptz)
 and not c.human_requested and c.assigned_to is null and c.status not in ('resolved','closed')
 and not exists(select from public.support_messages n where n.conversation_id=c.id and not n.is_internal
 and (n.created_at,n.id)>(m.created_at,m.id))
 order by m.assistant_claimed_at limit 10;
$$;
revoke all on function public.claim_support_assistant(uuid,uuid,uuid,uuid),public.complete_support_assistant(uuid,uuid,uuid,uuid,text),public.expired_support_turns() from public,anon,authenticated;
grant execute on function public.claim_support_assistant(uuid,uuid,uuid,uuid),public.complete_support_assistant(uuid,uuid,uuid,uuid,text),public.expired_support_turns() to service_role;
-- Serialize member follow-ups with closure and handoff; mirrors the existing outbox
-- trigger's trusted write boundary. No member UPDATE grant is needed.
create or replace function public.route_support_member_turn() returns trigger language plpgsql security definer set search_path='' as $$
declare ticket public.support_conversations%rowtype;
begin
 select * into strict ticket from public.support_conversations where id=new.conversation_id for update;
 if ticket.status in ('closed','resolved') then raise exception 'Conversation is closed'; end if;
 if not ticket.assistant_resumed and not ticket.human_requested and ticket.assigned_to is null
    and ticket.subject ~ '^(Account Access|Transactions|Cards|Beneficiaries|Statements|Account Activation|General Enquiry): ' then
   update public.support_conversations set human_requested=true,status='pending_support' where id=ticket.id;
 elsif ticket.human_requested or ticket.assigned_to is not null then
   update public.support_conversations set status='pending_support' where id=ticket.id;
 end if;
 return new;
end; $$;
revoke all on function public.route_support_member_turn() from public,anon,authenticated;
drop trigger if exists route_support_member_turn on public.support_messages;
create trigger route_support_member_turn before insert on public.support_messages for each row
 when (new.sender_role='member' and not new.is_internal) execute function public.route_support_member_turn();
-- Serialize email ingestion with staff decisions. Late mail cannot reopen or
-- assume control of a ticket explicitly returned to AI or owned by another agent.
create or replace function public.guard_support_email_turn() returns trigger language plpgsql
 security invoker set search_path='' as $$
declare ticket public.support_conversations%rowtype;
begin
 select * into strict ticket from public.support_conversations where id=new.conversation_id for update;
 if ticket.status in ('resolved','closed') or
    (new.sender_role='support' and ((ticket.assistant_resumed and not ticket.human_requested)
      or (ticket.assigned_to is not null and ticket.assigned_to is distinct from new.sender_id))) then
   raise exception using errcode='PT409',message='Email turn no longer eligible';
 end if;
 return new;
end; $$;
drop trigger if exists guard_support_email_turn on public.support_messages;
create trigger guard_support_email_turn before insert on public.support_messages for each row
 when (new.source='gmail') execute function public.guard_support_email_turn();
commit;
