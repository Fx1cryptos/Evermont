-- NOT APPLIED.
-- Pending service requests only. This does not post ledger entries, change balances,
-- or connect to a bank, ACH, wire, or check network.
-- Depends on the existing public.user_activation_status table used by the portal.
-- Apply manually in the Supabase SQL editor after review. Do not run from the app.

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  service_type text not null check (service_type in ('ach', 'mobile_deposit', 'check_deposit', 'wire')),
  status text not null default 'pending' check (status = 'pending'),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD',
  summary text not null,
  account_last4 text check (account_last4 is null or account_last4 ~ '^[0-9]{4}$'),
  deposit_account_id uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

alter table public.service_requests enable row level security;

drop policy if exists "service_requests_select_own" on public.service_requests;
create policy "service_requests_select_own"
on public.service_requests
for select
to authenticated
using (member_id = auth.uid() and created_by = auth.uid());

drop policy if exists "service_requests_insert_own_activated" on public.service_requests;
create policy "service_requests_insert_own_activated"
on public.service_requests
for insert
to authenticated
with check (
  member_id = auth.uid()
  and created_by = auth.uid()
  and status = 'pending'
  and exists (
    select 1
    from public.user_activation_status s
    where s.user_id = auth.uid()
      and lower(s.activation_status) = 'activated'
  )
  and (
    deposit_account_id is null
    or exists (
      select 1
      from public.accounts a
      where a.id = deposit_account_id
        and a.user_id = auth.uid()
    )
  )
);

revoke update, delete on table public.service_requests from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-request-images',
  'service-request-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "service_request_images_select_own" on storage.objects;
create policy "service_request_images_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'service-request-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "service_request_images_insert_own" on storage.objects;
create policy "service_request_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'service-request-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.user_activation_status s
    where s.user_id = auth.uid()
      and lower(s.activation_status) = 'activated'
  )
);
