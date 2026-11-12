export type LegalSection = {
  id: string
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type LegalPageKey = 'privacy' | 'terms'

export const LEGAL_LAST_UPDATED = 'November 12, 2026'

export const legalDocuments: Record<LegalPageKey, {
  title: string
  description: string
  lede: string
  imageAlt: string
  sections: LegalSection[]
  reviewNotes: string[]
}> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'A draft describing how personal information may be handled across EVERMONT-branded public and digital banking experiences. Subject to legal review.',
    lede: 'This draft explains the information that may be handled through EVERMONT-branded public and digital services, why it may be used, and choices that may be available to you.',
    imageAlt: 'A quiet, secure-looking desk with a closed notebook and a gold pen against deep blue surroundings',
    reviewNotes: [
      'Replace every bracketed legal-entity, jurisdiction, mailing-address, email, and telephone placeholder with verified information.',
      'Confirm which entity operates each registration, application, member-portal, identity-verification, and document-storage feature, and confirm the active data flows and retention periods.',
      'Review the live Google Analytics and Google Tag Manager configuration, any consent or opt-out mechanism, and the legal characterization of analytics disclosures under applicable state law.',
      'Confirm AI-provider terms and retention, applicable GLBA/Regulation P obligations, state-law applicability, and whether any separate financial privacy notice is required.',
    ],
    sections: [
      {
        id: 'privacy-operator-scope',
        heading: '1. Who this policy covers',
        paragraphs: [
          'This draft is written for the public website, registration experience, and digital services presented under the EVERMONT CREDIT UNION and EVERMONT PRIVATE WEALTH SECURED BANK names. The responsible operator must be identified before publication as [LEGAL ENTITY NAME], a [STATE OF ORGANIZATION AND ENTITY TYPE], doing business as [VERIFIED TRADE OR BRAND NAME] (referred to as “Evermont,” “we,” or “us”). A brand name alone does not identify a legal institution.',
          'This policy applies only to services operated by that identified entity. A separate member portal, application, financial product, or service provider may present its own privacy notice or account agreement. If another entity operates a service, its identity and applicable notice must be disclosed there. This draft does not establish that the operator is a bank, credit union, lender, investment adviser, or trust company, or that any account or deposit is insured.',
        ],
      },
      {
        id: 'privacy-information',
        heading: '2. Information that may be collected',
        paragraphs: [
          'The information handled depends on which features you use. We collect information you provide, information generated when you use a digital service, and information provided by service providers or other sources when permitted by law.',
        ],
        bullets: [
          'Identity and contact details, such as name, email address, telephone number, and mailing or residential address.',
          'Registration and account information. The current site registration flow requests first name, last name, email address, and a password. It submits the sign-up credentials to Supabase Authentication and writes the name and email to a Supabase profile record; the password is not included in the profile fields written by the application. Account or application services, if enabled, may request date of birth, government identifiers such as a Social Security number, financial information, and identity or address-verification documents. Such sensitive information should be submitted only through a designated application or secure portal, never through ordinary email or the public AI assistant. Confirm the live application fields and storage practices before publication.',
          'Financial and transaction information, such as account, payment, balance, or transaction details, only when an account or transaction service is actually provided and the information is necessary for that service.',
          'Communications, including support requests, feedback, messages to the AI assistant, and records of how we respond.',
          'Technical and usage information, such as IP address, browser and device attributes, referring or exit pages, pages viewed, timestamps, and interactions with site features. Cookies or similar technologies may be used for functionality, analytics, or security.',
          'Information from identity-verification, fraud-prevention, hosting, authentication, analytics, and other service providers, when a feature is active and the collection is lawful.',
        ],
      },
      {
        id: 'privacy-sources',
        heading: '3. How information is collected',
        paragraphs: [
          'We may collect information directly when you complete a form, register, contact us, use the assistant, or use an account or application feature. Digital systems may collect certain device, log, and usage information automatically. We may also receive information from service providers, financial or identity-verification partners, and public or government sources where allowed by law and relevant to a requested service.',
          'The public contact form on this site prepares a message in your email application; it does not itself send the message to Evermont. If you choose to send that email, your email provider handles its delivery and may retain a copy. Do not include passwords, one-time codes, full account numbers, Social Security numbers, or identity documents in ordinary email.',
        ],
      },
      {
        id: 'privacy-purposes',
        heading: '4. Why information may be used',
        paragraphs: ['Subject to applicable law and any separate notice or agreement, information may be used to:'],
        bullets: [
          'Operate, maintain, and improve public pages, registration, authentication, account access, and requested services.',
          'Verify identity, process applications or instructions, communicate with you, and provide customer or member support.',
          'Protect users and services, detect or investigate suspected fraud, misuse, security incidents, or violations of applicable terms.',
          'Maintain business, security, and audit records; meet legal, regulatory, reporting, and recordkeeping obligations; and respond to lawful requests.',
          'Understand site performance and usage, including through analytics tools, and administer preferences or service communications.',
          'Establish, exercise, or defend legal rights and conduct other activities disclosed to you or permitted by law.',
        ],
      },
      {
        id: 'privacy-financial-information',
        heading: '5. Financial information and financial-privacy notices',
        paragraphs: [
          'Some U.S. privacy requirements, including the Gramm-Leach-Bliley Act and its implementing regulations, apply only to particular institutions, activities, and customer relationships. The operator must determine whether those requirements apply to each service. Where applicable, the operator will provide the separate financial privacy notice required by law, explain applicable sharing practices and choices, and honor legally required limitations. That notice and any account agreement control for the information and relationship they cover.',
          'This general website policy is not a substitute for a legally required financial privacy notice, an account-opening disclosure, or a product-specific privacy notice. No charter, license, regulator approval, or FDIC or NCUA insurance status is represented by this draft.',
        ],
      },
      {
        id: 'privacy-ai-assistant',
        heading: '6. AI assistant and public questions',
        paragraphs: [
          'The public-site assistant accepts a question of up to 1,000 characters and sends that question through Evermont’s server to OpenAI to generate a response. It is intended for public website information only; the current implementation does not send account balances, transaction records, or application profiles with the question. OpenAI and the systems used to operate the assistant may process technical request data under their applicable terms.',
          'Do not enter personal, account, payment, health, identity-verification, or other confidential information into the assistant. AI responses may be incomplete or inaccurate and are not financial, investment, tax, legal, lending, or credit advice. Before publication, confirm the provider’s current data-processing terms, retention settings, and any required notice or consent.',
        ],
      },
      {
        id: 'privacy-cookies',
        heading: '7. Cookies, analytics, and similar technologies',
        paragraphs: [
          'The current website code loads Google Analytics and Google Tag Manager. Depending on the active tag configuration, these tools may use cookies or similar technologies and may collect browser, device, page-view, referral, and interaction information. Google’s processing is also subject to its applicable terms and privacy disclosures. The contents of the tag container can change; the operator should inventory every active tag and confirm the applicable retention, consent, and opt-out controls before publication.',
          'You can adjust cookie settings through your browser, though blocking some technologies may affect site functionality. Browser settings do not necessarily stop all collection. We do not make a representation here that a particular opt-out signal is recognized or that every analytics tag is disabled when you decline cookies; confirm the actual controls and state-law requirements before relying on them.',
        ],
      },
      {
        id: 'privacy-disclosures',
        heading: '8. When information may be disclosed',
        paragraphs: [
          'Information may be disclosed, as appropriate and subject to applicable law, to service providers that host or support the site, authentication, analytics, communications, AI responses, security, identity verification, or document storage; to a financial or program partner needed to provide a requested service; and to professional advisers or auditors bound by appropriate duties.',
          'Information may also be disclosed to comply with law or legal process, respond to a regulator or lawful government request, protect users or the operator, investigate fraud or security matters, enforce an agreement, or support a corporate transaction such as a merger or transfer of assets. We may disclose information at your direction or with your consent. The operator must confirm actual recipients, contracts, and permitted purposes before publication.',
        ],
      },
      {
        id: 'privacy-sale-sharing',
        heading: '9. Sale, targeted advertising, and state privacy choices',
        paragraphs: [
          'State privacy laws define “sale,” “sharing,” targeted advertising, sensitive data, and exemptions differently. Some financial information may be subject to separate federal rules or statutory exclusions. Because the current site uses analytics and a configurable tag manager, the operator must assess actual disclosures and applicable state-law definitions before stating whether personal information is sold, shared, or used for targeted advertising. No “we do not sell or share” claim is made in this draft.',
          'Depending on your state and the operator’s legal status, you may have rights to request access to, correction of, or deletion of certain personal information; receive a portable copy; opt out of specified processing; limit certain uses of sensitive personal information; or appeal a denied request. These rights are subject to identity verification, exceptions, and other limits under law. Submit a request to [PRIVACY REQUEST EMAIL] or [PRIVACY NOTICE MAILING ADDRESS]. We will verify and respond within the time required by applicable law and will not unlawfully discriminate against you for exercising a privacy right.',
          'Before this policy is published, the operator must insert any required “Do Not Sell or Share,” targeted-advertising opt-out, Global Privacy Control, or other state-specific mechanism and explain how to use it. Do not rely on this draft as confirmation that those mechanisms are currently implemented.',
        ],
      },
      {
        id: 'privacy-retention',
        heading: '10. Retention',
        paragraphs: [
          'We retain personal information for as long as reasonably necessary for the purposes described in this policy, including providing services, maintaining records, resolving disputes, enforcing agreements, and meeting legal, regulatory, security, and accounting obligations. Retention periods vary by information type and purpose. The operator should document and apply an appropriate retention and deletion schedule, including for account, identity-verification, analytics, and support data.',
        ],
      },
      {
        id: 'privacy-security',
        heading: '11. Security',
        paragraphs: [
          'The operator will maintain administrative, technical, and physical safeguards designed to protect personal information in proportion to its sensitivity and the requirements that apply. No website, transmission method, or storage system can be guaranteed to be completely secure, and this policy is not a security certification or warranty. Protect your sign-in credentials, use only the verified member-portal address, and promptly report suspected unauthorized access to [SECURITY CONTACT EMAIL OR TELEPHONE]. Never send a password, one-time code, or recovery link to anyone.',
        ],
      },
      {
        id: 'privacy-children',
        heading: '12. Children’s information',
        paragraphs: [
          'The public website is not directed to children under 13, and we do not knowingly collect personal information from a child under 13 through the public site. If you believe a child has submitted information, contact [PRIVACY EMAIL] so the operator can review the request. Eligibility for an account or financial service is governed by applicable law and the relevant product documents; this policy does not set account eligibility.',
        ],
      },
      {
        id: 'privacy-third-parties',
        heading: '13. Third-party websites and services',
        paragraphs: [
          'The site may link to a member portal, social network, service provider, or other website not controlled by the operator. Their privacy practices are governed by their own notices and terms. Review those documents before providing information. A link does not mean the operator controls or endorses the linked service.',
        ],
      },
      {
        id: 'privacy-changes',
        heading: '14. Changes to this policy',
        paragraphs: [
          'We may revise this policy to reflect changes in services, data practices, or legal requirements. The “Last updated” date will identify the latest revision. If a change requires advance notice, consent, or another procedure, the operator will follow applicable law. Continued use of a service is not a substitute for any consent required by law.',
        ],
      },
      {
        id: 'privacy-contact',
        heading: '15. Contact and privacy requests',
        paragraphs: [
          'For questions, privacy requests, or a complaint, contact [LEGAL ENTITY NAME], Attention: Privacy Officer, at [PRIVACY EMAIL], [NOTICE MAILING ADDRESS], or [CUSTOMER SERVICE TELEPHONE]. Replace each placeholder with a monitored contact channel before publication. Do not include passwords, one-time codes, full account numbers, or Social Security numbers in an email or public-site message.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Draft terms for using EVERMONT-branded public pages and digital services, with account agreements and financial disclosures expressly distinguished. Subject to legal review.',
    lede: 'These terms describe use of the EVERMONT-branded website and digital experiences. Separate account, product, and electronic-service agreements may apply when a service is offered.',
    imageAlt: 'A formal reading room with a navy desk, open document, and understated gold detail',
    reviewNotes: [
      'Insert the verified legal operator, state of organization, governing law, notice address, and monitored contact channels.',
      'Confirm that all account, deposit, lending, wealth, payment, and digital-banking services described on the site are actually offered and that required disclosures are delivered before use.',
      'Review any liability limitation, dispute, electronic-record, privacy, and consumer-protection language with U.S. counsel; no arbitration clause or class-action waiver is included in this draft.',
      'Do not publish any charter, license, regulatory approval, deposit-insurance, security-certification, rate, fee, guarantee, or product-availability claim unless verified and approved.',
    ],
    sections: [
      {
        id: 'terms-operator-scope',
        heading: '1. Operator, scope, and acceptance',
        paragraphs: [
          'This draft applies to your access to and use of the public website and digital services presented under the EVERMONT CREDIT UNION and EVERMONT PRIVATE WEALTH SECURED BANK names (the “Site”). The contracting operator must be identified before publication as [LEGAL ENTITY NAME], a [STATE OF ORGANIZATION AND ENTITY TYPE], doing business as [VERIFIED TRADE OR BRAND NAME] (“Evermont,” “we,” or “us”). A brand name does not itself establish the identity or legal status of an institution.',
          'By accessing or using the Site, you agree to these terms to the extent permitted by law. If you do not agree, do not use the Site. These terms govern only the Site unless a separate agreement expressly incorporates them. They do not open an account, create a banking, credit, advisory, fiduciary, or other customer relationship, or replace a signed or electronic agreement for a specific service.',
        ],
      },
      {
        id: 'terms-eligibility',
        heading: '2. Eligibility and authority',
        paragraphs: [
          'You may use the Site only if you can form a binding agreement under applicable law and comply with these terms. A particular account or service may have additional age, residency, identity, eligibility, or other requirements stated in its application and governing documents. Do not use the Site or apply for a service if doing so would violate a law that applies to you.',
          'If you act for another person or organization, you represent that you are authorized to do so. Do not misrepresent your identity, eligibility, or authority.',
        ],
      },
      {
        id: 'terms-information-only',
        heading: '3. Website information is limited',
        paragraphs: [
          'Site content is provided for general information and navigation. It may be incomplete, illustrative, or out of date and is not an offer, commitment to provide a financial product, approval, personalized recommendation, or professional financial, investment, tax, legal, lending, or credit advice. Do not make a financial decision based solely on public-site content; request current written terms and consult your own qualified advisers as appropriate.',
          'Rates, yields, fees, eligibility, availability, service features, and processing times are not established by a general page. They apply only when stated in the current official disclosure or separate agreement for the product or service. If content conflicts, the required product disclosure and executed agreement control for that product, subject to applicable law.',
        ],
      },
      {
        id: 'terms-institutional-status',
        heading: '4. Institutional status and financial protections',
        paragraphs: [
          'The use of the EVERMONT CREDIT UNION or PRIVATE WEALTH SECURED BANK names is branding and is not proof of a charter, deposit-taking authority, lending license, investment-adviser or fiduciary status, regulatory approval, or security certification. This draft makes no representation that any account or deposit is insured by the FDIC or NCUA. Do not treat “secured” in a brand or page title as a guarantee of safety, return, insurance, or protection from loss.',
          'Before an account or financial service is offered, the operator must provide all material terms and legally required disclosures, including verified information about the provider and any applicable insurance or regulatory status. No such status should be stated unless independently verified and approved for the specific service.',
        ],
      },
      {
        id: 'terms-account-services',
        heading: '5. Accounts, applications, and separate service agreements',
        paragraphs: [
          'Registration for access to the Site is not the same as opening a deposit or other financial account. An application is not an approval, promise of availability, or guarantee of service. Any application may require additional information, identity verification, eligibility review, and acceptance of separate terms. The operator will present applicable rates, fees, limitations, and required notices before you enter into a covered financial transaction.',
          'Online banking, payment instructions, statements, transfers, cards, loans, or other account functions are governed by their own agreements and disclosures when those services are available. Those documents address service-specific instructions, processing, error resolution, electronic funds transfers, fees, and other rights or duties. If these Site terms conflict with a specific account agreement, that agreement controls for the service, subject to applicable law.',
        ],
      },
      {
        id: 'terms-security',
        heading: '6. Credentials and account security',
        paragraphs: [
          'You are responsible for keeping your credentials confidential, using a strong unique password, and promptly notifying [SECURITY CONTACT] if you suspect unauthorized access. Do not share passwords, one-time codes, recovery links, or full account numbers through email, the public contact form, or the public AI assistant. Sign out after using a shared device and verify the address of a sign-in page before entering credentials.',
          'We may take reasonable steps allowed by applicable law to protect the Site, verify instructions, investigate suspicious activity, or restrict access when necessary. Any suspension, transaction review, or account-specific action is governed by applicable law and the relevant account agreement; these Site terms do not authorize an otherwise unlawful restriction or waive a consumer right.',
        ],
      },
      {
        id: 'terms-acceptable-use',
        heading: '7. Acceptable use',
        paragraphs: ['You agree not to, and not to help another person to:'],
        bullets: [
          'Use the Site for an unlawful purpose, to defraud or harm another person, or in violation of a third party’s rights.',
          'Attempt to gain unauthorized access to an account, system, network, or data, or interfere with the security, availability, or operation of the Site.',
          'Upload malware, introduce harmful code, probe or test systems without written authorization, or bypass a security or access control.',
          'Use automated means to scrape, harvest, or copy Site content or personal information in a way that violates law or burdens the Site.',
          'Submit false, misleading, or unauthorized information, or use the public AI assistant to submit sensitive personal, account, payment, or authentication information.',
        ],
      },
      {
        id: 'terms-electronic-communications',
        heading: '8. Electronic communications and records',
        paragraphs: [
          'The Site may display contact information, application workflows, or links to digital services. These terms alone do not obtain your consent to receive legally required notices electronically, sign an agreement electronically, or receive marketing communications. Any consent required for electronic records or communications will be requested separately and will explain the scope, hardware or software requirements, and withdrawal rights required by applicable law.',
          'A message sent through a public contact channel is not necessarily received or acted on immediately. Do not use ordinary email or the public form for urgent, confidential, or time-sensitive account instructions. Use a verified channel specified in your applicable account agreement.',
        ],
      },
      {
        id: 'terms-ai',
        heading: '9. AI assistant',
        paragraphs: [
          'The public AI assistant is intended to help navigate general website information. It is not a person, account representative, financial adviser, or decision-maker. Responses may be inaccurate or incomplete and do not modify an account agreement or create an offer, approval, or commitment. A question submitted to the assistant is transmitted to an AI service provider to generate a response. Do not enter personal or confidential information. The Privacy Policy describes this processing in more detail.',
        ],
      },
      {
        id: 'terms-intellectual-property',
        heading: '10. Site content and intellectual property',
        paragraphs: [
          'The Site and its text, design, graphics, branding, and other content are owned by or licensed to the operator or its licensors and are protected by applicable intellectual-property laws. You may view and print reasonable portions for personal, noncommercial use, provided you do not remove notices or misrepresent the source. No other license is granted. You may not reproduce, modify, distribute, publicly display, or commercially exploit Site content without prior written permission, except as allowed by law.',
          'You retain rights you hold in information you submit. You authorize the operator to use that information as reasonably necessary to receive, process, and respond to your request, consistent with the Privacy Policy and applicable law.',
        ],
      },
      {
        id: 'terms-third-parties',
        heading: '11. Third-party services and links',
        paragraphs: [
          'The Site may rely on hosting, analytics, authentication, communications, AI, or other service providers and may link to external websites. Those providers and websites may have separate terms and privacy notices. Except where required by law or stated in a separate agreement, the operator is not responsible for third-party content, policies, or availability. A link is provided for convenience and is not an endorsement or guarantee.',
        ],
      },
      {
        id: 'terms-privacy',
        heading: '12. Privacy',
        paragraphs: [
          'The Privacy Policy explains how personal information may be handled on the Site and through digital services. The policy is incorporated only to describe privacy practices; it does not replace a separate privacy notice required for a financial product or account. Review the applicable privacy notice before submitting sensitive information or entering into a service relationship.',
        ],
      },
      {
        id: 'terms-availability',
        heading: '13. Availability and changes to the Site',
        paragraphs: [
          'We may add, change, suspend, or discontinue Site pages or features, subject to applicable law and any separate service agreement. We do not promise uninterrupted availability, error-free operation, or compatibility with every device. A description of a planned or informational feature does not establish that it is available or that an application will be accepted.',
        ],
      },
      {
        id: 'terms-disclaimers',
        heading: '14. Disclaimers',
        paragraphs: [
          'To the maximum extent permitted by applicable law, the Site is provided “as is” and “as available,” without warranties not expressly required by law. The operator does not warrant that information is complete, current, uninterrupted, or error-free, or that the Site will be free of harmful components. Nothing in this section excludes a warranty, remedy, or duty that applicable law does not permit the operator to exclude or limit.',
        ],
      },
      {
        id: 'terms-liability',
        heading: '15. Limitation of liability',
        paragraphs: [
          'To the maximum extent permitted by applicable law, the operator will not be liable for indirect, incidental, special, exemplary, punitive, or consequential damages arising from use of the public Site. Nothing in these terms limits liability where such a limit is prohibited by law, including any nonwaivable consumer protection, privacy, financial-service, or other statutory right. Any limitation applicable to an account or financial service must be stated in the governing agreement and remains subject to applicable law.',
          'The scope and enforceability of any liability limitation depend on the facts, the governing law, and the service involved. This section must be reviewed by counsel before publication and must not be used to waive rights that cannot legally be waived.',
        ],
      },
      {
        id: 'terms-termination',
        heading: '16. Suspension and termination',
        paragraphs: [
          'You may stop using the Site at any time. We may restrict or suspend access to the public Site where reasonably necessary to address security, misuse, legal, or operational concerns, subject to applicable law. These terms do not by themselves terminate or change an account or financial service; use the termination process in the applicable service agreement.',
        ],
      },
      {
        id: 'terms-governing-law',
        heading: '17. Governing law and disputes',
        paragraphs: [
          'These Site terms are governed by the laws of [GOVERNING STATE], without displacing applicable federal law or nonwaivable consumer protections. Any permitted court proceeding must be brought in [APPROVED COURT OR VENUE], subject to applicable law. The governing state and venue must be reviewed and completed by counsel before publication.',
          'This draft does not impose mandatory arbitration, waive a jury trial, or waive participation in a class or representative action. Any such provision, if proposed, must be presented in a separate, conspicuous agreement and reviewed for enforceability and required consumer protections.',
        ],
      },
      {
        id: 'terms-changes',
        heading: '18. Changes to these terms',
        paragraphs: [
          'We may revise these terms by posting an updated version with a new “Last updated” date. A revision applies prospectively from the stated effective date, unless applicable law requires another process. If a change requires notice or affirmative consent, we will use the process required by law. No change to these Site terms modifies an existing account agreement unless that agreement and applicable law permit it.',
        ],
      },
      {
        id: 'terms-general',
        heading: '19. General provisions',
        paragraphs: [
          'If a court finds a provision unenforceable, the remaining provisions will continue to the extent permitted by law. A failure to enforce a provision is not a waiver. These terms and any applicable notices govern use of the Site; they do not supersede a separate signed or electronic product agreement. No person who is not a party to these terms receives a third-party-beneficiary right unless applicable law requires otherwise.',
        ],
      },
      {
        id: 'terms-contact',
        heading: '20. Contact and legal notices',
        paragraphs: [
          'Questions or notices about these terms should be sent to [LEGAL ENTITY NAME], Attention: Legal Department, [NOTICE MAILING ADDRESS], [LEGAL CONTACT EMAIL], or [CUSTOMER SERVICE TELEPHONE]. Replace each placeholder with a verified, monitored channel before publication. Do not use these general channels for urgent account instructions or send passwords, one-time codes, full account numbers, or Social Security numbers.',
        ],
      },
    ],
  },
}
