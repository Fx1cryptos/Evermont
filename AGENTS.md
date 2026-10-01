# Evermont Credit Union — Base44 Dev Environment

## Overview

React + TypeScript + Vite frontend using Supabase as backend (auth + PostgreSQL).
The repo was imported without an entry point or page components — `src/main.tsx`,
`src/App.tsx`, `src/pages/*`, and `src/components/ProtectedRoute.tsx` were created
during Base44 setup to make the app bootable.

## Running the app

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Vite dev server runs inside `node:22-slim`, bind-mounted at `/app`.
- Host port 3000 maps to container port 5173.
- Dependencies install on container startup via `npm install`.
- Live reload is active (Vite HMR).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | No (app boots without it) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No (app boots without it) | Supabase anon/publishable key |

Without Supabase configured, the app renders a landing page and login/register forms,
but authentication and data features won't work. A yellow banner is shown when
Supabase is not configured.

Placeholders live in `.env.base44-defaults` (loaded first by compose).
Real credentials are delivered via `/run/base44/app.env` (loaded last, always wins).

## Key files created during setup

- `src/main.tsx` — React entry point (BrowserRouter + AuthProvider)
- `src/App.tsx` — Routes (landing, login, register, dashboard, 404)
- `src/pages/*` — Page components
- `src/components/ProtectedRoute.tsx` — Auth guard for dashboard
- `src/contexts/AuthContext.tsx` — Fixed to handle null Supabase client gracefully

## Demo member mode

- `src/data/demoMember.ts` is the single source of demo data (Robert Moore,
  Dutch229moore@gmail.com) — 6 accounts (checking/savings/investments/401(k)/crypto/loan)
  and 17 sample transactions. All clearly marked DEMO/SIMULATED.
- "Sign In as Demo Member" on the login page sets a localStorage flag
  (`evermont_demo_session`) restored by AuthContext on boot; sign-out clears it.
- Services (`accountService`, `transactionService`) short-circuit and return
  demo data when `userId === 'demo-user'`, never querying Supabase — the real
  Supabase project has no tables/RLS yet and returns empty results.

## Tech stack

- React 18, TypeScript, Vite 5
- Tailwind CSS (custom `evermont-*` color palette)
- Supabase (auth + database, configured via `src/lib/supabase.ts`)
- react-router-dom v6
