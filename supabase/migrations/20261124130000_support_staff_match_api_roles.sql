begin;

-- Direct data-API access to support rows follows the role list the support API
-- uses to view conversations: SUPER_ADMIN, ADMIN, OPERATIONS and SUPPORT.
-- COMPLIANCE is removed here: api/_lib/support.ts never granted it support
-- access, so the database should not either. The function keeps the same
-- signature, security definer, empty search_path and grants as the live one.
create or replace function public.is_support_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = auth.uid()
      and upper(ar.role) in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  );
$$;
revoke all on function public.is_support_staff() from public, anon;
grant execute on function public.is_support_staff() to authenticated, service_role;

commit;
