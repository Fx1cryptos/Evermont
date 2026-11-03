-- REQUIRED DATABASE CHANGE. NOT APPLIED BY THE APPLICATION.
--
-- Replace public.create_ledger_entry so future outgoing transfers are stored
-- as debits (debit = amount, credit null, balance decreased by amount).
-- Deposits, interest, and opening balances remain credits.
--
-- Do not run supabase/schema.sql as a whole against the live project.
-- Do not disable row level security.
-- Do not UPDATE, DELETE, or replace existing public.ledger_entries rows.
-- In particular, preserve the inheritance deposit:
--   reference_id  EML-20261009-INH
--   amount        4000000.00
--   balance_after 4310987.65
--
-- The member and admin screens classify rows already stored in
-- public.ledger_entries. They do not need this function to display that
-- deposit. Apply this script only when new transfer posts should debit
-- the account through the database function.

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

  if p_entry_type in ('withdrawal', 'fee', 'transfer') then
    v_next_balance := v_current_balance - p_amount;
    v_debit := p_amount;
    v_credit := null;
  elsif p_entry_type in ('deposit', 'interest', 'opening_balance') then
    v_next_balance := v_current_balance + p_amount;
    v_debit := null;
    v_credit := p_amount;
  else
    raise exception 'invalid entry type';
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
