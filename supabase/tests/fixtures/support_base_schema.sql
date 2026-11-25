-- Test fixture only (not a migration). Approximates the production support schema
-- as verified from live pg_policies output and the applied migration history, so the
-- repo migrations after it can be checked in an empty database. Column types that the
-- repo never declares (client_request_id, last_message_at, the outbox columns) are
-- assumptions; see the test file for what each assumption affects.

create schema if not exists auth;
create or replace function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
-- Supabase's service_role bypasses row level security; the API's service client relies on that.
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;

create table public.admin_roles (
  user_id uuid not null,
  role text not null,
  primary key (user_id, role)
);
alter table public.admin_roles enable row level security;
revoke all on public.admin_roles from anon, authenticated;

create table public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'pending_member', 'pending_support', 'resolved', 'closed')),
  priority text not null default 'normal',
  assigned_to uuid,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id uuid,
  sender_role text not null,
  body text not null,
  is_internal boolean not null default false,
  read_by_member boolean not null default false,
  read_by_support boolean not null default false,
  client_request_id text,
  created_at timestamptz not null default now()
);

create table public.support_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid,
  message_id uuid,
  event_type text not null,
  dedupe_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on public.support_notification_outbox from anon, authenticated;

create or replace function public.is_support_staff() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_roles r
    where r.user_id = (select auth.uid())
      and r.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT', 'COMPLIANCE')
  );
$$;

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

create policy support_conversations_member_insert on public.support_conversations for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy support_conversations_member_select on public.support_conversations for select to authenticated
  using (user_id = (select auth.uid()));
create policy support_conversations_staff_all on public.support_conversations for all to authenticated
  using ((select public.is_support_staff())) with check ((select public.is_support_staff()));

create policy support_messages_member_insert on public.support_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and lower(sender_role) = 'member'
    and is_internal = false
    and exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
  );
create policy support_messages_member_select on public.support_messages for select to authenticated
  using (
    is_internal = false
    and exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
  );
create policy support_messages_staff_all on public.support_messages for all to authenticated
  using ((select public.is_support_staff())) with check ((select public.is_support_staff()));

-- Table-level grants as recorded in 20261120230156 and 20261117172154.
grant select, insert on public.support_conversations to authenticated;
grant select, insert on public.support_messages to authenticated;
grant all on public.support_conversations, public.support_messages, public.support_notification_outbox, public.admin_roles to service_role;
