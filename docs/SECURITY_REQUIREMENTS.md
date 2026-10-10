Evermont Security Requirements

1. Purpose

This document defines the minimum security requirements for the Evermont website ecosystem.

Evermont Credit Union is positioned as a Secured Private Wealth Bank.

All development work must prioritize the protection of member information, authentication credentials, account data, and financial records.

These requirements apply to:

1. Builder: https://evermont.builder.cloud
2. v0/Vercel: https://v0-evermont.vercel.app
3. Bolt: https://evermont-credit-unio-2tld.bolt.host

Documenting these requirements does not, by itself, prove that any application is secure or compliant.

2. Protect Existing Projects

Before making security-related changes:

* Inspect the current application and repository.
* Identify existing authentication and authorization mechanisms.
* Review the relevant database configuration.
* Document potential risks.
* Propose changes before implementing significant security modifications.

Do not replace an application’s existing authentication system without an approved migration plan.

Do not make destructive database changes or deploy security-related changes without the required approval.

3. Supabase Configuration

The intended Supabase project is:

Project URL:

https://gdodqiwjcezdznzroupw.supabase.co

Project reference:

gdodqiwjcezdznzroupw

This is the intended target, not confirmation that all three websites are connected to it.

For each application, verify:

* The actual Supabase project URL.
* The project reference.
* The public client key configuration.
* The database schema.
* Authentication settings.
* Row-level security policies.
* Database functions and permissions.
* Compatibility with the application’s existing code.

Do not change a project’s backend configuration until its compatibility has been assessed.

4. Protect Secrets and Credentials

Never commit any of the following to GitHub:

* Passwords.
* Supabase service-role keys.
* Private API keys.
* Private cryptographic keys.
* Authentication tokens.
* Session tokens.
* Database passwords.
* Production environment files containing secrets.

Use environment variables and the hosting platform’s secure secret-management settings.

Frontend applications must never expose privileged service-role credentials.

A public Supabase anonymous or publishable key is not a substitute for proper database security. Access must be protected by appropriate authentication and row-level security policies.

If a secret is accidentally committed, removing it from the latest file may not remove it from Git history. Revoke or rotate the exposed credential as appropriate.

5. Authentication Requirements

Member registration and login must use a properly configured authentication system.

Verify that:

* Registration validates required fields.
* Login handles invalid credentials safely.
* Password-reset flows are implemented securely where offered.
* Authentication errors do not reveal unnecessary sensitive information.
* Sessions are handled using appropriate security practices.
* Protected pages require valid authentication.
* Logging out ends the relevant session.
* Sensitive actions require appropriate authorization.

Do not assume that authentication on Builder automatically authenticates a visitor on v0 or Bolt.

The three websites use different origins, and shared authentication must not be assumed.

Never transfer session tokens or passwords through URL parameters.

6. Member Data Isolation

Members must only be able to access information they are authorized to view.

Review row-level security policies for tables containing:

* Member profiles.
* Account records.
* Transactions.
* Ledger entries.
* Notifications.
* Linked accounts.
* Other personal or financial records.

Test whether one authenticated member can access another member’s records.

A user interface that hides another member’s data is not sufficient protection.

Access controls must also be enforced by the backend and database policies.

7. Administrator Security

Administrative functionality must be protected by verified authorization.

Requirements include:

* Verify administrator roles on the server or through trusted backend controls.
* Restrict access to administrative routes and operations.
* Prevent ordinary members from granting themselves administrator privileges.
* Protect account-management and audit functions.
* Record sensitive administrative actions where appropriate.
* Apply least-privilege permissions.

Hiding an admin button or checking a role only in browser code is not sufficient security.

Review privileged database functions and role-changing operations carefully.

Do not change administrator permissions or role assignments without explicit approval.

8. Financial Data Integrity

Account balances, transactions, and ledger entries must be handled consistently and securely.

Requirements:

* Do not allow browser-only code to perform authoritative money movement.
* Use trusted backend logic for privileged financial operations.
* Use appropriate database transactions for related financial updates.
* Validate operation inputs on the backend.
* Prevent unauthorized modifications to account balances.
* Preserve transaction history and appropriate audit records.
* Prevent duplicate financial operations where relevant.
* Ensure members cannot modify other members’ financial records.

Any transfer, payment, lending, or balance-changing functionality must be reviewed before being presented as a real operational financial service.

9. Demo and Sample Data

Do not present fictional balances, sample transactions, or generated financial records as genuine customer funds.

If sample data is used for development or demonstration:

* Clearly identify it as sample data where appropriate.
* Keep it separate from genuine customer records.
* Prevent sample data from being mistaken for real account activity.
* Do not imply that funds have been deposited, transferred, or earned when they have not.

10. Privacy and Logging

Protect personally identifiable and financial information.

Do not:

* Place sensitive member information in URL parameters.
* Print passwords or access tokens to logs.
* Expose private records in public error messages.
* Include unnecessary personal information in analytics events.
* Return private account data to unauthorized clients.

Only collect and retain information required for the intended service.

11. Website Navigation Security

Cross-site navigation must use the verified HTTPS destinations.

Requirements:

* Use the canonical website URLs documented in the integration files.
* Validate destination routes before using them.
* Avoid untrusted redirects.
* Do not include credentials in links.
* Do not assume cross-domain session sharing.
* Keep sensitive application routes protected.

12. Regulatory and Insurance Claims

Do not claim that Evermont is licensed, chartered, insured, or approved by a financial regulator unless the relevant status has been independently verified and the wording has been approved.

Do not imply that a website prototype automatically provides regulated banking services.

Product descriptions must accurately reflect the functionality and services actually available.

13. Dependency and Application Security

When modifying code:

* Review existing dependencies before adding new ones.
* Avoid unnecessary packages.
* Do not disable security controls merely to make a build pass.
* Handle errors safely.
* Validate untrusted input.
* Keep authentication and authorization logic consistent.
* Run available type-checking and build commands.
* Review changes before committing them.

14. Changes Requiring Explicit Approval

Do not perform the following without explicit approval:

* Database schema changes.
* Database migrations.
* Row-level security policy changes.
* Authentication configuration changes.
* Administrator role changes.
* Privileged financial workflow changes.
* Production secret rotation.
* Production deployment.
* Merging integration work into the main branch.
* Destructive changes to existing records or projects.

If an urgent security risk is discovered, report it promptly and explain the recommended mitigation.

15. Required Security Audit Report

For each security review, report:

1. Application and repository inspected.
2. Actual backend project detected.
3. Authentication implementation reviewed.
4. Row-level security findings.
5. Member-data isolation test results.
6. Administrator authorization findings.
7. Financial data integrity risks.
8. Exposed secrets or configuration risks.
9. Recommended fixes.
10. Changes requiring approval.

Use PASS, FAIL, and NOT VERIFIED accurately.

Do not claim security has been proven merely because the application builds successfully.

16. Final Security Objective

Protect Evermont’s existing applications, members, credentials, and financial records while the three websites are coordinated.

Security requirements must be verified in the actual code, database, and deployment configuration rather than assumed from documentation alone.
