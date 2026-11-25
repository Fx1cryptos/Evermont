begin;

create or replace function public.is_support_view_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = (select auth.uid())
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  );
$$;

create or replace function public.is_support_reply_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = (select auth.uid())
      and ar.role in ('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  );
$$;

revoke all on function public.is_support_view_staff() from public, anon;
revoke all on function public.is_support_reply_staff() from public, anon;
grant execute on function public.is_support_view_staff() to authenticated;
grant execute on function public.is_support_reply_staff() to authenticated;

-- Remove the legacy policy that implicitly granted OPERATIONS write access.
drop policy if exists support_messages_staff_all on public.support_messages;
drop policy if exists support_messages_staff_select on public.support_messages;
drop policy if exists support_messages_staff_insert on public.support_messages;

create policy support_messages_staff_select
  on public.support_messages
  for select to authenticated
  using (public.is_support_view_staff());

create policy support_messages_staff_insert
  on public.support_messages
  for insert to authenticated
  with check (
    public.is_support_reply_staff()
    and sender_id = (select auth.uid())
    and lower(sender_role) = 'support'
    and is_internal = false
  );

-- No staff UPDATE or DELETE policy is added. Existing member policies remain intact.

commit;
