<!-- coderabbit-ai-generated:v1 -->

# Member portal and isolated simulation

The React portal uses Supabase Auth and the existing Supabase UUID for member queries. Django has a separate SQLite ledger for simulations; its anonymous simulation sessions and staff login do not grant access to the React portal.

## Run the portal

From the repository root, install dependencies with `npm ci`. For an offline preview of the sign-in screen, public pages, and access gates, run `npm run dev -- --mode offline` and open `http://localhost:5173/login`. This mode disables member access and works only with the development server.

For the connected portal, supply the intended project's public anon or publishable key as `VITE_SUPABASE_ANON_KEY` and use the URL in `.env.example`. Run `npm run dev` or `npm run build`. Use the existing Supabase member sign-in. The support API's server credentials belong in the server environment only. Google OAuth settings are needed only for the mailbox and email features. A Vite development server does not host Vercel API functions.

## Verification and release gates

Run `npm run type-check`, `npm run lint`, `npm run test:portal`, and `npm run build`. The portal tests use local HTTP fixtures and exercise the actual services and API handlers. They do not certify the policies installed in Supabase. For the simulator, see [the Django setup guide](../banking_demo/README.md).

Before a connected release, compare deployed table columns, policies, and function grants with the reviewed SQL. The repository's base schema is not a complete copy of the deployed database. In particular, beneficiary reads expect `id`, `user_id`, and `name`. Verify with two pre-existing authorized test identities and a staff test identity in an approved environment. Confirm callback allowlists and recovery completion there. Do not apply the bootstrap schema to an existing project.

The SQL sources restrict role assignment to the trusted service role. Ledger posting requires an authenticated ADMIN or SUPER_ADMIN and a matching account owner. These source changes do not change an existing project's effective permissions; deployment requires separate review and approval.