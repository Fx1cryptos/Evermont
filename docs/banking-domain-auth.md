# Auth redirects for the member portal hosts

The member portal builds sign-up and password-reset links from `window.location.origin`. These are the portal hosts on the Vercel project `evermont_credit_union`.

Supabase project: `gdodqiwjcezdznzroupw`.

In Supabase Dashboard → Authentication → URL Configuration, set the Site URL to the host you want members to use, and allow these redirect URLs:

- `https://v0-evermont.vercel.app/auth/callback`
- `https://v0-evermont.vercel.app/reset-password`
- `https://v0-evermont-credit.vercel.app/auth/callback`
- `https://v0-evermont-credit.vercel.app/reset-password`
- `http://localhost:5173/auth/callback`
- `http://localhost:5173/reset-password`

Email confirmation returns to `/auth/callback`, which shows a confirmed state after the session is established. Password recovery returns to `/reset-password`, where the new password is set. The app reads the session from the URL and does not put tokens in query parameters. Open the recovery or confirmation link in the same browser that requested it.

Do not point these hosts at the public homepage project.
