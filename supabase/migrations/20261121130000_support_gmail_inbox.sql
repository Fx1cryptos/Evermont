begin;

alter table public.support_conversations
  add column if not exists gmail_thread_id text;

alter table public.support_messages
  add column if not exists source text not null default 'portal',
  add column if not exists gmail_message_id text,
  add column if not exists gmail_thread_id text,
  add column if not exists gmail_rfc_message_id text,
  add column if not exists gmail_references text,
  add column if not exists delivery_status text not null default 'not_required',
  add column if not exists delivery_error text;

alter table public.support_messages
  drop constraint if exists support_messages_source_check,
  add constraint support_messages_source_check
    check (source in ('portal', 'gmail')),
  drop constraint if exists support_messages_delivery_status_check,
  add constraint support_messages_delivery_status_check
    check (delivery_status in ('not_required', 'queued', 'sending', 'sent', 'failed', 'received'));

create unique index if not exists support_messages_gmail_message_id_key
  on public.support_messages (gmail_message_id)
  where gmail_message_id is not null;

create unique index if not exists support_conversations_gmail_thread_id_key
  on public.support_conversations (gmail_thread_id)
  where gmail_thread_id is not null;

create table if not exists public.support_gmail_sync_state (
  id boolean primary key default true check (id is true),
  mailbox_email text not null,
  history_id text,
  bootstrap_history_id text,
  bootstrap_page_token text,
  history_page_token text,
  last_synced_at timestamptz,
  last_error text,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.support_gmail_sync_state enable row level security;
revoke all on public.support_gmail_sync_state from public, anon, authenticated;
grant select, insert, update, delete on public.support_gmail_sync_state to service_role;

-- Do not let browser clients forge Gmail message identifiers or delivery state.
revoke insert on public.support_conversations from authenticated;
grant insert (user_id, subject) on public.support_conversations to authenticated;

revoke insert on public.support_messages from authenticated;
grant insert (conversation_id, sender_id, sender_role, body, is_internal) on public.support_messages to authenticated;

drop policy if exists support_conversations_member_insert on public.support_conversations;
create policy support_conversations_member_insert
  on public.support_conversations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'open'
    and priority = 'normal'
    and assigned_to is null
    and gmail_thread_id is null
  );

drop policy if exists support_messages_member_insert on public.support_messages;
create policy support_messages_member_insert
  on public.support_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and lower(sender_role) = 'member'
    and is_internal = false
    and source = 'portal'
    and delivery_status = 'not_required'
    and gmail_message_id is null
    and gmail_thread_id is null
    and gmail_rfc_message_id is null
    and gmail_references is null
    and delivery_error is null
    and exists (
      select 1
      from public.support_conversations c
      where c.id = support_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

create or replace function public.enqueue_support_message_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.support_conversations
  set last_message_at = new.created_at,
      updated_at = new.created_at
  where id = new.conversation_id;

  if new.is_internal = false and new.source <> 'gmail' then
    if lower(new.sender_role) = 'member' then
      insert into public.support_notification_outbox (
        conversation_id, message_id, event_type, dedupe_key, payload
      ) values (
        new.conversation_id, new.id, 'support_message',
        'support-message:' || new.id::text, '{}'::jsonb
      ) on conflict (dedupe_key) do nothing;
    elsif lower(new.sender_role) = 'support' then
      insert into public.support_notification_outbox (
        conversation_id, message_id, event_type, dedupe_key, payload
      ) values (
        new.conversation_id, new.id, 'support_reply',
        'support-reply:' || new.id::text, '{}'::jsonb
      ) on conflict (dedupe_key) do nothing;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.enqueue_support_message_notification() from public, anon, authenticated;

drop trigger if exists enqueue_support_message_notification on public.support_messages;
create trigger enqueue_support_message_notification
after insert on public.support_messages
for each row execute function public.enqueue_support_message_notification();

create or replace function public.claim_support_gmail_sync(p_mailbox_email text, p_lock_seconds integer default 180)
returns setof public.support_gmail_sync_state
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.support_gmail_sync_state (id, mailbox_email)
  values (true, lower(trim(p_mailbox_email)))
  on conflict (id) do nothing;

  return query
    update public.support_gmail_sync_state s
    set mailbox_email = lower(trim(p_mailbox_email)),
        locked_until = now() + make_interval(secs => greatest(30, least(coalesce(p_lock_seconds, 180), 600))),
        updated_at = now()
    where s.id = true
      and (s.locked_until is null or s.locked_until < now())
      and (
        s.mailbox_email = lower(trim(p_mailbox_email))
        or (s.history_id is null and s.bootstrap_history_id is null)
      )
    returning s.*;
end;
$$;
revoke all on function public.claim_support_gmail_sync(text, integer) from public, anon, authenticated;
grant execute on function public.claim_support_gmail_sync(text, integer) to service_role;

commit;
