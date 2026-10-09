Evermont Ecosystem — AI Development Instructions

1. Project Overview

Evermont Credit Union is positioned as a Secured Private Wealth Bank.

Brand identity:

* Primary color: Royal Blue #0504AA
* Secondary color: White #FFFFFF
* Accent color: Gold #C9A227
* Tagline: Your money. Your community. Your future.

This repository supports the development and coordination of three existing Evermont websites.

2. The Three Websites

Platform A: Builder — Public Website

URL: https://evermont.builder.cloud

Purpose:

* Public homepage and brand presentation.
* About Evermont and contact information.
* Financial product descriptions.
* Navigation to the functional member portal.

Builder is the public-facing entry point for the Evermont ecosystem.

Platform B: v0/Vercel — Primary Functional Portal

URL: https://v0-evermont.vercel.app

Purpose:

* Member registration and login.
* Member dashboard and profile.
* Checking and savings information.
* Transaction history.
* Financial service pages.
* Loan and wealth-management information.
* Retirement and investment information.
* Supported digital-asset services.
* Customer support.
* Secure administrative features where implemented.

The existing v0 project and its code must be preserved.

The branch currently being used for integration work is:

v0/pin-supabase-project

A service-navigation update was reported committed as:

780c2ba

Verify the current repository state before relying on these details.

Platform C: Bolt — Existing Project

URL: https://evermont-credit-unio-2tld.bolt.host

Purpose:

* Preserve the existing application.
* Audit its current features and implementation.
* Identify useful functionality that may eventually be integrated.
* Avoid duplicating or replacing working features unnecessarily.

Do not make Bolt a required dependency of Builder or v0 until its compatibility has been reviewed.

3. How the Websites Should Work Together

The intended architecture is:

Builder → v0/Vercel → Functional member services

Bolt remains a separate existing project until a later integration decision.

When a visitor clicks a financial product on Builder, the link should open the corresponding verified service page on v0.

Examples of intended destinations include:

* Open an Account → /register
* Member Login → /login
* Checking → the verified checking service route
* Savings → the verified savings service route
* Loans → the verified loan service route
* Investments → the verified investment service route

Use the real routes found in the existing application. Do not assume every example route already exists.

The v0 portal should provide a way to return to Builder for public brand information when appropriate.

4. Shared Backend Requirements

The intended Supabase project is:

Project URL:
https://gdodqiwjcezdznzroupw.supabase.co

Project reference:
gdodqiwjcezdznzroupw

This is the intended target, not proof that every website is already connected to it.

Before changing any application’s backend configuration:

1. Inspect its current Supabase configuration.
2. Verify the project URL and project reference.
3. Inspect the database schema and required tables.
4. Review authentication and row-level security policies.
5. Check compatibility with the application’s existing queries.
6. Report any required changes before making them.

Never expose secret keys, service-role keys, passwords, or private credentials in source code or GitHub.

5. Code Preservation Rules

Before making changes:

1. Inspect the current branch and working tree.
2. Review the existing code and application structure.
3. Identify the relevant components, routes, and services.
4. Prepare a small, clearly scoped implementation plan.

Always preserve existing functionality.

Do not:

* Replace the entire application to implement one feature.
* Delete existing pages or components without approval.
* Create another project when an existing project can be updated.
* Overwrite changes made by another development platform.
* Merge into main without explicit approval.
* Deploy changes without explicit approval.

Use a separate feature branch for integration work.

6. Navigation and Authentication Security

Use standard HTTPS links for navigation between websites.

Never put passwords, authentication tokens, session tokens, or sensitive personal information in URL parameters.

Do not assume that logging in on one website automatically logs a user into the other websites.

Authentication sharing across domains must be designed and reviewed separately.

Protect member pages and administrative functions using proper authentication and server-side authorization.

Hiding an administrative button in the interface is not sufficient security.

7. Financial Data Integrity

Never present fictional balances or sample transactions as genuine customer funds.

Do not claim that Evermont has a banking charter, financial license, deposit insurance, or regulatory approval unless independently verified.

Any authoritative balance changes, transfers, or ledger operations must use secure backend logic and appropriate database transactions.

Do not implement real financial operations using browser-only code.

8. Required Testing

Before reporting a task as complete, test the relevant functionality.

Where applicable, verify:

* Homepage navigation.
* Every financial product card.
* Registration and login routes.
* Service detail pages.
* Direct navigation to nested routes.
* Browser refresh on nested routes.
* Authentication and access control.
* Member data isolation.
* Supabase connectivity and schema compatibility.
* Type-checking and production build.

Clearly report anything that could not be tested.

9. Required Final Report

After completing a task, report:

1. What was inspected.
2. What was changed.
3. Which files were modified.
4. Which routes were tested.
5. Whether type-checking and build passed.
6. Any security or integration issues discovered.
7. Any actions still requiring approval.
8. Whether anything was merged or deployed.

Never claim a feature works unless it has been appropriately tested.

10. Primary Objective

Coordinate the three existing Evermont websites into a consistent ecosystem while preserving their code, protecting member data, and maintaining a clear distinction between implemented functionality and planned functionality.
