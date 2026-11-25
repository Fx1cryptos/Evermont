-- Review on staging first. No existing financial or support rows are rewritten.
begin;
alter table public.support_messages add column if not exists client_request_id uuid;
create unique index if not exists support_member_request_once
  on public.support_messages(sender_id, client_request_id) where client_request_id is not null;
-- Supports both per-conversation unread counts and the staff dashboard total.
create index if not exists support_unread_member_by_ticket
  on public.support_messages(conversation_id)
  where sender_role = 'member' and read_by_support = false and is_internal = false;
grant insert(client_request_id) on public.support_messages to authenticated;

create or replace function public.submit_member_support_message(
  p_request uuid, p_ticket uuid, p_subject text, p_body text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  ticket_id uuid := p_ticket;
  previous record;
begin
  if owner_id is null or p_request is null or coalesce(length(trim(p_body)),0) not between 1 and 4000
    or (ticket_id is null and coalesce(length(trim(p_subject)),0) not between 1 and 120)
  then raise exception 'Invalid support submission'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text || p_request::text, 0));
  select m.conversation_id,m.body,c.subject into previous
    from public.support_messages m join public.support_conversations c on c.id=m.conversation_id
    where m.sender_id=owner_id and m.client_request_id::text=p_request::text and c.user_id=owner_id;
  if found then
    if previous.body <> trim(p_body) or (ticket_id is not null and ticket_id <> previous.conversation_id)
      or (ticket_id is null and previous.subject <> trim(p_subject))
    then raise exception 'Support request identifier already used'; end if;
    return previous.conversation_id;
  end if;
  if ticket_id is null then
    insert into public.support_conversations(user_id,subject) values(owner_id,trim(p_subject)) returning id into ticket_id;
  elsif not exists(select 1 from public.support_conversations where id=ticket_id and user_id=owner_id and status not in ('resolved','closed')) then
    raise exception 'Support conversation unavailable';
  end if;
  insert into public.support_messages(conversation_id,sender_id,sender_role,body,is_internal,client_request_id)
    values(ticket_id,owner_id,'member',trim(p_body),false,p_request);
  return ticket_id;
end;
$$;
revoke all on function public.submit_member_support_message(uuid,uuid,text,text) from public,anon;
grant execute on function public.submit_member_support_message(uuid,uuid,text,text) to authenticated;
commit;
