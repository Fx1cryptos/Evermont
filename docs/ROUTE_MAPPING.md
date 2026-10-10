Evermont Website Route Mapping

1. Purpose

This document defines the intended navigation between the three Evermont websites.

The objective is to ensure visitors can move from the public website to the correct functional service without encountering broken links.

Important: Routes listed in this document must be verified against the current application code and deployed websites. A route listed here is an intended destination, not proof that it already exists.

2. Official Website URLs

Builder — Public Website

https://evermont.builder.cloud

v0/Vercel — Primary Functional Portal

https://v0-evermont.vercel.app

Bolt — Existing Project

https://evermont-credit-unio-2tld.bolt.host

3. Builder Homepage Navigation

The following navigation is intended for Builder.

Button or Product	Intended Destination	Verification
Home / Logo	https://evermont.builder.cloud/	Verify
Open an Account	https://v0-evermont.vercel.app/register	Verify route and registration
Member Login	https://v0-evermont.vercel.app/login	Verify route and authentication
Checking Account	https://v0-evermont.vercel.app/services/checking	Verify service slug
Savings Account	https://v0-evermont.vercel.app/services/savings	Verify service slug
Loans	https://v0-evermont.vercel.app/services/loans	Verify service slug
Investments / Wealth	https://v0-evermont.vercel.app/services/investments	Verify service slug
Retirement Planning	Appropriate verified v0 route	Identify existing route
Digital Assets	Appropriate verified v0 route	Identify existing route
Contact	Appropriate public contact page	Verify destination

Do not implement a destination simply because it appears in this table. First inspect the actual service slugs and available routes.

If a product does not yet have a dedicated page, report the missing route before deciding how to handle it.

4. v0 Service Routing

The reported service navigation implementation uses this route pattern:

/services/:service

The :service segment should be replaced with the actual slug associated with the selected product.

Examples of possible slugs include:

* checking
* savings
* loans
* investments

These are examples only. Confirm the real slugs in the existing code.

Service Route Requirements

Every service route should:

1. Display the correct service information.
2. Load when opened directly.
3. Continue working after a browser refresh.
4. Provide suitable navigation back to the main portal.
5. Display an appropriate not-found state for an unknown service.
6. Avoid presenting unimplemented features as operational.

5. Registration and Login

Registration

Intended URL:

https://v0-evermont.vercel.app/register

Verify that:

* The route exists.
* Registration forms validate input.
* Authentication uses the intended and verified Supabase configuration.
* Errors are handled safely.
* Successful registration follows the application’s actual authentication flow.

Login

Intended URL:

https://v0-evermont.vercel.app/login

Verify that:

* The route exists.
* Authentication is implemented.
* Invalid credentials are handled appropriately.
* Protected pages require authentication.
* Users cannot access another member’s private information.

Do not claim registration or login is operational until it has been tested.

6. Member Portal Navigation

After authentication, the following destinations may be needed, depending on the existing implementation:

Feature	Required Action
Member Dashboard	Identify and verify the existing route
Member Profile	Identify and verify the existing route
Checking / Savings	Identify and verify the existing routes
Transaction History	Identify and verify the existing route
Loans	Identify and verify the existing route
Investments / Wealth	Identify and verify the existing route
Support	Identify and verify the existing route
Admin Dashboard	Verify route and server-side authorization

Do not invent new routes without inspecting the current router.

Do not expose administrative pages or member data to unauthenticated visitors.

7. Navigation Back to Builder

The v0 portal should provide a link back to the public website when appropriate.

Intended destination:

https://evermont.builder.cloud/

Use this for public brand information and other relevant informational pages.

Do not redirect users away from active account workflows unexpectedly.

8. Bolt Navigation

Existing Bolt project:

https://evermont-credit-unio-2tld.bolt.host

Keep Bolt available as an independent application.

Do not redirect all Builder traffic to Bolt.

Do not merge Bolt routes or functionality into v0 until an audit and integration plan have been approved.

9. URL and Security Rules

* Use HTTPS for external navigation.
* Do not place passwords or access tokens in URLs.
* Do not put sensitive member information in query parameters.
* Do not assume login sessions are shared across website origins.
* Use the existing router for internal navigation.
* Use verified routes rather than guessed paths.

10. Route Testing Checklist

For every relevant button, test:

* [ ]	The button is visible where expected.
* [ ]	The button has an accessible name.
* [ ]	The destination URL is correct.
* [ ]	The destination route exists.
* [ ]	Clicking the button opens the correct page.
* [ ]	Opening the URL directly works.
* [ ]	Refreshing the destination page works.
* [ ]	Mobile navigation works.
* [ ]	Authentication requirements are enforced.
* [ ]	No secrets or sensitive data appear in the URL.

Record each result as PASS, FAIL, or NOT TESTED.

11. Required Developer Report

After auditing or implementing navigation, provide:

1. All routes discovered in the current code.
2. All Builder links checked.
3. All v0 service slugs confirmed.
4. Broken or missing routes.
5. Routes tested successfully.
6. Routes that could not be tested.
7. Any proposed code changes requiring approval.

12. Final Goal

Visitors should be able to discover Evermont products on Builder and navigate to the corresponding verified services on v0.

The integration must preserve the existing applications, avoid broken links, and clearly distinguish planned destinations from working routes.
