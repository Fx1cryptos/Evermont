begin;

-- These two read surfaces are views. Run their underlying row policies as the
-- requesting member rather than the view owner's privileges.
alter view public.user_activation_status set (security_invoker = true);
alter view public.member_activity_history set (security_invoker = true);

-- Remove broad browser grants from the protected member-data surface.
revoke all on table
  public.user_activation_status,
  public.member_activity_history,
  public.accounts,
  public.transactions,
  public.ledger_entries,
  public.demo_ledger_entries,
  public.activation_fee_rates,
  public.account_activations,
  public.activation_payments,
  public.activation_payment_logs,
  public.profiles,
  public.beneficiaries,
  public.admin_roles
from public, anon, authenticated;

-- Member-facing reads remain available and are constrained by the existing
-- owner-scoped RLS policies on the underlying tables.
grant select on table
  public.user_activation_status,
  public.member_activity_history,
  public.accounts,
  public.transactions,
  public.ledger_entries,
  public.demo_ledger_entries,
  public.activation_fee_rates,
  public.account_activations,
  public.activation_payments,
  public.activation_payment_logs
to authenticated;

-- Preserve normal self-service profile and beneficiary functionality, while
-- avoiding table-wide privileges such as TRUNCATE.
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.beneficiaries to authenticated;

-- Balance, transaction, and activation records are not client-writable.
drop policy if exists "Users can insert own accounts" on public.accounts;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can insert own activation" on public.account_activations;
drop policy if exists "Users can update own activation" on public.account_activations;
drop policy if exists "Users can insert own activation payments" on public.activation_payments;
drop policy if exists "Users can update own activation payments" on public.activation_payments;

commit;
