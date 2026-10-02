create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  street text,
  city text,
  state text,
  zip_code text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT', 'COMPLIANCE', 'READ_ONLY')),
  created_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_number text not null unique,
  account_type text not null check (account_type in ('checking', 'savings', 'money_market')),
  balance numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'active' check (status in ('active', 'inactive', 'frozen')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  reference_id text not null unique,
  entry_type text not null check (
    entry_type in ('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'opening_balance')
  ),
  amount numeric(12,2) not null,
  debit numeric(12,2),
  credit numeric(12,2),
  description text not null,
  category text not null default 'general',
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'reversed')),
  balance_after numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'success' check (status in ('success', 'failure')),
  timestamp timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_ledger_entries_account_id on public.ledger_entries(account_id);
create index if not exists idx_ledger_entries_member_id on public.ledger_entries(member_id);
create index if not exists idx_ledger_entries_created_at on public.ledger_entries(created_at);
create index if not exists idx_audit_logs_staff_id on public.audit_logs(staff_id);

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.accounts enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
on public.profiles
for select
using (
  exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'COMPLIANCE', 'SUPPORT')
  )
);

drop policy if exists "accounts_owner_read" on public.accounts;
create policy "accounts_owner_read"
on public.accounts
for select
using (auth.uid() = user_id);

drop policy if exists "accounts_admin_read" on public.accounts;
create policy "accounts_admin_read"
on public.accounts
for select
using (
  exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'COMPLIANCE')
  )
);

drop policy if exists "ledger_owner_read" on public.ledger_entries;
create policy "ledger_owner_read"
on public.ledger_entries
for select
using (auth.uid() = member_id);

drop policy if exists "ledger_admin_read" on public.ledger_entries;
create policy "ledger_admin_read"
on public.ledger_entries
for select
using (
  exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'COMPLIANCE')
  )
);

drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read"
on public.audit_logs
for select
using (
  exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'COMPLIANCE')
  )
);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update
using (
  exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS')
  )
);

create or replace function public.set_admin_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_roles(user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id)
  do update set role = excluded.role;
end;
$$;

create or replace function public.create_ledger_entry(
  p_account_id uuid,
  p_member_id uuid,
  p_reference_id text,
  p_entry_type text,
  p_amount numeric,
  p_description text,
  p_category text default 'general',
  p_status text default 'completed'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance numeric(12,2);
  v_next_balance numeric(12,2);
  v_debit numeric(12,2);
  v_credit numeric(12,2);
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  if p_entry_type not in ('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'opening_balance') then
    raise exception 'invalid entry type';
  end if;

  select balance
    into v_current_balance
  from public.accounts
  where id = p_account_id
  for update;

  if v_current_balance is null then
    raise exception 'account not found';
  end if;

  if p_entry_type in ('withdrawal', 'fee') then
    v_next_balance := v_current_balance - p_amount;
    v_debit := p_amount;
    v_credit := null;
  else
    v_next_balance := v_current_balance + p_amount;
    v_debit := null;
    v_credit := p_amount;
  end if;

  insert into public.ledger_entries (
    account_id,
    member_id,
    reference_id,
    entry_type,
    amount,
    debit,
    credit,
    description,
    category,
    status,
    balance_after,
    created_at,
    updated_at
  )
  values (
    p_account_id,
    p_member_id,
    p_reference_id,
    p_entry_type,
    p_amount,
    v_debit,
    v_credit,
    p_description,
    p_category,
    p_status,
    v_next_balance,
    now(),
    now()
  );

  update public.accounts
  set balance = v_next_balance,
      updated_at = now()
  where id = p_account_id;

  insert into public.audit_logs (
    staff_id,
    action,
    resource_type,
    resource_id,
    details,
    status,
    timestamp
  )
  values (
    auth.uid(),
    'ledger_entry_created',
    'ledger_entries',
    p_reference_id,
    jsonb_build_object(
      'account_id', p_account_id,
      'member_id', p_member_id,
      'entry_type', p_entry_type,
      'amount', p_amount,
      'description', p_description,
      'balance_after', v_next_balance
    ),
    'success',
    now()
  );

  return jsonb_build_object(
    'account_id', p_account_id,
    'member_id', p_member_id,
    'reference_id', p_reference_id,
    'entry_type', p_entry_type,
    'amount', p_amount,
    'balance_after', v_next_balance
  );
end;
$$;

grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;
grant all on public.accounts to authenticated;
grant all on public.ledger_entries to authenticated;
grant all on public.audit_logs to authenticated;
grant all on public.admin_roles to authenticated;
