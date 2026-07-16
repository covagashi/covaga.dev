import type { SiteContent } from "../types";

// English — source of truth. All other locales mirror these keys.
export const en: SiteContent = {
  meta: {
    umbrellaTitle: "Covaga — Open toolkit for EPLAN engineers",
    umbrellaDescription:
      "Three open tools for EPLAN electrical engineers: drive EPLAN with AI (eplan-rag-mcp), open projects in any browser (ecad-view), and route its events to the tools your office runs (Covaga Hub). Built on Cloudflare.",
    homeTitle: "Covaga Hub — Route your EPLAN exports anywhere",
    homeDescription:
      "Covaga Hub listens for your EPLAN exports — PDF, BOM, project close — and delivers them to Teams, SharePoint, Drive or email. Credentials stay server-side; the client stays open source.",
    privacyTitle: "Covaga — Privacy",
    privacyDescription:
      "How Covaga handles data across its website and hosted services.",
    termsTitle: "Covaga — Terms",
    termsDescription:
      "The terms that govern use of the Covaga Hub hosted service and the open-source Covaga tools.",
  },
  umbrella: {
    nav: {
      tools: "tools",
      open: "open source",
      getHub: "Get Hub",
    },
    hero: {
      eyebrow: "open toolkit for eplan",
      heading: "Do more with your EPLAN projects",
      leadHtml:
        'Three open tools for electrical engineers — drive <strong class="font-semibold text-[var(--color-ink)]">EPLAN</strong> with AI, open projects in any browser, and route its events to the tools your office already runs. Free to start, yours to host.',
      ctaPrimary: "Explore the toolkit",
      ctaSecondary: "Start free",
      specChips: [
        { label: "stack", value: "cloudflare" },
        { label: "core", value: "open source" },
        { label: "i18n", value: "7 locales" },
      ],
      schemaTitle: "Covaga toolkit schematic",
      schemaDesc:
        "A wiring schematic: an EPLAN P8 source terminal on the left feeds the covaga bus module in the centre, which fans out to three tool terminals on the right — rag-mcp, ecad-view and hub.",
      figCaption: "fig. 01 — toolkit schematic",
      figFlow: "eplan → covaga → tools",
    },
    tools: {
      eyebrow: "tools · 03",
      heading: "One toolkit, three modules.",
      lead: "Each tool solves one real EPLAN gap and runs on its own — pick one, or wire all three. Two are open source you self-host; the platform is hosted for you.",
      statusOssLabel: "open source",
      statusHostedLabel: "open core · hosted",
      items: [
        {
          ref: "U1 · MCP",
          name: "eplan-rag-mcp",
          what: "Drive EPLAN with AI.",
          body: "A local MCP server that runs 149 EPLAN actions silently in QuietMode, plus RAG documentation for P8 and EEC Pro 2026 and a Claude Code skill that writes correct EPLAN scripts.",
          chips: [
            { label: "tools", value: "156" },
            { label: "rag", value: "p8 + eec" },
            { label: "runtime", value: "local" },
          ],
          status: "open source",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/eplan-rag-mcp" },
          ],
          primary: false,
        },
        {
          ref: "U2 · VIEWER",
          name: "ecad-view",
          what: "Open projects in the browser.",
          body: "Drop an .epdz export or an .e3d part and read it in any browser — 3D models, schematic pages, device search and cross-refs. Offline PWA; files never leave the device.",
          chips: [
            { label: "fmt", value: ".epdz / .e3d" },
            { label: "3d", value: "three.js" },
            { label: "runs", value: "client-side" },
          ],
          status: "open source",
          statusKind: "oss",
          links: [
            { label: "GitHub ↗", href: "https://github.com/covagashi/ecad-view" },
            { label: "view.covaga.dev", href: "https://view.covaga.dev" },
          ],
          primary: false,
        },
        {
          ref: "U3 · PLATFORM",
          name: "Covaga Hub",
          what: "Route events · close data gaps.",
          body: "The hosted platform. Route EPLAN events — PDF, BOM, project close — to Teams, SharePoint, Drive or email, and close article-database text gaps through reviewed AI proposals. Credentials stay server-side.",
          chips: [
            { label: "mode", value: "hosted" },
            { label: "tenancy", value: "multi" },
            { label: "gym", value: "mcp" },
          ],
          status: "open core · hosted",
          statusKind: "hosted",
          links: [{ label: "hub.covaga.dev", href: "/hub" }],
          primary: true,
        },
      ],
    },
    principles: {
      eyebrow: "how covaga is built",
      heading: "Engineering-office rules.",
      items: [
        {
          title: "Open by default",
          body: "The local tools are open source and free to run — read every line before you install, audit them with your IT team, self-host anywhere.",
        },
        {
          title: "Where your team works",
          body: "No new tool to learn. Covaga speaks EPLAN and the M365 stack your office already runs; engineers keep exporting exactly as they do today.",
        },
        {
          title: "Your data stays yours",
          body: "Projects render on your device; real article data lives in your own database, never in a repo. The hosted worker holds credentials, not files.",
        },
      ],
    },
    cta: {
      eyebrow: "get started",
      heading: "Start with one tool. Wire the rest when you're ready.",
      primary: "Create a Hub tenant",
      secondary: "Browse the repos",
    },
    footer: {
      tagline:
        "An open toolkit for EPLAN electrical engineers, built on Cloudflare. Drive EPLAN with AI, open projects anywhere, route events to the tools you already run.",
      net: "part of covaga.xyz",
      toolsLabel: "tools",
      codeLabel: "code",
      projectLabel: "project",
      localesLabel: "Available in seven languages",
    },
  },
  a11y: {
    skipToContent: "Skip to content",
    primaryNav: "Primary",
    sectionsNav: "Sections",
    legalNav: "Legal",
    toggleMenu: "Toggle menu",
    languageLabel: "Language",
  },
  banner: {
    message: "This site is available in English.",
    view: "View in English",
    dismiss: "Not now",
  },
  nav: {
    how: "how",
    events: "events",
    pricing: "pricing",
    faq: "faq",
    getStarted: "Get started",
  },
  hero: {
    eyebrowTo: "delivered",
    headingPre: "CAD events, routed",
    leadHtml:
      'Covaga Hub listens for your <strong class="font-semibold text-[var(--color-ink)]">ECAD</strong> exports and delivers them to Teams, SharePoint, Drive or email — credentials stay server-side.',
    ctaPrimary: "Get started",
    ctaSecondary: "See how it works",
    schemaTitle: "Event routing schematic",
    schemaDesc:
      "Wiring schematic: three ECAD event terminals on the left route through the Covaga hub module to SharePoint, Teams, Drive and Email terminals on the right.",
    figCaption: "fig. 01 — event routing schematic",
  },
  problem: {
    eyebrow: "the shift",
    heading: "Integrations without the integration project.",
    todayLabel: "// today",
    withLabel: "// with Covaga Hub",
    today: [
      {
        title: "One-off local macros",
        body: "Custom export scripts commissioned for 200€ to 2,400€ each, living on a single workstation. You own the maintenance forever, and they break when a colleague changes machines.",
      },
      {
        title: "Heavy PLM / ERP connectors",
        body: "Enterprise middleware that is expensive to license and slow to roll out — far more than a small electrical team needs to file a drawing into SharePoint.",
      },
      {
        title: "Credentials on the CAD PC",
        body: "OAuth tokens and API keys sitting in local config files, going stale whenever the provider or a webhook secret rotates.",
      },
    ],
    solution: [
      {
        title: "Configured routes, not code",
        body: "Point an ECAD event at a destination and you're done. Turn a PDF export into a Teams notice or a SharePoint upload in minutes.",
      },
      {
        title: "Credentials held server-side",
        body: "OAuth tokens live encrypted in the hosted router. The open-source client on your PC only sends event data — never secrets.",
      },
      {
        title: "Kept current for you",
        body: "When a provider changes its API, the hosted worker is updated centrally. Nothing to redeploy on your engineering machines.",
      },
    ],
  },
  how: {
    eyebrow: "how it works",
    heading: "Three steps, from CAD event to delivered.",
    steps: [
      {
        title: "An ECAD event fires",
        body: "A PDF export, a BOM export, or a project close happens inside your ECAD tool during normal work — nobody changes how they draw.",
      },
      {
        title: "The open-source client POSTs JSON",
        body: "A lightweight client running alongside your CAD sends a small JSON payload to your private tenant URL. No secrets leave the PC.",
      },
      {
        title: "The router delivers it",
        body: "The hosted worker transforms the event and delivers it to your destination: Teams, SharePoint, Google Drive, email, or any HTTP endpoint.",
      },
    ],
  },
  events: {
    eyebrow: "events · src",
    heading: "What your ECAD can trigger.",
    lead: "Each event maps to a real EPLAN API action — including the ones most integrations never touch.",
    liveLabel: "live",
    soonLabel: "coming soon",
    items: [
      {
        id: "pdf-exported",
        title: "PDF exported",
        body: "Fires when a schematic or documentation PDF is exported from a project.",
        action: "action export · PDF",
        soon: false,
      },
      {
        id: "bom-exported",
        title: "BOM / parts list exported",
        body: "Fires when a bill of materials, parts list or terminal label is exported.",
        action: "action label",
        soon: false,
      },
      {
        id: "dxf-dwg-exported",
        title: "DXF / DWG exported",
        body: "Fires when pages or the project are exported to DXF or DWG for mechanical or client hand-off.",
        action: "action export · DXF/DWG",
        soon: true,
      },
      {
        id: "project-backed-up",
        title: "Project backed up",
        body: "Fires when a project backup (.zw1) is created — ready for off-site archival.",
        action: "action backup",
        soon: true,
      },
      {
        id: "wiring-exported",
        title: "Production wiring exported",
        body: "Fires when production wiring data is exported for the machine build.",
        action: "action ExportProductionWiring",
        soon: true,
      },
      {
        id: "project-closed",
        title: "Project closed",
        body: "Fires when a project is closed — useful for sign-off and archival flows.",
        action: "event lifecycle",
        soon: true,
      },
    ],
    destEyebrow: "destinations · dst",
    destHeading: "Where it goes — tools engineers use.",
    destSoonLabel: "soon",
    destinations: [
      {
        title: "Microsoft Teams",
        body: "Post a message to a channel on every event.",
        soon: false,
      },
      {
        title: "SharePoint",
        body: "File the export into the project's document library.",
        soon: false,
      },
      {
        title: "Google Drive",
        body: "Upload the exported file into a shared folder.",
        soon: false,
      },
      {
        title: "Email",
        body: "Send the export to a distribution list or an inbox.",
        soon: false,
      },
      {
        title: "Network folder",
        body: "Drop the file onto a shared drive via a small agent.",
        soon: false,
      },
      {
        title: "PLM / PDM",
        body: "Check drawings into Vault, SolidWorks PDM or Windchill.",
        soon: true,
      },
    ],
    footnote:
      "No Slack? By design — Covaga Hub speaks the M365 + PLM stack your office already runs. Need something else? A generic HTTP destination forwards the payload anywhere.",
  },
  pricing: {
    eyebrow: "pricing",
    heading: "Open core. Free to run, paid to host.",
    lead: "The client is open source and free forever. The hosted router — managed credentials, retries and history — is what you pay for. Waitlist members help set the final launch pricing.",
    mostPopular: "most popular",
    period: "/mo",
    tiers: [
      {
        name: "Community",
        price: "0€",
        tagline: "Open-source client, one route, self-serve.",
        features: [
          "Open-source client (MIT)",
          "1 event · 1 destination",
          "100 executions / mo",
          "Community support",
        ],
        popular: false,
        cta: "Start free",
      },
      {
        name: "Starter",
        price: "29€",
        tagline: "For a small electrical team.",
        features: [
          "3 events",
          "2 destinations",
          "500 executions / mo",
          "Managed OAuth + retries",
        ],
        popular: false,
        cta: "Choose Starter",
      },
      {
        name: "Pro",
        price: "79€",
        tagline: "For busy engineering offices.",
        features: [
          "Unlimited events",
          "5 destinations",
          "5,000 executions / mo",
          "Execution history + priority support",
        ],
        popular: true,
        cta: "Choose Pro",
      },
    ],
  },
  faq: {
    eyebrow: "faq",
    heading: "Straight answers.",
    items: [
      {
        q: "Which ECAD tools do you support?",
        a: "Covaga Hub is ECAD-agnostic. The open-source client captures events from your CAD tool and POSTs them to your tenant. EPLAN Electric P8 is supported first; the client is designed so other ECAD tools can be added the same way.",
      },
      {
        q: "Does the CAD software need to be open?",
        a: "Yes. The client runs alongside your CAD with an active licence. While it's open, integrations run automatically as you export and close projects. Nothing runs when the software is closed.",
      },
      {
        q: "Is the client really open source?",
        a: "Yes — MIT licensed and fully auditable by your IT team. You can read every line before you install it, and it only sends event data to your own tenant URL. That's the Community tier: free forever.",
      },
      {
        q: "Where do my OAuth tokens live?",
        a: "Encrypted in the hosted router, held server-side. They are never stored on your PC. The client sends event payloads only, so credentials never leave the hosted environment.",
      },
      {
        q: "Why no Slack?",
        a: "Because engineering offices don't run on Slack. Covaga Hub targets the tools you actually use — Microsoft Teams, SharePoint, Drive, email, network folders, and PLM/PDM. A generic HTTP destination covers anything else.",
      },
      {
        q: "Do we have to change how the team works?",
        a: "No. Engineers keep exporting PDFs and BOMs exactly as they do today. Covaga Hub listens for those events and delivers them, so there's no new tool to learn.",
      },
    ],
  },
  signup: {
    metaTitle: "Covaga Hub — Get started",
    metaDescription: "Create your Covaga Hub tenant: connect a Telegram bot and route your ECAD events in minutes.",
    eyebrow: "get started",
    heading: "Create your tenant",
    lead: "Create your tenant with just your email. Connections and event routing are configured afterwards in your dashboard. No credit card.",
    emailLabel: "Work email",
    companyLabel: "Company (optional)",
    submit: "Create tenant",
    submitting: "Creating…",
    errorGeneric: "Something went wrong. Check the fields and try again.",
    successHeading: "Tenant created — save your key",
    successLead: "Save the API key now: it is shown only once. Then set up your first connection from the dashboard.",
    tenantIdLabel: "Tenant ID",
    apiKeyLabel: "API key",
    copy: "copy",
    nextHeading: "Next steps",
    nextSteps: [
      "In the dashboard, open Connections and hook up Telegram, Google Drive or a webhook.",
      "Copy covaga.config to %APPDATA%\\covaga\\ and paste your tenantId and apiKey.",
      "In EPLAN run scripts/CovagaPing.cs, then pick which events to route on the Events page.",
    ],
  },
  footer: {
    tagline:
      "Hosted event routing for engineering offices. Your data moves to the tools you already run; the client stays open source.",
    productLabel: "product",
    legalLabel: "legal",
    privacy: "privacy",
    terms: "terms",
    contact: "contact",
    disclaimer:
      "Covaga Hub is an independent product, not affiliated with or endorsed by EPLAN or any ECAD vendor. All product names are trademarks of their respective owners.",
  },
  legal: {
    back: "back to Covaga Hub",
    lastUpdatedLabel: "last updated",
    draftLabel: "draft",
    updated: "2026-07-05",
    disclaimer:
      "This document is an early draft and does not yet constitute legal advice. Questions?",
    privacy: {
      eyebrow: "legal · privacy",
      title: "Privacy Policy",
      intro:
        "We keep data collection minimal and credentials server-side. Here is exactly what Covaga Hub handles and why.",
      sections: [
        {
          heading: "Who we are",
          body: [
            "Covaga Hub is an independent product that routes ECAD events to the tools engineering teams use. This policy explains what data we handle when you use our website and hosted service.",
          ],
        },
        {
          heading: "What we collect",
          body: [
            "Website: the site is static and uses no advertising or third-party tracking cookies.",
            "Contact: if you email us, we keep your message and address to reply and, where relevant, to follow up about the product.",
            "Hosted service: when your tenant is active, we process the event metadata your open-source client sends (event type, timestamps, file references) to deliver it to the destinations you configure.",
          ],
        },
        {
          heading: "Credentials",
          body: [
            "OAuth tokens and destination secrets are held encrypted, server-side, in the hosted router. They are never stored on your CAD workstation and never shared with third parties beyond the destination you connect.",
          ],
        },
        {
          heading: "Sub-processors",
          body: [
            "The hosted service runs on Cloudflare. Delivery destinations (for example Microsoft 365, Google Drive) receive only the payloads you route to them.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can ask us to access, correct or delete the personal data we hold about you at any time by emailing hello@covaga.dev. We will respond within a reasonable period.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "We may update this policy as the product develops. Material changes will be reflected by the 'last updated' date above.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "legal · terms",
      title: "Terms of Service",
      intro:
        "Plain terms for a small product: run a licensed CAD tool, route data you're allowed to move, keep your own backups.",
      sections: [
        {
          heading: "The service",
          body: [
            "Covaga Hub provides a hosted router that receives ECAD events from an open-source client and delivers them to destinations you configure. The client is MIT licensed; the hosted service is offered under these terms.",
          ],
        },
        {
          heading: "Your responsibilities",
          body: [
            "You are responsible for holding valid licences for the CAD software you run and for the destination accounts you connect. You must only route data you are authorised to move.",
          ],
        },
        {
          heading: "The open-source client",
          body: [
            "The client is provided under the MIT licence, as-is, without warranty. You are free to read, audit, run and modify it within the terms of that licence.",
          ],
        },
        {
          heading: "Availability",
          body: [
            "We aim for reliable delivery but do not guarantee uninterrupted service. Events may be retried on failure; persistent failures are surfaced to you.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "To the extent permitted by law, Covaga Hub is not liable for indirect or consequential loss arising from use of the service. The hosted service moves your files; it is your responsibility to keep independent backups.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "We may update these terms as the product develops. Continued use after a change constitutes acceptance of the updated terms.",
          ],
        },
      ],
    },
  },
};
