-- Review on the staging schema before applying. No changes to financial records.
begin;
alter table public.support_conversations add column if not exists human_requested boolean not null default false;
alter table public.support_messages add column if not exists assistant_reply_to uuid references public.support_messages(id);
alter table public.support_messages add column if not exists assistant_claimed_at timestamptz;
create unique index if not exists support_assistant_one_reply on public.support_messages(assistant_reply_to) where assistant_reply_to is not null;

-- One provider call per saved message, bounded per member. Browser inserts have column-only grants.
create or replace function public.claim_support_assistant(p_ticket uuid,p_member uuid,p_message uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_member::text,0));
  if (select count(*) from public.support_messages where sender_id=p_member and assistant_claimed_at > now()-interval '1 hour') >= 12 then return false; end if;
  update public.support_messages m set assistant_claimed_at=now() where m.id=p_message and m.sender_id=p_member
    and m.conversation_id=p_ticket and m.sender_role='member' and not m.is_internal and m.assistant_claimed_at is null
    and exists(select 1 from public.support_conversations where id=p_ticket and user_id=p_member and not human_requested and assigned_to is null and status not in ('closed','resolved'));
  return found;
end; $$;
revoke all on function public.claim_support_assistant(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_support_assistant(uuid,uuid,uuid) to service_role;

-- Service-only completion. Serialize with handoff/closure and recheck the member and source.
create or replace function public.complete_support_assistant(p_ticket uuid,p_member uuid,p_message uuid,p_body text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.support_conversations where id=p_ticket and user_id=p_member
    and not human_requested and assigned_to is null and status not in ('closed','resolved') for update;
  if not found then return false; end if;
  if not exists(select 1 from public.support_messages where id=p_message and conversation_id=p_ticket
     and sender_id=p_member and sender_role='member' and not is_internal and assistant_claimed_at is not null) then return false; end if;
  insert into public.support_messages(conversation_id,sender_role,body,is_internal,read_by_support,read_by_member,assistant_reply_to)
    values(p_ticket,'system','EVERMONT AI Support: ' || p_body,false,true,false,p_message)
    on conflict (assistant_reply_to) where assistant_reply_to is not null do nothing;
  return found;
end; $$;
revoke all on function public.complete_support_assistant(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.complete_support_assistant(uuid,uuid,uuid,text) to service_role;

-- Member chat reads use the member's JWT. Staff dashboards use the server role after authorization.
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
create policy support_owner_boundary on public.support_conversations as restrictive for select to authenticated
using (user_id=(select auth.uid()));
create policy support_visible_messages on public.support_messages as restrictive for select to authenticated
using (not is_internal and exists(select 1 from public.support_conversations c where c.id=conversation_id and c.user_id=(select auth.uid())));
revoke update,delete on public.support_messages, public.support_conversations from public,anon,authenticated;

-- This endpoint becomes available only together with the internal-note read boundary.
create or replace function public.add_internal_support_note(p_ticket uuid,p_staff uuid,p_body text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.admin_roles where user_id=p_staff and role in ('ADMIN','SUPER_ADMIN','SUPPORT')) then
    raise exception 'Staff permission required';
  end if;
  insert into public.support_messages(conversation_id,sender_id,sender_role,is_internal,body,read_by_support)
    values(p_ticket,p_staff,'support',true,p_body,true) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.add_internal_support_note(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.add_internal_support_note(uuid,uuid,text) to service_role;

-- When a verified staff reply arrives (portal or Gmail), keep the ticket with humans.
create or replace function public.on_human_support_reply() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.sender_role='support' and not new.is_internal then
    update public.support_conversations set human_requested=true,
      status=case when status in ('closed','resolved') then status else 'pending_member' end where id=new.conversation_id;
  end if;
  return new;
end; $$;
create trigger on_human_support_reply after insert on public.support_messages for each row execute function public.on_human_support_reply();

-- Reject replies to closed tickets even if a client calls PostgREST directly.
create policy support_open_member_posts on public.support_messages as restrictive for insert to authenticated
with check (exists (select 1 from public.support_conversations c where c.id=conversation_id and c.user_id=(select auth.uid()) and c.status not in ('resolved','closed')));
-- Serialize submissions per authenticated member; service/staff delivery is unaffected.
create or replace function public.limit_member_chat_writes() returns trigger
language plpgsql security invoker set search_path='' as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text, 19));
  if tg_table_name='support_messages' then
    if length(trim(new.body)) not between 1 and 4000 or
      (select count(*) from public.support_messages where sender_id=owner_id and created_at>now()-interval '1 minute')>=12
      then raise exception 'Message limit reached or invalid message'; end if;
  else
    if length(trim(new.subject)) not between 1 and 160 or
      (select count(*) from public.support_conversations where user_id=owner_id and created_at>now()-interval '1 hour')>=15
      then raise exception 'Conversation limit reached or invalid subject'; end if;
  end if;
  return new;
end; $$;
create trigger limit_member_chat_messages before insert on public.support_messages for each row execute function public.limit_member_chat_writes();
create trigger limit_member_chat_tickets before insert on public.support_conversations for each row execute function public.limit_member_chat_writes();
commit;
