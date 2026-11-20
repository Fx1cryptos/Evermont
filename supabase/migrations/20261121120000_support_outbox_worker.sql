begin;

-- The admin shell needs to read only the signed-in staff member's role.
grant select on public.admin_roles to authenticated;
drop policy if exists admin_roles_select_own on public.admin_roles;
create policy admin_roles_select_own
  on public.admin_roles for select to authenticated
  using (user_id = (select auth.uid()));

-- Enqueue member messages in the same transaction that saves them. Delivery
-- happens separately, so Gmail outages never roll back a persisted message.
create or replace function public.enqueue_support_message_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(new.sender_role) = 'member' and new.is_internal = false then
    insert into public.support_notification_outbox (
      conversation_id,
      message_id,
      event_type,
      dedupe_key,
      payload
    ) values (
      new.conversation_id,
      new.id,
      'support_message',
      'support-message:' || new.id::text,
      '{}'::jsonb
    ) on conflict (dedupe_key) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.enqueue_support_message_notification() from public, anon, authenticated;

drop trigger if exists enqueue_support_message_notification on public.support_messages;
create trigger enqueue_support_message_notification
after insert on public.support_messages
for each row execute function public.enqueue_support_message_notification();

-- Claim jobs atomically to avoid duplicate workers sending the same message.
create or replace function public.claim_support_notifications(p_batch_size integer default 10)
returns setof public.support_notification_outbox
language sql
security definer
set search_path = ''
as $$
  with candidates as (
    select o.id
    from public.support_notification_outbox o
    where o.attempt_count < 6
      and (
        (o.status in ('pending', 'failed') and o.available_at <= now())
        or (o.status = 'processing' and o.locked_at < now() - interval '5 minutes')
      )
    order by o.available_at, o.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_batch_size, 10), 20))
  )
  update public.support_notification_outbox o
  set status = 'processing',
      attempt_count = o.attempt_count + 1,
      locked_at = now(),
      updated_at = now()
  from candidates c
  where o.id = c.id
  returning o.*;
$$;
revoke all on function public.claim_support_notifications(integer) from public, anon, authenticated;
grant execute on function public.claim_support_notifications(integer) to service_role;

commit;
