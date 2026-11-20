begin;

create or replace function public.claim_support_notification_for_conversation(p_conversation_id uuid)
returns setof public.support_notification_outbox
language sql
security definer
set search_path = ''
as $$
  with candidate as (
    select o.id
    from public.support_notification_outbox o
    where o.conversation_id = p_conversation_id
      and o.attempt_count < 6
      and (
        (o.status in ('pending', 'failed') and o.available_at <= now())
        or (o.status = 'processing' and o.locked_at < now() - interval '5 minutes')
      )
    order by o.available_at, o.created_at
    for update skip locked
    limit 1
  )
  update public.support_notification_outbox o
  set status = 'processing',
      attempt_count = o.attempt_count + 1,
      locked_at = now(),
      updated_at = now()
  from candidate c
  where o.id = c.id
  returning o.*;
$$;
revoke all on function public.claim_support_notification_for_conversation(uuid) from public, anon, authenticated;
grant execute on function public.claim_support_notification_for_conversation(uuid) to service_role;

commit;
