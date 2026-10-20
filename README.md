Evermont Credit Union
Secured Private Wealth Banking
Where Private Wealth is Protected.

⸻

Table of Contents

1. Project Overview
2. Official Brand Identity
3. Website Architecture
4. Technology Stack
5. Repository Structure
6. Core Features
7. Design System
8. SEO and Google Indexing
9. Domain and Routing Requirements
10. Supabase and Backend Integration
11. Security Requirements
12. Financial Compliance and Trust
13. Local Development
14. Environment Configuration
15. Code Quality and Testing
16. Git Workflow
17. Vercel Deployment
18. Production Verification
19. Monitoring and Maintenance
20. Development Roadmap
21. Contribution Guidelines
22. Project Status and Limitations

⸻

1. Project Overview

Evermont Credit Union is a digital financial-services project designed around a premium private-wealth banking experience.

The project aims to deliver a polished, responsive, accessible, and trustworthy digital experience through a public marketing website and a separate member portal.

The public website introduces the brand, explains available services, provides contact information, and directs visitors to the appropriate member-portal destinations.

The member portal is intended to provide account-related interfaces, member authentication, account overviews, transaction history, profile management, and other financial-service experiences where the relevant functionality has been implemented and properly secured.

The project prioritizes:

* Professional private-banking presentation.
* Consistent brand identity.
* Clear and accessible navigation.
* Search-engine discoverability.
* Mobile-first responsive design.
* Reliable application behavior.
* Secure handling of member information.
* Maintainable and well-documented code.
* Verified builds and controlled production releases.

Project objectives

The primary objectives are to:

1. Maintain a high-quality public homepage at the official domain.
2. Keep the member portal separate from the public marketing website.
3. Resolve existing code, routing, build, and runtime errors.
4. Ensure every intended public page has meaningful, unique content.
5. Improve technical SEO and Google indexing eligibility.
6. Preserve existing integrations and application functionality.
7. Verify security boundaries before exposing member or administrative features.
8. Use a repeatable process for committing, testing, and deploying changes.

Important status notice

This repository documents a software project. It does not establish that Evermont is a licensed financial institution, that deposits are insured, or that every displayed financial feature is operational.

Do not represent a prototype, simulated balance, demonstration transaction, or planned integration as a live financial service. Public financial and regulatory claims must be verified before publication.

⸻

2. Official Brand Identity

Brand details

Property	Official value
Brand name	Evermont Credit Union
Positioning	Secured Private Wealth Banking
Primary tagline	Where Private Wealth is Protected.
Secondary tagline	Built on Integrity. Guided by Excellence.
Primary website	https://evermontcredit.online/
Member portal	https://v0-evermont.vercel.app/
Member login	https://v0-evermont.vercel.app/login
Support email	support@evermontcredit.online
Information email	info@evermontcredit.online
Primary color	#0504AA
Background color	#FFFFFF
Premium accent	#C9A227

Use these brand values consistently across the homepage, member portal, favicon, social-media graphics, page metadata, and public communications.

Brand principles

The visual identity should communicate:

* Trust and professionalism.
* Privacy and responsible financial management.
* Premium service.
* Simplicity and clarity.
* Stability and attention to detail.

Avoid generic cryptocurrency-dashboard aesthetics, excessive gradients, unnecessary animations, misleading trust badges, and unsubstantiated security claims.

⸻

3. Website Architecture

Evermont uses two primary website destinations. They have different responsibilities and must not be treated as interchangeable applications.

3.1 Public homepage

Production domain: https://evermontcredit.online/

Purpose: Public information, brand presentation, product discovery, and search-engine visibility.

Responsibilities include:

* Presenting the Evermont brand.
* Explaining the services and products that can legitimately be offered.
* Providing public service-information pages.
* Publishing About, Contact, Privacy, and Terms pages as appropriate.
* Providing accurate support and contact information.
* Providing clear calls to action.
* Directing visitors to the member portal.
* Supporting Google crawling and indexing.
* Maintaining responsive and accessible navigation.

The root domain must display the public homepage.

It must not automatically redirect every visitor to the member login page.

3.2 Member portal

Portal: https://v0-evermont.vercel.app/

Login: https://v0-evermont.vercel.app/login

Purpose: Member-facing application functionality.

Intended capabilities include:

* Member registration and authentication.
* Protected member dashboard.
* Account overview.
* Account and balance displays.
* Transaction history.
* Member profile and settings.
* Service-information pages.
* Support and notification interfaces.
* Administrative interfaces for authorized personnel.

Each feature must be checked against the actual implementation before being described as operational.

The public homepage’s Login and Sign In links must direct visitors to the verified portal login route.

3.3 Separation requirements

The two applications must maintain the following boundaries:

1. The public domain serves the public homepage.
2. The portal remains at its designated Vercel URL unless an approved architecture change is made.
3. Public navigation may link to the portal using HTTPS.
4. The homepage must not expose private member information.
5. Public SEO pages must not contain private account data.
6. Portal authentication must not be bypassed through frontend-only checks.
7. Authentication tokens and passwords must never be passed in URL query parameters.
8. The applications must not be assumed to share a session merely because they share a brand.
9. DNS, redirects, and domain assignments must be checked before any production release.

3.4 Retired or secondary platforms

Older project documentation may reference Builder or Bolt-hosted applications. These references must not override the current architecture.

Do not move the official domain, merge projects, delete deployments, or change the production target merely because an older document mentions another platform.

Inspect the actual Git repository, Vercel project configuration, production domain assignment, and deployment history before changing infrastructure.

⸻

4. Technology Stack

The supplied source repository includes the following technologies. Verify the installed versions and actual configuration before making upgrades.

Technology	Purpose
React	User interface components
TypeScript	Type-safe application development
Vite	Development server and production build
React Router	Client-side navigation
Supabase JS	Backend and authentication integration
Tailwind CSS	Utility-based styling, where configured
Lucide React	Interface icons
ESLint	Code-quality checks
pnpm	Dependency management through the supplied lockfile
Vercel	Hosting and deployment platform

Dependency management

Use the package manager and lockfile already committed to the repository.

The supplied project contains pnpm-lock.yaml. Prefer pnpm unless the repository’s current CI or deployment configuration specifies otherwise.

Do not casually regenerate the lockfile, upgrade all packages, or replace the framework during a bug-fix task.

Review dependency changes, test compatibility, and include necessary lockfile updates in the same commit.

⸻

5. Repository Structure

The supplied source archive contains the following important files and directories.

Evermont-main/
├── public/
│   └── images/
│       └── evermont-logo.jpeg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   └── ui/
│   ├── config/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── admin/
│   │   └── auth/
│   ├── services/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── PLATFORM_INTEGRATION.md
│   ├── ROUTE_MAPPING.md
│   ├── SECURITY.md
│   └── SECURITY_REQUIREMENTS.md
├── integration/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md

This tree is based on the supplied source archive. Confirm the current repository structure before moving or deleting files.

Important code locations

* src/App.tsx: application shell and routing.
* src/pages/HomePage.tsx: homepage implementation in the supplied project.
* src/pages/MemberDashboardPage.tsx: member dashboard implementation.
* src/pages/auth/: authentication-related pages.
* src/pages/admin/: administrative pages.
* src/contexts/: authentication and related application contexts.
* src/hooks/: reusable data and application hooks.
* src/lib/supabase.ts: Supabase client configuration.
* src/services/: service-layer logic.
* src/constants/routes.ts: route definitions, where used.
* index.html: document metadata and initial HTML.
* package.json: dependency and script definitions.

The existence of a file does not prove that its feature is complete, connected, or secure.

⸻

6. Core Features

6.1 Public website

The public homepage should provide:

* A responsive header and navigation.
* A clear brand presentation.
* Accurate product and service descriptions.
* Prominent, correctly linked calls to action.
* Contact and support information.
* Appropriate trust and privacy information.
* A consistent footer.
* Social-media links only where official accounts are confirmed.
* Accessible layouts for mobile, tablet, and desktop.

6.2 Banking and financial-service pages

Potential public pages include:

* Checking and Savings.
* Loans.
* Cryptocurrency-related services.
* Retirement and 401(k) information.
* Investment and wealth-service information.
* About Evermont.
* Contact.
* Frequently Asked Questions.
* Privacy Policy.
* Terms of Service.

Publish only pages that have meaningful content and accurately describe the services available.

For example, a page about retirement accounts should explain the relevant product and its limitations rather than displaying a heading, a few generic sentences, and an empty call-to-action button.

6.3 Member dashboard

Where implemented and properly connected, the dashboard may display:

* Authenticated member greeting.
* Account overview.
* Account balances returned by the authorized backend.
* Recent transaction history.
* Account navigation.
* Notifications.
* Profile and settings access.
* Service shortcuts.

Balances and transaction records must come from the authorized source of truth. Do not hardcode demonstration amounts into production account interfaces.

6.4 Service activation

Where a feature requires activation or additional eligibility, show a clear explanation of the requirement.

If a feature is unavailable, present a useful status and support destination.

Do not present an inactive transfer, investment, loan, or cryptocurrency feature as a completed transaction or working financial capability.

6.5 Administrative functions

Administrative interfaces must be restricted to authorized administrators.

Potential responsibilities include member support, account review, audit history, and operational oversight.

All privileged actions require appropriate server-side authorization, audit logging, and validation. Hiding a frontend button is not a security control.

⸻

7. Design System

Color palette

:root {
  --evermont-blue: #0504AA;
  --evermont-white: #FFFFFF;
  --evermont-gold: #C9A227;
  --text-primary: #171717;
  --text-secondary: #525252;
  --surface-primary: #FFFFFF;
  --surface-secondary: #F7F8FC;
  --border-subtle: #E5E7EB;
}

Use royal blue for primary actions, important headings, and navigation accents. Use white for clean backgrounds and gold sparingly for premium details.

UI principles

* Maintain consistent spacing and typography.
* Use readable font sizes and line heights.
* Provide visible keyboard-focus states.
* Use descriptive labels for buttons and links.
* Provide loading, empty, success, and error states.
* Avoid layout shifts during loading.
* Ensure text contrast meets WCAG 2.2 AA where applicable.
* Respect reduced-motion preferences.
* Avoid excessive animations and unnecessary effects.
* Test common mobile screen sizes.

Responsive behavior

Verify:

* Mobile navigation opens and closes correctly.
* Buttons are usable with touch.
* Cards do not overflow their containers.
* Text remains readable without horizontal scrolling.
* Forms work with mobile keyboards.
* The footer and navigation remain usable on small screens.
* All primary destinations remain accessible.

⸻

8. SEO and Google Indexing

Search-engine optimization is a core requirement for the public homepage.

The objective is to make eligible public pages discoverable, crawlable, understandable, and useful to search engines. No implementation can guarantee a particular ranking or immediate indexing.

8.1 Unique page metadata

Every indexable public page should have:

* A unique, descriptive HTML title.
* A meaningful meta description.
* A canonical URL pointing to the preferred version of that page.
* An appropriate heading hierarchy.
* Relevant, useful body content.
* Correct internal links.
* Appropriate Open Graph and social-sharing metadata where needed.

Example homepage metadata:

<title>Evermont Credit Union | Private Wealth Banking</title>
<meta
  name="description"
  content="Explore Evermont Credit Union's financial services, account information, and member resources."
/>
<link
  rel="canonical"
  href="https://evermontcredit.online/"
/>

Use this as an example, and ensure the final description accurately reflects the services actually available.

Do not copy the same title, description, and canonical URL to every page.

8.2 Real public routes

A section anchor such as #about or #services is not a substitute for an independent page URL.

Where separate public pages are intended, create real, crawlable routes with distinct content.

Potential routes include:

/
 /about
 /checking-savings
 /loans
 /cryptocurrency
 /401k-retirement
 /contact
 /privacy
 /terms

These are proposed routes. Confirm that each route exists and has been implemented before including it in the sitemap or linking to it publicly.

Do not create thin or repetitive pages solely to increase the number of indexed URLs.

8.3 Sitemap

Maintain a valid sitemap at:

https://evermontcredit.online/sitemap.xml

The sitemap should contain only canonical, indexable public URLs that return successful responses.

Exclude:

* Login and registration pages when they are not intended for search indexing.
* Private dashboard pages.
* Administrative routes.
* Nonexistent URLs.
* Redirect destinations that should not be canonical sitemap entries.
* Duplicate URL variants.
* Pages marked noindex.

Validate XML syntax and verify the live HTTP response after deployment.

8.4 Robots.txt

Maintain a valid robots file at:

https://evermontcredit.online/robots.txt

Example:

User-agent: *
Allow: /
Sitemap: https://evermontcredit.online/sitemap.xml

Adjust the policy to reflect the actual site architecture.

Robots directives are not a substitute for authentication. Sensitive portal and administrative routes must remain protected by application access controls.

Do not block essential public CSS, JavaScript, or page resources required for rendering.

8.5 Canonical URLs and redirects

Choose one preferred HTTPS hostname and use it consistently throughout metadata, internal links, sitemap entries, and structured data.

Verify that:

* HTTP redirects to HTTPS.
* The nonpreferred hostname redirects to the preferred hostname if both are configured.
* Trailing-slash behavior is consistent.
* Canonical tags match the actual public URLs.
* The homepage does not redirect to the member portal.
* Unknown URLs return an appropriate not-found response.
* Redirects do not create loops or chains.

8.6 Structured data

Add structured data only when it accurately represents the real organization and the content of the page.

Potentially appropriate schema types may include Organization, WebSite, and relevant page types.

Do not claim verified financial institution status, federal insurance, regulatory authorization, ratings, or awards through structured data unless those claims have been substantiated.

Structured data does not guarantee a rich search result.

8.7 Google Search Console

The site owner should verify the correct domain property in Google Search Console.

Then:

1. Submit the sitemap.
2. Inspect the homepage URL.
3. Inspect each important public page.
4. Review the reported indexing status.
5. Check whether Google-selected and user-declared canonical URLs match.
6. Investigate excluded pages and crawl errors.
7. Request indexing for important corrected pages.
8. Recheck after Google has had time to crawl the site.

A submitted sitemap or indexing request does not guarantee that Google will index a page.

8.8 Page-by-page audit

For each intended public URL, record:

Check	Expected result
HTTP response	Successful response for the canonical page
Crawlability	Not unintentionally blocked
Indexability	No unintended noindex directive
Canonical	Correct preferred URL
Title	Unique and descriptive
Description	Relevant and distinct
Content	Useful and specific to the page
Internal links	Discoverable from relevant public pages
Sitemap	Included when appropriate
Mobile layout	Usable and responsive
Structured data	Valid and accurate where applicable

Classify each result as PASS, FAIL, or NOT TESTED. Never report a page as indexed merely because it loads in a browser.

⸻

9. Domain and Routing Requirements

The public homepage and member portal are separate production destinations.

Required navigation behavior

Source	Action	Destination
Public homepage	Sign In	https://v0-evermont.vercel.app/login
Public homepage	Member Login	https://v0-evermont.vercel.app/login
Public homepage	Open an Account	Verified portal registration route
Public service page	Explore a service	Verified corresponding destination
Member portal	Return to website	https://evermontcredit.online/

The registration route must be verified before it is linked.

Domain verification

Before modifying domain assignments or DNS:

1. Identify the Vercel project serving the public homepage.
2. Identify the Vercel project serving the member portal.
3. Confirm which production deployment owns evermontcredit.online.
4. Review configured redirects and rewrites.
5. Verify DNS records and domain ownership.
6. Confirm TLS/HTTPS is functioning.
7. Test the root domain and important routes.
8. Verify that the portal’s existing login remains accessible.

Do not change nameservers, overwrite DNS records, transfer domains, or remove production domains without a verified migration plan.

⸻

10. Supabase and Backend Integration

Supabase is the intended backend technology in the supplied source repository.

A configuration reference is not proof that the production application is connected to the correct backend.

Required verification

Check:

* Supabase project URL.
* Authentication configuration.
* Database schema.
* Row Level Security policies.
* User ownership relationships.
* Account and transaction query filters.
* Administrative permissions.
* Database functions and triggers.
* Error handling and logging.
* Environment-specific configuration.

Use the existing intended project unless a reviewed technical reason justifies changing it.

Data integrity

For any financial data interface:

* Read account data from the authorized source of truth.
* Validate records and ownership on the backend.
* Prevent members from reading other members’ private information.
* Avoid trusting client-submitted balances, ownership IDs, or administrative roles.
* Do not use client-side state as proof that a financial operation succeeded.
* Use idempotency and appropriate transaction controls for supported financial mutations.
* Maintain reconciliation and audit controls where applicable.

Do not modify production database schemas, policies, or ledger behavior as part of an unrelated homepage or SEO change.

⸻

11. Security Requirements

Security is mandatory across the public website, member portal, and any administrative interfaces.

Authentication and authorization

* Protect private pages using verified authentication.
* Enforce authorization on the server or database.
* Apply least-privilege access.
* Use appropriate session handling and expiration.
* Apply additional authentication protections where required.
* Verify administrative permissions independently of frontend visibility.
* Prevent cross-member access to accounts and transactions.

Secrets and environment variables

Never commit:

* API secret keys.
* Service-role keys.
* Database passwords.
* Access tokens.
* Session cookies.
* Private signing keys.
* Personal financial information.
* Production environment files.

Frontend environment variables are not secret merely because they use a framework-specific prefix.

Use only publishable client credentials in the browser, and protect privileged credentials in trusted server environments.

Secure development

* Review changes before merging.
* Audit dependency vulnerabilities.
* Scan for accidentally committed secrets.
* Validate external input.
* Avoid exposing sensitive details in logs.
* Use HTTPS.
* Apply appropriate security headers.
* Review access controls and data policies.
* Test negative authorization cases.
* Preserve auditability of privileged operations.

See docs/SECURITY.md and docs/SECURITY_REQUIREMENTS.md for the repository’s security documentation.

⸻

12. Financial Compliance and Trust

The website must describe its status and capabilities accurately.

Before publishing claims about banking, credit unions, deposits, lending, investment products, cryptocurrency, or insurance, verify the applicable legal and regulatory requirements.

Do not display unverified claims such as:

* Federally insured deposits.
* Guaranteed investment returns.
* Government approval or endorsement.
* Licensed banking status.
* Regulatory registration.
* Guaranteed loan approval.
* Guaranteed financial protection.

Use appropriate legal review for financial products, disclosures, privacy notices, terms, advertising, and any planned payment or banking integrations.

A polished design must never substitute for verified authorization, operational controls, or consumer disclosures.

⸻

13. Local Development

Prerequisites

Install:

* Node.js compatible with the repository’s Vite and TypeScript configuration.
* pnpm.
* Git.

Check installed versions:

node --version
pnpm --version
git --version

Clone the repository

Replace the placeholder with the actual authorized repository URL:

git clone <repository-url>
cd <repository-directory>

Install dependencies

pnpm install --frozen-lockfile

If installation fails because the lockfile and package manifest are inconsistent, investigate and correct the dependency definitions instead of silently discarding the lockfile.

Start development

pnpm dev

Open the local URL reported by Vite.

Run checks

pnpm type-check
pnpm lint
pnpm build

Preview the production build

pnpm preview

Test the production build locally before deploying.

⸻

14. Environment Configuration

Use a local environment file only when required by the actual project configuration.

A potential public-client configuration may look like:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Use the correct publishable key for the configured Supabase project and the variable names expected by the source code.

This example is not a claim that both variables are currently required.

Never place a Supabase service-role key, private payment-provider key, or other server secret in a VITE_ variable.

Environment rules

* Keep .env.local out of version control.
* Maintain a sanitized .env.example where useful.
* Configure production variables through the appropriate deployment settings.
* Separate development, preview, and production configurations.
* Verify that a deployment targets the intended backend.
* Never print secrets into build logs or diagnostic reports.

⸻

15. Code Quality and Testing

Every production-bound change must be tested.

Required checks

Run the checks supported by the current package scripts:

pnpm type-check
pnpm lint
pnpm build

Resolve failures introduced by the change. Investigate existing failures and distinguish them from newly introduced errors.

Do not hide failures by weakening TypeScript, disabling lint rules broadly, removing tests, or suppressing important error handling.

Functional tests

Test the affected user journeys:

* Homepage loads.
* Header navigation works.
* Mobile menu behaves correctly.
* Calls to action reach the correct destination.
* Public routes load directly.
* Refreshing nested routes works.
* Login and registration routes behave correctly.
* Protected pages enforce authentication.
* Member data is scoped to the authenticated user.
* Empty and error states display correctly.
* No unintended redirects occur.

SEO tests

Verify:

* Page titles and descriptions.
* Canonical URLs.
* Sitemap availability and XML validity.
* Robots file availability.
* HTTP status codes.
* Redirect behavior.
* Broken internal links.
* Indexability directives.
* Structured data validity.
* Mobile rendering.

Accessibility tests

Check keyboard navigation, visible focus, semantic headings, form labels, text contrast, accessible link names, and reduced-motion behavior.

Regression requirements

Do not replace working functionality merely to simplify a patch.

Preserve existing authentication, Supabase queries, member data boundaries, and application integrations unless a separately reviewed change requires otherwise.

⸻

16. Git Workflow

Use feature branches for development.

Inspect the repository

git status
git branch --show-current
git remote -v
git log -5 --oneline

Confirm the intended repository, branch, remote, and working-tree state before editing.

Create a feature branch

git switch -c fix/homepage-seo-quality

Use a descriptive branch name suited to the actual task.

Review changes

git diff --check
git diff
git status

Check for unrelated modifications and accidental secrets.

Commit changes

git add README.md
git commit -m "docs: update Evermont project README"

For a code change, stage the specific reviewed files rather than automatically adding every file in the working tree.

Push the branch

git push -u origin fix/homepage-seo-quality

Verify the remote branch and resulting CI or Vercel preview deployment.

Do not force-push, reset shared branches, overwrite another developer’s work, or merge into production without an appropriate review.

⸻

17. Vercel Deployment

Vercel is the intended deployment platform for the public homepage and member portal.

The two projects must be identified and verified separately.

Pre-deployment checklist

Before deploying:

1. Confirm the repository and project.
2. Confirm the intended branch and commit.
3. Verify the Vercel project configuration.
4. Check the configured root directory.
5. Check environment variables without exposing their values.
6. Run type-checking and linting.
7. Build the production application.
8. Test the affected routes.
9. Inspect the Git diff.
10. Confirm that the deployment target is correct.

Recommended release process

1. Push changes to a feature branch.
2. Allow the configured CI or Vercel preview deployment to run.
3. Review build logs.
4. Test the preview URL.
5. Verify navigation, SEO metadata, and important routes.
6. Merge through the repository’s approved release process.
7. Verify the production deployment.
8. Confirm the custom domain still serves the intended homepage.
9. Inspect production behavior and logs.

Deployment commands

Use the Vercel CLI only after verifying the correct project and account scope.

vercel

This normally creates a preview deployment.

For an explicitly authorized production release:

vercel --prod

Do not execute a production deployment merely because a build passes. Confirm the target, branch, domain, environment configuration, and release approval first.

Rollback

If a release introduces a serious regression:

* Identify the affected deployment.
* Review the previous known-good deployment.
* Follow the approved rollback procedure.
* Confirm that production traffic serves the intended version.
* Investigate the cause before attempting another release.

A rollback may affect subsequent deployment workflows, so verify the project’s deployment state afterward.

⸻

18. Production Verification

A deployment is not complete merely because Vercel reports that the build succeeded.

Website verification

Check:

* https://evermontcredit.online/
* https://evermontcredit.online/robots.txt
* https://evermontcredit.online/sitemap.xml
* Every intended public service page.
* Every important navigation destination.
* The portal login URL.
* Mobile and desktop rendering.

SEO verification

Check the actual live HTML and HTTP responses.

Verify that page metadata is present in the rendered output, canonical URLs are correct, public routes return appropriate statuses, and the sitemap contains only valid canonical pages.

Use Google Search Console to determine actual indexing status.

Runtime verification

Inspect application logs and browser-console errors.

Check for:

* JavaScript runtime errors.
* Failed API requests.
* Missing assets.
* Broken navigation.
* Authentication failures.
* Incorrect environment configuration.
* Unexpected redirects.
* Unexpected HTTP 4xx or 5xx responses.

Do not claim that runtime errors are resolved unless the relevant paths have actually been tested.

Release report

Record the following after each release:

Project:
Repository:
Branch:
Commit:
Preview URL:
Production URL:
Build status:
Type-check status:
Lint status:
Route verification:
SEO verification:
Runtime error review:
Outstanding issues:

Use PASS, FAIL, or NOT TESTED for individual verification results.

⸻

19. Monitoring and Maintenance

Recommended ongoing maintenance includes:

* Checking production errors.
* Monitoring availability.
* Reviewing deployment logs.
* Auditing dependency vulnerabilities.
* Checking broken public links.
* Validating sitemap and robots responses.
* Reviewing Google Search Console indexing reports.
* Monitoring changes to canonical URLs.
* Reviewing authentication and authorization controls.
* Testing backups and recovery procedures where applicable.
* Keeping project documentation synchronized with actual architecture.

Investigate unexpected changes in indexed pages, crawl errors, domain redirects, and deployment behavior.

Do not interpret a temporary indexing delay as proof of a website failure without reviewing Google’s reported status.

⸻

20. Development Roadmap

Phase 1 — Repository audit

* Inspect the full source tree.
* Identify duplicate or conflicting implementations.
* Review existing project instructions.
* Check routes and navigation.
* Run type-check, lint, and production build.
* Identify runtime and configuration errors.
* Establish the current deployment baseline.

Phase 2 — Public homepage quality

* Improve the visual hierarchy.
* Confirm responsive navigation.
* Repair broken links and missing destinations.
* Verify contact information.
* Standardize brand colors and typography.
* Improve accessibility.
* Replace placeholder assets where appropriate.

Phase 3 — Technical SEO

* Implement unique metadata for each public page.
* Correct canonical URLs.
* Verify robots.txt and sitemap.xml.
* Ensure intended public routes are crawlable.
* Improve internal linking.
* Validate structured data.
* Verify Google Search Console configuration.
* Audit page-specific indexing issues.

Phase 4 — Portal integrity

* Verify authentication flows.
* Review protected routes.
* Test member data isolation.
* Verify dashboard data sources.
* Review service activation behavior.
* Confirm administrative authorization.
* Preserve existing backend integrations.

Phase 5 — Release readiness

* Run automated checks.
* Test preview deployments.
* Verify domain and redirects.
* Review security-sensitive changes.
* Publish through the approved release process.
* Test the production site.
* Record results and unresolved issues.

Phase 6 — Ongoing improvements

* Monitor indexing and technical SEO.
* Review performance and accessibility.
* Maintain dependencies.
* Improve observability.
* Expand automated regression tests.
* Document newly implemented capabilities.

⸻

21. Contribution Guidelines

Anyone modifying this repository should follow these principles:

1. Inspect existing implementation before editing.
2. Read AGENTS.md and relevant documentation.
3. Preserve working functionality.
4. Avoid unrelated rewrites.
5. Use existing dependencies and patterns where appropriate.
6. Make small, focused changes.
7. Test changes before committing.
8. Document new environment requirements.
9. Never commit secrets.
10. Verify links and destinations.
11. Do not claim untested functionality is working.
12. Do not change production infrastructure without verifying the target.
13. Do not alter financial records or backend permissions as part of unrelated UI changes.
14. Provide a clear summary of changes, test results, and outstanding issues.

Commit-message conventions

Suggested prefixes:

* fix: — Bug fixes.
* feat: — New functionality.
* docs: — Documentation.
* refactor: — Internal restructuring.
* style: — Presentation changes.
* test: — Tests.
* chore: — Maintenance.

Examples:

docs: update Evermont project README
fix: correct homepage canonical metadata
fix: repair public navigation links
feat: add checking and savings information page
test: add public route regression checks

⸻

22. Project Status and Limitations

The following distinctions must be maintained throughout development.

Implemented

A feature is implemented only when its code exists and the relevant functionality has been verified.

Configured

A service is configured only when its required settings and integration have been confirmed.

Deployed

A feature is deployed only when the corresponding code is present in the identified deployment.

Operational

A feature is operational only when its required backend, permissions, dependencies, and actual behavior have been tested.

Indexed

A page is indexed only when Google Search Console or another reliable Google indexing signal confirms that status. A successful HTTP response is not sufficient.

Production-ready

A feature is production-ready only after appropriate functional, security, compliance, operational, and release checks have passed.

Use these definitions consistently in documentation, status reports, public-facing copy, and development handoffs.

⸻

Official Resources

* Website: https://evermontcredit.online/
* Member portal: https://v0-evermont.vercel.app/
* Member login: https://v0-evermont.vercel.app/login
* Google Search Console: https://search.google.com/search-console/
* Google Search Central: https://developers.google.com/search/docs
* Vercel documentation: https://vercel.com/docs
* React documentation: https://react.dev/
* TypeScript documentation: https://www.typescriptlang.org/docs/
* Vite documentation: https://vite.dev/guide/
* Supabase documentation: https://supabase.com/docs

⸻

Evermont Credit Union
Where Private Wealth is Protected.

This README documents the intended architecture, engineering standards, and verification requirements. Actual implementation, regulatory status, production configuration, and feature availability must be independently verified.
