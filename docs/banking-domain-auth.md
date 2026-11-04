# Auth redirects for banking.evermontcredit.online

The member portal builds sign-up and password-reset links from `window.location.origin`. No in-app link has been switched to `banking.evermontcredit.online`. Add that host in Supabase and Vercel when you are ready to serve the portal there.

Supabase project: `gdodqiwjcezdznzroupw`.

In Supabase Dashboard → Authentication → URL Configuration, set:

- Site URL: `https://banking.evermontcredit.online`
- Redirect URLs:
  - `https://banking.evermontcredit.online/auth/callback`
  - `https://banking.evermontcredit.online/reset-password`
  - `https://v0-evermont.vercel.app/auth/callback`
  - `https://v0-evermont.vercel.app/reset-password`
  - `https://v0-evermont-credit.vercel.app/auth/callback`
  - `https://v0-evermont-credit.vercel.app/reset-password`
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/reset-password`

Email confirmation returns to `/auth/callback`, which shows a confirmed state after the session is established. Password recovery returns to `/reset-password`, where the new password is set. The app reads the session from the URL and does not put tokens in query parameters. Open the recovery or confirmation link in the same browser that requested it.

Also attach `banking.evermontcredit.online` to the Vercel project `evermont_credit_union` when you want that host to serve this app. Do not point it at `evermont-public-homepage`.
