# Robert Moore Auth Requirements

This document captures the current requirements and constraints for creating a real Supabase Auth test account for Robert Moore in the existing Evermont project.

## Summary

The repository is the existing Evermont Credit Union app. The current Supabase schema supports member profiles and account records, but it only defines the following account types in `supabase/schema.sql`:

- checking
- savings
- money_market

The requested Robert Moore test setup includes:

- Checking Account
- Savings Account
- Investment Account
- 401(k) Retirement Plan
- Digital Asset/Crypto Account
- Loan
- Transaction history

The current schema does not include the specialized account types required for the investment, retirement, crypto, and loan categories.

## Important Constraints

- Do not modify or overwrite existing Evermont functionality.
- Do not change application code without explicit approval.
- Do not expose Supabase service-role credentials in frontend code, committed `.env` files, or browser code.
- Do not hardcode a password in the React frontend.
- Do not bypass or fake authentication.
- Use the existing Supabase Auth and project architecture.
- If a test user account is created, use a secure temporary password via appropriate server-side/admin flow and instruct the user to change it after testing.
- If the current schema does not support the required data, explain the exact gap and required database changes.

## Current Findings from Repository Review

The project includes:

- `src/contexts/AuthContext.tsx` using `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`
- `src/lib/supabase.ts` exposing only the public anon key in browser code
- `supabase/schema.sql` defining core member/auth tables and RLS policies

The schema currently includes:

- `public.profiles`
- `public.admin_roles`
- `public.accounts`
- `public.ledger_entries`
- `public.audit_logs`

The `public.accounts` table allows only:

- `checking`
- `savings`
- `money_market`

The schema also defines admin authorization via `public.admin_roles` and SQL policies using `auth.uid()`.

## Required Next Steps for a Real Robert Moore Test Account

Before creating the test account, the following questions must be answered:

1. Should the Robert Moore account be created as a normal member or as an admin member?
2. Should the account be linked to an existing Robert Moore profile member record if one already exists?
3. Should the project database schema be extended to include missing account categories required by the fictional test scenario?
4. Is a Supabase project already configured with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in the local environment?

## Safe and Proper Implementation Strategy

The secure, correct approach is:

1. Check whether a Supabase Auth user for `Dutch229moore@gmail.com` already exists.
2. If the user exists, link that auth user ID to the correct `public.profiles` row.
3. If no user exists, create one through Supabase Auth using admin/server-side credentials.
4. If a profile/member record already exists, update it rather than creating a duplicate.
5. Link the auth user ID to the profile record using the existing `public.profiles.id` convention.
6. Preserve existing balances and transaction history if already present.
7. Add missing account types only if the real functional scope requires them.
8. Never expose or commit any service-role key.

## Required Verification After Implementation

After the setup is complete, verify:

- Auth user exists in Supabase Auth
- Auth user is linked to the correct profile/member record
- Login with `Dutch229moore@gmail.com` succeeds
- Dashboard loads correctly
- Account balances display correctly
- Transaction history loads
- Logout works
- Sign in again preserves the same data
- Unauthorized users cannot access private member data

## Current Status

This document is a planning requirement document only. It does not modify application code, database records, or repository functionality.

The actual implementation must be performed only after the scope is confirmed and the required schema decisions are agreed upon.
