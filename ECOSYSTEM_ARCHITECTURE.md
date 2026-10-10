Evermont Ecosystem Architecture

1. Overview

Evermont Credit Union is positioned as a Secured Private Wealth Bank.

The Evermont ecosystem consists of three existing web applications that serve different purposes but should provide a consistent experience.

The goal is to coordinate their navigation, branding, functionality, and backend integrations without unnecessarily duplicating or replacing existing work.

2. Platform One: Builder

Website: https://evermont.builder.cloud

Role: Public Website and Main Entry Point

Builder serves as the public-facing website for Evermont.

Responsibilities

* Present the Evermont brand and its financial services.
* Display the homepage and product catalog.
* Provide About, Contact, and other public information.
* Explain checking, savings, loans, investments, and other available services.
* Direct visitors to the appropriate functional pages on v0.
* Provide clear calls to action, including Open an Account and Member Login.

Navigation Requirements

Financial product cards should link to their corresponding service pages on v0.

The Open an Account button should link to the verified registration route on v0.

The Member Login button should link to the verified login route on v0.

All destination routes must be checked before being used.

Builder should remain the public entry point unless a future architectural decision changes this arrangement.

3. Platform Two: v0/Vercel

Website: https://v0-evermont.vercel.app

Role: Primary Functional Portal

v0 is the main portal for member-facing functionality.

Intended Responsibilities

* Member registration and authentication.
* Member dashboard.
* Member profile management.
* Checking and savings account interfaces.
* Transaction history.
* Financial product detail pages.
* Loan information and supported loan workflows.
* Investment and wealth-management information.
* Retirement planning information.
* Supported digital-asset services.
* Customer support.
* Secure administrative and operational tools.

Only features that are actually implemented and appropriately secured should be presented as operational.

Navigation Requirements

v0 should support the service routes required by Builder.

Reported service-navigation implementation includes:

* /services/:service
* /register

The service-navigation update was reported committed as 780c2ba on branch v0/pin-supabase-project.

Verify the current code and deployed routes before relying on this implementation.

The v0 portal should also provide suitable navigation back to Builder for public information.

4. Platform Three: Bolt

Website: https://evermont-credit-unio-2tld.bolt.host

Role: Existing Project for Evaluation

Bolt is an existing Evermont project that must be preserved.

Responsibilities

* Retain the current implementation.
* Inspect existing pages and functionality.
* Review its authentication and backend configuration.
* Identify useful features that may not exist in v0.
* Compare existing functionality before planning any consolidation.

Do not delete, replace, or automatically merge Bolt’s features into v0.

Any future integration should follow a separate review and approval process.

5. Intended Ecosystem Flow

The expected visitor journey is:

1. A visitor opens Builder.
2. The visitor explores Evermont’s financial products.
3. The visitor selects a product or account action.
4. Builder opens the appropriate route on v0.
5. The visitor uses the relevant functionality available on v0.
6. The visitor can return to Builder for public brand information.
7. Bolt remains available as a separate project until further evaluation.

This flow describes the intended architecture. It does not mean that all links or features are already implemented.

6. Supabase Backend

The intended Supabase project is:

* Project URL: https://gdodqiwjcezdznzroupw.supabase.co
* Project reference: gdodqiwjcezdznzroupw

Before connecting or switching any application to this project, inspect its actual configuration and verify:

* Authentication compatibility.
* Required database tables and columns.
* Existing schema and migrations.
* Row-level security policies.
* User and administrator permissions.
* Compatibility with existing application queries.

Do not assume that Builder, v0, and Bolt already share this backend.

Do not modify the database or authentication configuration without explicit approval.

7. Security Boundaries

Each website has its own application origin.

Navigation between websites does not automatically share login sessions.

Never pass authentication tokens, passwords, service-role keys, or other secrets through URLs.

Administrative permissions must be enforced by trusted backend logic, not merely by hiding interface elements.

Sensitive financial operations must use secure backend processes.

8. Branding Consistency

All three applications should follow the Evermont identity where appropriate.

* Royal Blue: #0504AA
* White: #FFFFFF
* Gold: #C9A227

The product experience should feel professional, secure, accessible, and consistent.

Preserve each application’s useful existing design and functionality instead of rebuilding everything unnecessarily.

9. Implementation Principles

* Inspect before editing.
* Preserve existing code.
* Use verified routes.
* Avoid duplicate implementations.
* Test navigation and direct route loading.
* Validate authentication and authorization.
* Keep integration work on a separate branch when possible.
* Do not merge or deploy without approval.
* Report completed work and remaining limitations honestly.

10. Final Objective

Build a coordinated Evermont ecosystem in which Builder serves as the public website, v0 serves as the primary functional portal, and Bolt remains an existing project available for future evaluation.

All integration work must preserve existing projects, protect data, and distinguish planned features from verified functionality.
