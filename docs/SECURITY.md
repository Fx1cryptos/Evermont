# Security Review

**Status:** Prototype security review, not a production certification.

Evermont is a fictional financial-services prototype. It does not move real money and must not be represented as a licensed financial institution.

## Executive summary

The repository contains a browser Supabase client and service-layer prototypes, but no committed Supabase migrations or RLS policies were present at review time. Consequently, authorization cannot be considered complete until the database schema and policies are deployed and tested in the target Supabase project.

The review found and addressed the most immediate client-side risks:

- Demo fallbacks are now intended only for the explicit `demo-user` identity; database failures must not expose shared demo records to another signed-in user.
- The browser client accepts only public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configuration and enables persisted, auto-refreshed sessions. Service-role credentials are prohibited.
- Client-side transfer insertion must not be treated as an authorization or ledger operation. Real transfer creation must be implemented behind a server-side, transactional boundary before it is enabled.
- Authentication and data-service errors must be returned as safe, user-facing messages rather than exposing raw provider/database details.

## Authentication model

Supabase Auth is the identity provider. Passwords are submitted only to Supabase Auth and are never stored or logged by the application. The browser client uses the anon key, persisted sessions, and token refresh; it must never use a service-role key.

Auth state is not authorization by itself. Every protected route must require an active session, and every data query must still be constrained by database RLS.

Recommended production controls:

- Require verified email before access to sensitive member areas.
- Configure redirect allowlists narrowly for the deployed origins.
- Enable MFA for sensitive actions and review Supabase Auth password/rate-limit settings.
- Sign out and clear application state when refresh fails or a session expires.

## Authorization model

The authenticated subject is `auth.uid()`. Client-supplied `user_id` values are not trusted. Queries may include a user filter for efficiency, but RLS must independently enforce ownership.

Expected policies for the eventual schema:

- `profiles`: a member may select/update only the row where `id = auth.uid()`; immutable identity fields such as `id` and email ownership must not be client-editable.
- `accounts`: select only rows owned by `auth.uid()`; no client insert/update/delete for balances or ledger state.
- `transactions`: select only transactions belonging to the member's owned account; client inserts should be disabled for financial records.
- `beneficiaries`, `notifications`, and notification preferences: select/update/delete only rows where `user_id = auth.uid()`.
- `audit_logs`: members should not be able to write or delete audit records; controlled server-side code should append them.

These policies must be created in versioned migrations and tested with at least two distinct users, anonymous access, and an expired session.

## Supabase and secret management

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public browser configuration, not secrets. They must still be restricted by RLS.
- Never commit `.env` files, access tokens, database passwords, private keys, or `SUPABASE_SERVICE_ROLE_KEY`.
- Service-role credentials may exist only in a protected server/Edge Function environment and must never be returned to the browser.
- Do not put secrets in query strings, client logs, error reports, or source control.

## Financial-data handling

Amounts must remain decimal/numeric values end-to-end. JavaScript floating-point arithmetic must not calculate balances. The client must display server-provided decimal strings and must not mutate an account balance after a transfer.

A transfer cannot safely be implemented as a client-side insert into `transactions`: the client can tamper with account IDs, ownership, amount, status, timestamps, and duplicate requests. Until a server-side implementation exists, transfer creation should remain disabled or explicitly simulated outside the financial database.

The production design must use a server-side ledger with immutable journal entries, double-entry balancing, idempotency keys, authorization checks, database transactions, and append-only audit events. Account balances should be derived or maintained only by trusted transactional code.

## Logging and errors

Do not log passwords, access tokens, cookies, full account numbers, addresses, or raw Supabase/Postgres errors in production. Client messages should be generic; detailed diagnostics belong in a redacted, access-controlled server log with request correlation IDs.

Avoid using provider errors to reveal whether an email exists or whether a resource belongs to another member.

## Known prototype limitations

- No Supabase migration/RLS policy files were present in the reviewed tree, so deployed database authorization is unverified.
- The application source is incomplete and does not yet provide a complete route/protected-route implementation.
- Demo data is not a substitute for authenticated data and must never be enabled for arbitrary users.
- External email, SMS, and push providers are disabled.
- There is no production ledger, transfer processor, fraud detection, MFA flow, KYC/AML workflow, or operational audit pipeline.
- Dependency installation and type/build checks must be run in CI; repository inspection alone cannot prove the application builds.

## Future production requirements

1. Add reviewed Supabase migrations for schema, constraints, indexes, and RLS.
2. Test RLS using separate member roles and negative authorization cases.
3. Move financial mutations to trusted server-side functions with idempotency and serializable/appropriately locked transactions.
4. Add immutable double-entry ledger tables and reconciliation controls.
5. Add MFA, device/session management, rate limiting, abuse monitoring, and security alerting.
6. Centralize redacted structured logging and incident response.
7. Pin/audit dependencies and enforce secret scanning, SAST, dependency scanning, and CI build/type checks.
8. Complete privacy, regulatory, legal, accessibility, and third-party risk reviews before any real financial use.
