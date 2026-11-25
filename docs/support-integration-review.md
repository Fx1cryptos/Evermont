<!-- coderabbit-ai-generated:v1 -->

# Staging review: human support and Gemini

This change is based on the assigned CodeRabbit branch at `fef8b97`, which already descends from the dashboard at `22f7d1c`. The member dashboard, PortalShell and banking routes are unchanged. The staff permissions migration and role regression checks come from `ca31da6`. This branch retains its atomic member submission and paginated staff reads.

## Database prerequisites

Do not apply these files as a blanket migration to a running project. First compare the staging catalog, grants, triggers and existing RPC bodies with the definitions below. Record the staging branch and verify that both Preview components use it. A separate review is required for Production.

- The existing support tables, Gmail ingestion, outbox trigger, scoped claim and worker migrations are prerequisites.
- Compare `supabase/review/member_support.sql` (existing assistant claim, internal notes, human reply ownership and member boundaries) with installed objects. Some pre-existing policy/trigger statements are not replayable; skip already installed equivalent definitions.
- Compare `supabase/review/support_message_submission.sql`. Its duplicate check now accepts either the UUID or text request-ID column used by the existing schemas.
- Review `supabase/migrations/20261124120000_support_staff_reply_permissions.sql` from the support repair commit. Apply only if those permissions are missing. The administrative API still verifies the bearer token and its stored role before service-role operations.
- Review `supabase/review/support_knowledge.sql` last. This adds articles, editorial RLS, ownership transition guards, explicit resume state and handoff notification through the existing outbox. Review the narrowed authenticated INSERT grants against any other direct support-table consumers. Apply to verified staging before serving the updated UI; otherwise the new columns and article queries are unavailable.

## Provider and scheduler setup

Keep `GEMINI_MODEL`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GMAIL_FROM_EMAIL` and `SUPPORT_NOTIFICATION_EMAIL` on the server. The browser needs the public Supabase URL and public key. The API sends topic matches and approved reference text to Gemini; only the matching published answer is returned. Account-specific financial questions go to staff. For ticket-status requests the backend uses the conversation already verified against the member UUID.

Enable the existing private support delivery worker on the approved staging schedule, with staging settings. This is needed to recover unprocessed messages after a browser disappears. Realtime delivery depends on the project's publications and RLS; role-checked polling remains available.

## Acceptance

1. As ADMIN or SUPER_ADMIN, open Support inbox → Support knowledge and FAQs. Create a draft, publish it, and ask about its keywords as an ordinary staging member. Verify the saved system response uses the approved article.
2. Request a human. Verify pending support, the handoff outbox event and actual receipt in the designated staging support mailbox. Send a follow-up; verify no AI response while staff owns the ticket.
3. Reply from the staff inbox; verify the member sees that reply after reload. Add an internal note and verify it is absent as the member and as OPERATIONS. Verify a second member cannot open the thread or read its rows directly. Confirm OPERATIONS cannot reply.
4. Return the ticket to AI from a managing role and send a fresh question. Repeat with Gemini unavailable and with Gmail unavailable. The member message must remain saved in both cases. Count Gmail delivery as verified only when received in the actual mailbox.

Local commands: `npm run test:support`, `npm run test:db`, `npm run type-check`, `npm run lint`, `npm run support:worker:build`, `npm run build`. Tests use synthetic PostgreSQL identities and mocked provider responses.