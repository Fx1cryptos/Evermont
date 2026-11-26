<!-- coderabbit-ai-generated:v1 -->

# Member support: staging handoff

The React portal uses Supabase Auth. Django has its own development database and is not involved in this workflow. Do not point either the portal or worker at production for a staging test.

## Before a staging login

1. Confirm the staging Supabase project, a separate Vercel Preview deployment, two existing approved staging members, and one existing authorized support user. Do not copy a member or export a password. Set `STAGING_SUPABASE_PROJECT_REF` to the approved staging project reference in the branch Preview and private staging worker environments. The Preview build requires matching browser and server Supabase URLs and rejects the production reference.
2. In **Vercel → project → Settings → Environment Variables**, select **Preview** and this branch. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for that approved project. The latter accepts the public anon or publishable key. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-only values for the same project. Keep server keys out of Vite, the repository and chat.
3. In **staging Supabase → Authentication → URL Configuration**, allow only the required redirects for the actual Preview origin. Check the callback and password-reset routes used by the client. Set Vercel Preview access for the testers. Do not change the production Site URL.
4. Compare staging catalog entries, grants, triggers, view definitions and RLS with the checked-in migrations. Verify the actual type and nullability of support message fields (including support for system messages without a person as sender), message read flags, support status values, and authenticated column grants. The repository does not include a complete hosted schema dump. Verify both member JWTs cannot read internal notes or each other's rows *directly through PostgREST*. Inspect these read-only metadata sources without exporting member records:

       select pg_get_viewdef('public.user_activation_status'::regclass, true);
       select table_name,column_name,data_type,is_nullable from information_schema.columns
        where table_schema='public' and table_name in ('user_activation_status','account_activations','activation_payment_logs','support_conversations','support_messages','support_notification_outbox','support_connection_settings','support_requests');
       select tablename,policyname,cmd,roles,qual,with_check from pg_policies
        where schemaname='public' and tablename in ('profiles','accounts','ledger_entries','beneficiaries','support_messages','support_conversations');

5. Submit `supabase/review/member_support.sql` for database review. It is outside the migrations directory; it has not been applied. It constrains member reads and closed-ticket writes, protects staff notes, persists human handoff, and claims/deduplicates model responses. Staff reads and writes in this portal use the authorized backend. Review any other direct database consumers before applying these restrictions. Keep notes and AI off until staging confirms the full contract.
6. Run `npm ci`, `npm run type-check`, `npm run lint`, `npm run test:portal`, `npm run support:worker:build` and `npm run build`. Build and deploy the development revision to Preview only.

## Gemini

Use the existing Google AI project. Set server-only `GEMINI_API_KEY` and `GEMINI_MODEL` to a model enabled for that key which supports generateContent with an enum response. Check the project's available models rather than assuming a model ID. The provider gets category labels derived from recent authorized member messages, not balances, account identifiers, or raw conversations. The server returns only a reviewed navigation answer. It cannot initiate a transaction or approve activation. The portal saves the member message before attempting an AI reply. The proposed database functions prevent duplicate replies, enforce a member quota, and stop completion after handoff.

## Gmail

Use server-only `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GMAIL_FROM_EMAIL`, and `SUPPORT_NOTIFICATION_EMAIL`. The last two must be `evermontcreditunion@gmail.com` for member notifications. The authenticated mailbox must also correspond to a confirmed Supabase identity with an existing SUPPORT, ADMIN, or SUPER_ADMIN role for Gmail staff replies. A shared mailbox establishes the mailbox identity, not the individual human author; use the staff portal when individual attribution is required.

Do not configure live mail credentials or enable a scheduler until a controlled test is authorized. Do not re-use connection test results as evidence of reply import. A prior invalid_grant does not distinguish a revoked grant, expiry or a mismatched client. Confirm the original OAuth client and Google account, then reauthorize offline access to gmail.send and gmail.readonly if necessary. Update the refresh token only in the private server environment.

Member messages enqueue work using the existing Supabase trigger. For a controlled test, send a non-sensitive staging support message. Verify the stored message, outbox delivery, recipient, reference, and link to the staff-only portal. Reply directly to that notification from the authorized mailbox, addressed **only to itself**, with no cc/bcc. Start the plain-text reply with the following lines:

    MEMBER REPLY
    Your member-visible reply here.
    END REPLY

Only the bounded text is published. Use the portal's Internal note option for private staff notes. The importer requires Gmail's SENT label, a matching direct parent reference and Gmail thread, an eligible staff role, and the intended mailbox. Repeat sync and confirm one member-visible reply. Gmail imports use the existing unique Gmail message ID constraint. These steps have not been verified against a live mailbox.

Staff can synchronize manually. For a private scheduled job, compile once with `npm run support:worker:build`, then run `npm run support:worker -- --deliver-and-sync` on an authorized cadence with the same private server configuration. This processes bounded outbox and inbox batches, using the database locks, retry state and cursor. No remote scheduler has been created. Do not run that command in an environment with real credentials merely to test setup.

## Evidence required for sign-off

Verify read-only account and ledger access while activation is unavailable; repeat with confirmed active, pending and incomplete staging records. Do not change balances or mark a member active to manufacture a result. With each approved staging JWT, verify own, other-member and staff-only access separately. Verify normal member messaging while Gemini is unavailable, the branded reply with Gemini enabled, handoff during an in-flight model call, and internal-note rejection. Test email recovery only with a separately approved identity and delivery authorization.

## Staff alerts and worker health

Review `supabase/review/support_staff_alerts.sql` against the staging outbox constraints before enabling alerts. It depends on the handoff columns in `member_support.sql`. The outbox must accept a staff-alert event with a null message ID. Check `support_message_submission.sql` for the atomic member submission contract. Set server-only `SUPPORT_OVERDUE_HOURS` to the approved response threshold to include overdue tickets in private worker runs. With it unset, the worker still processes queued mail.

Review `supabase/review/support_worker_health.sql` before adding `--record-health` to the existing private worker command. Record a synthetic run and check its execution ID, timestamps and failure indicators as an administrator. The health page distinguishes queued mail outcomes from mailbox receipt. To verify delivery, open the actual notification in the authorized inbox and match the full ticket reference to the synthetic staging conversation. Repeat the worker run and count matching messages. Confirm the staff reply is visible to the originating member and inaccessible to another member. Keep the scheduler disabled against any project whose staging identity has not been verified.
