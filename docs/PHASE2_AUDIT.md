# Evermont phase two audit

## Completed in this pass

- Added client-side route gates for authenticated member pages.
- Added an administrator gate that checks the signed-in user against `public.admin_roles` before rendering admin routes.
- Added a reviewed Supabase migration at `supabase/migrations/202610300001_security_hardening.sql`. It is intentionally not applied to production.
- Removed direct browser inserts into `ledger_entries`; ledger writes now call the guarded `create_ledger_entry` RPC.
- Added strict role checks, account/member matching, amount limits, and audit recording to the migration's ledger RPC.
- Restricted authenticated database grants so browser clients can read permitted records but cannot directly mutate ledger, account, audit, or role tables.
- Added the missing `admin_roles` read policy and explicit `WITH CHECK` to the administrative profile update policy.

## Current implementation findings

### Member portal

The existing dashboard reads member-scoped accounts and transactions through Supabase hooks and masks account numbers in the UI. Login, registration, sign-out, password reset, and password update flows use Supabase Auth. The existing portal is still a focused dashboard rather than a complete separate statement/notification/settings information architecture; those areas should be added only against confirmed tables and product requirements.

### Administration

Role permission definitions exist in `adminAuthService`, but the previous route boundary trusted a client-provided role through `AdminAuthProvider`. The new `/admin` route boundary performs a live `admin_roles` lookup for the authenticated Supabase user. Page-level service methods and RLS remain the final authorization layer.

### Supabase security

The original schema enabled RLS, but exposed broad `grant all` permissions and had `SECURITY DEFINER` functions without an authorization check. The reviewed migration narrows grants and adds authorization checks. It must be reviewed and applied through the approved Supabase workflow, followed by advisors and a live verification query.

### External financial integrations

No Plaid, Coinbase Prime, or Modern Treasury implementation files, webhook handlers, provider SDKs, or verified production credentials were found in the repository. No successful connection, transaction, or webhook is claimed. Production work requires provider-specific credentials, environment configuration, webhook signing/verification, idempotency, reconciliation, and an approved operational runbook.

### Communications

The repository contains support email links, but no verified transactional email provider or delivery worker was found. No reliable delivery claim is made and no email provider was added without a confirmed integration.

## Production blockers

1. Apply and review the security migration in a non-production Supabase environment first.
2. Run Supabase security advisors and verify RLS with member, admin, and anonymous test identities.
3. Confirm the real admin provisioning workflow; do not expose role assignment to ordinary members.
4. Add real integration credentials and signed webhook routes only after provider accounts and permissions are approved.
5. Add verified transactional email configuration before treating contact or notification delivery as operational.
6. Add generated database types after the schema is finalized.
7. Validate deployed domain, redirects, CSP, logging, backups, rate limits, and incident response before financial use.

## Validation

Run the repository checks after changes:

- `npm run build`
- `npm run type-check`
- `npm run lint`

The migration is not executed by this change, in accordance with the request not to make unapproved production database changes.
