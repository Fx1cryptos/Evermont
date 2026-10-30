-- Security hardening for member/admin data access.
-- Review and apply through the approved Supabase migration workflow; do not run blindly in production.

create or replace function public.is_admin_user(required_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = (select auth.uid())
      and (required_roles is null or ar.role = any(required_roles))
  );
$$;

revoke all on function public.set_admin_role(uuid, text) from public, anon, authenticated;
create or replace function public.set_admin_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user(array['SUPER_ADMIN']) then
    raise exception 'administrator authorization required';
  end if;
  if p_role not in ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT', 'COMPLIANCE', 'READ_ONLY') then
    raise exception 'invalid administrator role';
  end if;
  insert into public.admin_roles(user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$;
revoke all on function public.set_admin_role(uuid, text) from public, anon;
grant execute on function public.set_admin_role(uuid, text) to authenticated;

revoke all on function public.create_ledger_entry(uuid, uuid, text, text, numeric, text, text, text) from public, anon, authenticated;
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
  v_account_member uuid;
begin
  if not public.is_admin_user(array['SUPER_ADMIN', 'ADMIN', 'OPERATIONS']) then
    raise exception 'ledger authorization required';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 100000000 then
    raise exception 'amount must be positive and within the allowed limit';
  end if;
  if p_entry_type not in ('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'opening_balance') then
    raise exception 'invalid entry type';
  end if;
  select balance, user_id into v_current_balance, v_account_member
  from public.accounts where id = p_account_id for update;
  if v_current_balance is null or v_account_member <> p_member_id then
    raise exception 'account/member mismatch';
  end if;
  if p_entry_type in ('withdrawal', 'fee') and p_amount > v_current_balance then
    raise exception 'insufficient funds';
  end if;
  if p_entry_type in ('withdrawal', 'fee') then
    v_next_balance := v_current_balance - p_amount; v_debit := p_amount; v_credit := null;
  else
    v_next_balance := v_current_balance + p_amount; v_debit := null; v_credit := p_amount;
  end if;
  insert into public.ledger_entries(account_id, member_id, reference_id, entry_type, amount, debit, credit, description, category, status, balance_after)
  values (p_account_id, p_member_id, p_reference_id, p_entry_type, p_amount, v_debit, v_credit, p_description, coalesce(p_category, 'general'), coalesce(p_status, 'completed'), v_next_balance);
  update public.accounts set balance = v_next_balance, updated_at = now() where id = p_account_id;
  insert into public.audit_logs(staff_id, action, resource_type, resource_id, details)
  values (auth.uid(), 'ledger_entry_created', 'ledger_entries', p_reference_id, jsonb_build_object('account_id', p_account_id, 'member_id', p_member_id, 'amount', p_amount));
  return jsonb_build_object('account_id', p_account_id, 'member_id', p_member_id, 'reference_id', p_reference_id, 'balance_after', v_next_balance);
end;
$$;
revoke all on function public.create_ledger_entry(uuid, uuid, text, text, numeric, text, text, text) from public, anon;
grant execute on function public.create_ledger_entry(uuid, uuid, text, text, numeric, text, text, text) to authenticated;

revoke insert, update, delete on public.accounts, public.ledger_entries, public.audit_logs, public.admin_roles from authenticated;
grant select on public.profiles, public.accounts, public.ledger_entries to authenticated;

 drop policy if exists "admin_roles_admin_read" on public.admin_roles;
create policy "admin_roles_admin_read" on public.admin_roles for select to authenticated
using (public.is_admin_user(array['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'COMPLIANCE', 'SUPPORT']));

 drop policy if exists "profiles_admin_update_checked" on public.profiles;
create policy "profiles_admin_update_checked" on public.profiles for update to authenticated
using (public.is_admin_user(array['SUPER_ADMIN', 'ADMIN', 'OPERATIONS']))
with check (public.is_admin_user(array['SUPER_ADMIN', 'ADMIN', 'OPERATIONS']));
