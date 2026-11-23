-- Review only. Requires member_support.sql. Verify that message_id accepts NULL,
-- event_type accepts support_staff_alert, and dedupe_key has a unique constraint.
begin;

create or replace function public.enqueue_support_staff_transition()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  handoff boolean := new.human_requested and new.status = 'pending_support';
  priority_alert boolean := new.priority in ('high','urgent');
begin
  if new.status in ('resolved','closed') then return new; end if;
  if tg_op = 'UPDATE' then
    handoff := handoff and not (old.human_requested and old.status = 'pending_support');
    priority_alert := priority_alert and new.priority is distinct from old.priority;
  end if;
  insert into public.support_notification_outbox(conversation_id,event_type,dedupe_key,payload)
    select new.id,'support_staff_alert',
      'staff:' || new.id::text || ':' || alert || ':' || txid_current()::text,
      jsonb_build_object('alert',alert)
    from (values ('handoff',handoff), ('high_priority',priority_alert)) events(alert,eligible)
    where eligible on conflict (dedupe_key) do nothing;
  return new;
end; $$;
revoke all on function public.enqueue_support_staff_transition() from public,anon,authenticated;
drop trigger if exists enqueue_support_staff_transition on public.support_conversations;
create trigger enqueue_support_staff_transition after insert or update of human_requested,status,priority
  on public.support_conversations for each row execute function public.enqueue_support_staff_transition();

create or replace function public.enqueue_terminal_support_failure()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.support_notification_outbox(conversation_id,event_type,dedupe_key,payload)
    values(new.conversation_id,'support_staff_alert','delivery-failure:' || new.id::text,
      jsonb_build_object('alert','delivery_failure'))
    on conflict (dedupe_key) do nothing;
  return new;
end; $$;
revoke all on function public.enqueue_terminal_support_failure() from public,anon,authenticated;
drop trigger if exists enqueue_terminal_support_failure on public.support_notification_outbox;
create trigger enqueue_terminal_support_failure after update of status on public.support_notification_outbox
  for each row when (new.status='failed' and new.attempt_count >= 6 and new.conversation_id is not null
    and new.payload->>'alert' is distinct from 'delivery_failure')
  execute function public.enqueue_terminal_support_failure();

-- An overdue episode begins at the latest member message needing staff attention.
create or replace function public.enqueue_overdue_support_alerts(p_hours integer)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_hours is null or p_hours <= 0 then raise exception 'Invalid overdue threshold'; end if;
  insert into public.support_notification_outbox(conversation_id,event_type,dedupe_key,payload)
    select c.id,'support_staff_alert','overdue:' || m.id::text,jsonb_build_object('alert','overdue')
    from public.support_conversations c
    join lateral (select id,created_at,sender_role from public.support_messages
      where conversation_id=c.id and not is_internal and sender_role in ('member','support')
      order by created_at desc,id desc limit 1) m on m.sender_role='member'
    where c.status in ('open','pending_support') and (c.human_requested or c.assigned_to is not null)
      and m.created_at <= now()-make_interval(hours=>p_hours)
      and not exists(select 1 from public.support_notification_outbox o where o.dedupe_key='overdue:' || m.id::text)
    order by m.created_at,c.id limit 50 on conflict (dedupe_key) do nothing;
end; $$;
revoke all on function public.enqueue_overdue_support_alerts(integer) from public,anon,authenticated;
grant execute on function public.enqueue_overdue_support_alerts(integer) to service_role;

commit;
