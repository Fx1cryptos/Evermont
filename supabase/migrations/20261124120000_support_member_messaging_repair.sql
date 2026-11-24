begin;

-- Guard: this migration needs the columns added by 20261121130000_support_gmail_inbox.sql.
-- Apply that migration first; otherwise this one stops here and changes nothing.
do $$
declare
  v_column text;
begin
  foreach v_column in array array['source', 'delivery_status', 'delivery_error', 'gmail_message_id', 'gmail_thread_id', 'gmail_rfc_message_id', 'gmail_references'] loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'support_messages' and column_name = v_column
    ) then
      raise exception 'public.support_messages.% is missing: apply 20261121130000_support_gmail_inbox.sql before 20261124120000', v_column;
    end if;
  end loop;
end;
$$;

-- Member replies: allowed on open, pending_support, pending_member and resolved
-- conversations. Closed conversations accept no member replies.
-- The check is a security definer helper so the policy does not depend on the
-- caller seeing the conversation row through another policy.
create or replace function public.support_member_can_post(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.support_conversations c
    where c.id = p_conversation_id
      and c.user_id = (select auth.uid())
      and c.status in ('open', 'pending_support', 'pending_member', 'resolved')
  );
$$;
revoke all on function public.support_member_can_post(uuid) from public, anon;
grant execute on function public.support_member_can_post(uuid) to authenticated, service_role;

-- Recreate the member message INSERT policy (replaces the one from
-- 20261121130000, which is kept as written). Same column protections, plus the
-- closed-status rule, a body length limit and the helper above.
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
    and char_length(body) between 1 and 4000
    and (select public.support_member_can_post(conversation_id))
  );

-- A member reply moves a resolved or pending_member conversation to pending_support.
-- Open conversations keep their status. Runs as definer because members have no
-- UPDATE grant on support_conversations.
create or replace function public.support_member_message_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_internal = false and lower(new.sender_role) = 'member' then
    update public.support_conversations
    set status = 'pending_support',
        updated_at = new.created_at
    where id = new.conversation_id
      and status in ('resolved', 'pending_member');
  end if;
  return new;
end;
$$;
revoke all on function public.support_member_message_status() from public, anon, authenticated;

drop trigger if exists support_member_message_status on public.support_messages;
create trigger support_member_message_status
  after insert on public.support_messages
  for each row execute function public.support_member_message_status();

-- Read receipts for staff replies. The member can mark only replies on their own
-- conversation as read; no UPDATE grant is given to authenticated.
create or replace function public.support_mark_member_read(p_conversation_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated integer;
begin
  if not exists (
    select 1
    from public.support_conversations c
    where c.id = p_conversation_id
      and c.user_id = (select auth.uid())
  ) then
    raise exception 'Conversation not found' using errcode = 'P0002';
  end if;

  update public.support_messages m
  set read_by_member = true
  where m.conversation_id = p_conversation_id
    and m.is_internal = false
    and m.read_by_member = false
    and lower(m.sender_role) = 'support';

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;
revoke all on function public.support_mark_member_read(uuid) from public, anon;
grant execute on function public.support_mark_member_read(uuid) to authenticated, service_role;

-- Create a conversation and its first message in one transaction, so a failed
-- message no longer leaves an empty conversation behind. Runs as the caller, so
-- the insert policies and column grants still apply.
create or replace function public.create_support_conversation(p_subject text, p_body text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_subject text;
  v_body text;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Sign in to contact support' using errcode = '42501';
  end if;

  v_subject := left(coalesce(nullif(btrim(p_subject), ''), 'Support request'), 120);
  v_body := btrim(coalesce(p_body, ''));
  if char_length(v_body) < 1 or char_length(v_body) > 4000 then
    raise exception 'Write a message of 1 to 4,000 characters' using errcode = '22023';
  end if;

  insert into public.support_conversations (user_id, subject)
  values (v_user, v_subject)
  returning id into v_id;

  insert into public.support_messages (conversation_id, sender_id, sender_role, body, is_internal)
  values (v_id, v_user, 'member', v_body, false);

  return v_id;
end;
$$;
revoke all on function public.create_support_conversation(text, text) from public, anon;
grant execute on function public.create_support_conversation(text, text) to authenticated;

-- Realtime: members receive only rows their SELECT policies allow.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_messages'
    ) then
      alter publication supabase_realtime add table public.support_messages;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_conversations'
    ) then
      alter publication supabase_realtime add table public.support_conversations;
    end if;
  end if;
end;
$$;

commit;
