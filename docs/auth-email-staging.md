<!-- coderabbit-ai-generated:v1 -->

# Configure Supabase invitation and recovery email for EVERMONT

Use a verified **staging Supabase project** for a Member Support Preview running the password-link fix. In Vercel, confirm the *deployed* browser and API project hostnames both match the staging branch. The app currently pins its browser Supabase project; if that pin points at production, stop before changing any Auth settings or sending mail.

1. In **Authentication → URL Configuration**, set **Site URL** to the HTTPS origin of the updated Member Support Preview (no trailing slash). Prefer its stable protected branch alias after confirming the alias points at the fixed deployment. The previous deployment at `https://evermontcreditunion-h7wtxjcr1-fx1-hubs.vercel.app` is immutable and will not receive new code.
2. In **Redirect URLs**, add the exact Preview origin plus `/reset-password` and `/auth/callback`. Use the same approved origin when requesting recovery. Keep localhost out of deployed settings and templates. Check any custom SMTP template overrides.
3. In **Authentication → Email Templates**, set the invitation action link to the first example, and password recovery to the second. These templates require the fixed app. Keep the normal signup-confirmation template using `{{ .ConfirmationURL }}` if signup already works.

   ```html
   <a href="{{ .SiteURL }}/reset-password#type=invite&amp;token_hash={{ .TokenHash }}">Accept invitation and choose a password</a>
   <a href="{{ .SiteURL }}/reset-password#type=recovery&amp;token_hash={{ .TokenHash }}">Reset password</a>
   ```

   These links use the staging Site URL directly, including for dashboard invitations that supply no redirect. The fragment is read by the portal and exchanged once with Supabase. A bare link to `{{ .RedirectTo }}` or `{{ .SiteURL }}` cannot establish an Auth session. No browser administrator invite endpoint is needed. If an existing trusted server sends invitations through `auth.admin.inviteUserByEmail`, pass the approved staging `/reset-password` URL as its `redirectTo` option.
4. Sign into Vercel protection in the test browser **before** opening a private email link. Request **fresh** links after saving the templates. Use two disposable staging identities to test member and staff invitations without granting roles. Establish their own passwords, sign out and sign back in. Use Forgot Password on staging to request a new link for a test identity, change its password and sign back in. Reopen the used link in a new tab; the reset form must not unlock. Keep email links and their fragments out of logs, screenshots and chat.
5. Production has a separate intended origin, `https://v0-evermont.vercel.app`. Do not copy the staging Site URL, template changes, or redirect settings into Production. Changes to Production require separate approval and a deployment that supports the templates.

[Supabase URL configuration](https://supabase.com/docs/guides/auth/redirect-urls) · [Email template variables](https://supabase.com/docs/guides/auth/auth-email-templates)
