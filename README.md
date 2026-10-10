# Evermont Credit Union
# Evermont Credit Union

<p align="center">
  <img
    src="https://ipfs.io/ipfs/bafkreicrwvjqxdzit62i5e2yvk24atabo2ob3ayyxluwzb2pmyrrzq6z2i"
    alt="Evermont Credit Union Logo"
    width="180"
  />
</p>

<p align="center">
  <strong>Secured Private Wealth Banking</strong>
</p>

<p align="center">
  <em>Your money. Your community. Your future.</em>
</p>

---

## About Evermont

**Evermont Credit Union** is a modern fintech banking prototype positioned as a **Secured Private Wealth Bank**.

Evermont is designed to combine the trust and member-focused principles of a credit union with the technology, convenience, security, and user experience of modern digital banking.

The platform is being developed around a professional private-wealth banking experience where members can manage financial accounts, explore banking products, review transactions, access lending information, manage their profiles, and interact with digital financial tools.

> **Project Status:** Prototype / Development  
> **Primary Public Website:** https://evermont.builder.cloud  
> **Functional Portal:** https://v0-evermont.vercel.app  
> **Additional Project:** https://evermont-credit-unio-2tld.bolt.host

> **Important:** Evermont is currently a fictional technology prototype, not a licensed or regulated financial institution. Features, balances, transactions, and integrations must not be represented as real financial services unless independently implemented, verified, and appropriately authorized.

---

## Vision

Evermont explores what a modern, secure, member-focused private financial institution could look like in a digital environment.

The goal is to build a professional fintech foundation that can evolve toward production when appropriate banking infrastructure, regulatory approvals, compliance processes, security controls, payment integrations, and financial partnerships are in place.

---

## Three-Website Ecosystem

Evermont has three existing website projects. They should be coordinated as one brand ecosystem without assuming that they already share authentication, databases, or application state.

### 1. Builder — Public Website

**URL:** https://evermont.builder.cloud

**Primary responsibility:** Public-facing website and central entry point.

Expected responsibilities:

- Present the Evermont brand and mission.
- Explain banking and wealth product offerings.
- Display public product and service information.
- Provide contact and support information.
- Direct visitors to the functional portal.
- Connect relevant product cards and calls to action to verified portal routes.
- Maintain consistent branding and navigation.

Builder should remain the public-facing entry point unless the project owner approves a change.

### 2. v0/Vercel — Functional Banking Portal

**URL:** https://v0-evermont.vercel.app

**Primary responsibility:** Main application experience.

Planned responsibilities include:

- Registration and login.
- Member dashboard.
- Account overview.
- Checking and savings interfaces.
- Transaction history.
- Member profiles and settings.
- Banking service detail pages.
- Loan and wealth service information.
- Retirement and investment information.
- Supported digital-asset interfaces.
- Customer support.
- Authorized administrative interfaces.

The current code, routes, authentication, backend integrations, and feature readiness must be inspected before an agent treats any capability as complete.

### 3. Bolt — Existing Project

**URL:** https://evermont-credit-unio-2tld.bolt.host

**Primary responsibility:** Preserve and evaluate the existing project.

Required approach:

- Inspect the current application before proposing changes.
- Identify existing features, routes, dependencies, and backend integrations.
- Compare its capabilities with the Builder and v0 projects.
- Preserve useful existing functionality.
- Avoid unnecessary rewrites or duplicate implementations.
- Do not make it a required dependency of the other websites until its role is approved.

### Ecosystem Principles

- Keep the Evermont identity consistent across all three websites.
- Use clear navigation between public information and the functional portal.
- Verify every destination route before connecting a button or card.
- Do not assume that all websites share a database or user session.
- Do not put authentication tokens, API keys, or private information in URLs.
- Avoid duplicating features when an existing implementation can be safely reused.
- Obtain approval before major architectural changes or production deployments.

---

## Core Features

The following describes the intended feature set. It does not imply that every feature is currently implemented or connected to a working backend.

### Member Authentication

- Member registration.
- Secure login.
- Session management.
- Password recovery.
- Protected member areas.
- Supabase Authentication, where correctly configured.

### Member Dashboard

- Account overview.
- Account balances.
- Recent transactions.
- Financial activity.
- Notifications.
- Member profile.
- Security settings.

### Banking and Wealth Products

- Checking accounts.
- Savings accounts.
- Credit cards.
- Retirement and 401(k) information.
- Personal loans.
- Auto loans.
- Crypto-loan information.
- Investment and wealth services.

### User Profile

- Personal information.
- Contact information.
- Profile management.
- Account settings.
- Security settings.
- Notification preferences.

### Administrative Dashboard

The intended administrative experience may include tools for authorized administrators to review and manage:

- Members.
- User profiles.
- Accounts.
- Transactions.
- Loans.
- Support requests.
- Notifications.
- System activity.
- Administrative operations.

Administrative access must be protected by server-side authorization and appropriately configured database policies. Hiding an admin button in the frontend is not sufficient protection.

---

## AI Customer Care

Evermont is designed to include an AI Customer Care experience that can help members and visitors with general questions about:

- Evermont services.
- Accounts and account features.
- Banking products.
- Loans.
- Security.
- General support.

Human support requests can be directed to:

**evermontcreditunion@gmail.com**

The AI must not claim to have completed financial transactions, changed account balances, approved loans, or performed other privileged actions unless those capabilities are genuinely implemented, securely authorized, and verified by the backend.

The AI must not disclose private member information to unauthorized users.

---

## Backend and Supabase

**Intended Supabase project reference:** `gdodqiwjcezdznzroupw`

**Intended project URL:** https://gdodqiwjcezdznzroupw.supabase.co

This is the intended backend target, not proof that every website is currently connected to it or that its database schema and permissions are correct.

Before implementing or changing backend functionality, developers and AI coding agents must:

1. Inspect the existing Supabase configuration.
2. Confirm which application currently uses the project.
3. Inspect available tables, migrations, authentication settings, and database policies.
4. Verify that application queries match the actual schema.
5. Check Row Level Security (RLS) for tables containing member data.
6. Confirm that members can access only records they are authorized to see.
7. Confirm that administrative operations require appropriate server-side permissions.
8. Run relevant tests and builds after changes.

### Backend Safety Rules

- Never commit Supabase service-role keys, private API keys, passwords, or other secrets.
- Use only appropriately scoped public configuration in frontend code.
- Keep privileged operations in a trusted server-side environment.
- Do not disable RLS simply to make an application work.
- Do not invent tables, columns, policies, or environment variables without inspecting the existing project.
- Do not change authentication providers, database schemas, or production data without approval.
- Never report a backend integration as verified solely because an environment variable exists.

See [docs/SECURITY_REQUIREMENTS.md](docs/SECURITY_REQUIREMENTS.md) for additional requirements.

---

## Platform Integration Documentation

The repository contains documentation for coordinating the three website projects.

| File | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Instructions for AI coding agents and developers. |
| [docs/ECOSYSTEM_ARCHITECTURE.md](docs/ECOSYSTEM_ARCHITECTURE.md) | Defines the roles and boundaries of Builder, v0, and Bolt. |
| [docs/PLATFORM_INTEGRATION.md](docs/PLATFORM_INTEGRATION.md) | Describes cross-site navigation and integration requirements. |
| [docs/ROUTE_MAPPING.md](docs/ROUTE_MAPPING.md) | Maps public website destinations to portal routes that must be verified. |
| [docs/SECURITY_REQUIREMENTS.md](docs/SECURITY_REQUIREMENTS.md) | Documents authentication, authorization, backend, and data-security expectations. |
| [integration/evermont-platforms.json](integration/evermont-platforms.json) | Structured configuration for the website ecosystem. |
| [integration/integration-contract.json](integration/integration-contract.json) | Defines integration expectations, verification requirements, and acceptance criteria. |

These files document the intended architecture and development process. Their presence does not mean that all integrations have been completed.

---

## Route and Navigation Requirements

The public website should link to the functional portal using verified, working destinations.

Potential portal destinations include:

- `/register`
- `/login`
- `/services/checking`
- `/services/savings`
- `/services/loans`
- `/services/investments`

**Verify each route against the current application before connecting it.** Do not assume every proposed path exists.

The v0 project previously received a service-navigation update on branch `v0/pin-supabase-project`, commit `780c2ba`. That update added a service detail route pattern, linked product cards, and connected account-opening calls to action to registration. Recheck the current branch and deployed application before relying on that state.

### Cross-Site Navigation

- Public product links should open the appropriate portal page.
- Registration and login links must point to the correct deployed portal.
- Links should work on desktop and mobile.
- External navigation should be clearly identified where appropriate.
- Authentication sessions must not be assumed to transfer across domains.
- Do not pass session tokens or credentials in query parameters.
- Test direct page access, browser refreshes, and navigation from each website.

---

## Security Requirements

Security must be designed into the application rather than added only at the interface level.

### Member Data

- Authenticate users before exposing protected member information.
- Enforce record-level access through appropriate backend authorization and RLS.
- Validate user input on the server as well as the client.
- Avoid exposing private information in logs, URLs, or error messages.
- Use secure session and password-recovery practices.

### Administrative Access

- Verify administrative permissions on the server.
- Never grant admin privileges based only on frontend state or user-editable profile fields.
- Restrict administrative database operations.
- Record important privileged actions where appropriate.
- Do not create or promote administrator accounts without authorization.

### Financial Data

- Do not allow users to modify their own authoritative account balances or transaction records.
- Do not treat frontend values as authoritative financial records.
- Keep any eventual financial ledger consistent and protected against unauthorized changes.
- Clearly identify test data and simulated transactions during development.
- Do not claim that deposits, withdrawals, transfers, payments, lending, or crypto transactions are real unless their required infrastructure is implemented and verified.

### Secrets and Deployment

- Store secrets in appropriate environment variables or secret-management systems.
- Never place service-role keys in browser code.
- Do not commit `.env` files containing secrets.
- Do not overwrite production configuration or deploy major changes without authorization.
- Review dependency and build errors before declaring a change complete.

---

## Development Workflow

All developers and AI coding agents working on Evermont should follow this workflow.

### Step 1: Inspect Before Editing

- Read `AGENTS.md`.
- Review the relevant integration documents.
- Inspect the current branch and working tree.
- Identify the application, routes, and files affected by the requested task.
- Check whether the feature already exists.

### Step 2: Preserve Existing Work

- Avoid replacing complete files when a focused change is sufficient.
- Preserve existing features, styling, routing, and backend integrations.
- Do not rewrite another website's project as part of a task unless explicitly requested.
- Ask before making major architecture, schema, authentication, or deployment changes.

### Step 3: Implement Incrementally

- Make the smallest safe change that meets the requirement.
- Keep changes scoped to the correct website.
- Reuse existing components and services where appropriate.
- Update documentation when architecture or integration behavior changes.

### Step 4: Verify

Run the relevant checks supported by the project, such as:

```bash
pnpm run type-check
pnpm run build
