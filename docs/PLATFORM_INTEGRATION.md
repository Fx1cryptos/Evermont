Evermont Platform Integration Guide

1. Purpose

This document defines how the three existing Evermont websites should interact.

The objective is to create one coordinated ecosystem without unnecessarily rebuilding, replacing, or duplicating existing applications.

2. Official Platform Configuration

Builder — Public Website

URL: https://evermont.builder.cloud

Role:

* Public homepage.
* Brand and company information.
* Financial product catalog.
* Public service descriptions.
* Navigation to the primary functional portal.

v0/Vercel — Primary Functional Portal

URL: https://v0-evermont.vercel.app

Role:

* Registration and login.
* Member dashboard.
* Account interfaces.
* Transaction history.
* Service details.
* Supported member services.
* Secure administrative tools where implemented.

Bolt — Existing Project

URL: https://evermont-credit-unio-2tld.bolt.host

Role:

* Preserve the existing application.
* Audit its features and technical configuration.
* Identify functionality that may be useful in the wider ecosystem.
* Remain independent until an integration plan is approved.

3. Navigation Between Websites

Builder is the public entry point.

When a visitor selects a financial product on Builder, the website should navigate to the corresponding verified service route on v0.

Examples:

* Open an Account → https://v0-evermont.vercel.app/register
* Member Login → the verified login route on v0.
* Checking → the verified checking service route on v0.
* Savings → the verified savings service route on v0.
* Loans → the verified loan service route on v0.
* Investments → the verified investment service route on v0.

The routes listed as examples must be checked against the actual application before implementation.

Do not create links to routes that do not exist.

Use standard HTTPS links for navigation between different website origins.

4. Integration Between Builder and v0

The integration should provide a consistent journey from product discovery to functional services.

Builder Requirements

* Use the correct v0 destination for each functional call to action.
* Ensure all relevant product cards are clickable.
* Use descriptive and accessible link labels.
* Avoid sending every product to the same generic destination when a specific service route exists.
* Keep public informational pages on Builder where appropriate.

v0 Requirements

* Provide the functional pages linked from Builder.
* Support direct loading of relevant routes.
* Ensure nested routes continue working after a browser refresh.
* Provide appropriate navigation back to Builder.
* Protect authenticated pages and member information.

5. Integration With Bolt

Bolt must not be automatically overwritten or merged into another application.

Before integrating any Bolt functionality:

1. Inspect its current application structure.
2. Identify its existing routes and components.
3. Review its authentication and backend configuration.
4. Identify features that are missing from v0.
5. Check whether those features can be reused safely.
6. Present the findings and a proposed integration plan.
7. Wait for approval before changing code or backend configuration.

Avoid creating duplicate implementations of existing features without a clear reason.

6. Supabase Coordination

The intended Supabase project is:

https://gdodqiwjcezdznzroupw.supabase.co

Project reference:

gdodqiwjcezdznzroupw

Treat this as the intended target configuration, not proof of a working connection.

For each application, verify:

* The configured Supabase URL.
* The project reference.
* The expected database schema.
* Authentication configuration.
* Row-level security policies.
* Required database functions.
* Existing application queries.
* User and administrator access boundaries.

Do not switch an application to another Supabase project until compatibility has been assessed.

Do not create or modify tables, migrations, database policies, or authentication settings without explicit approval.

7. Authentication Boundaries

The three websites use different origins.

Do not assume that a session established on Builder automatically authenticates a user on v0 or Bolt.

A user may need to sign in separately.

Never pass session tokens, access tokens, passwords, or other credentials through URL parameters.

If cross-domain single sign-on is proposed, document the design, security requirements, and implementation plan separately before making changes.

8. Navigation and Accessibility

All navigation should:

* Work with a mouse, keyboard, and touch screen.
* Have descriptive accessible labels.
* Display visible keyboard focus.
* Use the correct destination.
* Avoid broken or placeholder links.
* Work on desktop and mobile.
* Preserve normal browser navigation behavior.

Use the routing system already installed in each application.

Do not introduce another routing library unless it is genuinely necessary.

9. Required Integration Testing

Test each relevant link individually.

For every link, record:

* Source website.
* Button or element name.
* Destination URL.
* Whether the destination route exists.
* Whether the route loads directly.
* Whether refreshing the route works.
* Whether authentication is required.
* Whether the link works on mobile.
* Test result.
* Any discovered issue.

Use these statuses:

* PASS — tested successfully.
* FAIL — tested and found broken.
* NOT TESTED — insufficient access or evidence.

Do not report a route as working merely because its link has been written.

10. Safe Development Workflow

Before making changes:

1. Inspect the current branch and working tree.
2. Read the repository instructions in AGENTS.md.
3. Review the integration architecture and route mapping.
4. Identify which application owns the relevant code.
5. Describe the proposed changes.

After making approved changes:

1. Review the changed files.
2. Run available type-checking and build commands.
3. Test relevant navigation and refresh behavior.
4. Report errors and unresolved issues.
5. Keep changes separate from production until approved.

Do not merge into main or deploy automatically.

11. Integration Completion Criteria

The integration can be considered complete only when:

* Builder’s relevant buttons link to verified v0 routes.
* All intended destinations load successfully.
* Direct route loading and refresh behavior work.
* Existing features have been preserved.
* Authentication boundaries are understood.
* Supabase configuration has been verified.
* Security issues have been reviewed.
* Any limitations are documented.

12. Expected Outcome

Builder should serve as the public-facing website.

v0 should serve as the primary functional portal.

Bolt should remain preserved and available for future evaluation.

Together, these applications should provide a consistent Evermont experience without assuming that their code, databases, deployments, or authentication sessions are already connected.
