// Shape of the fully-translated site content for a single locale.
// Every locale file (src/i18n/locales/*.ts) must satisfy `SiteContent`.

export interface TitleBody {
  title: string;
  body: string;
}

export interface EventItem {
  /** Stable code identifier — NOT translated. */
  id: string;
  title: string;
  body: string;
  /** Technical EPLAN action label — NOT translated. */
  action: string;
  soon: boolean;
}

export interface DestinationItem {
  title: string;
  body: string;
  soon: boolean;
}

export interface PricingTier {
  /** Brand tier name — NOT translated. */
  name: string;
  /** Price with currency — NOT translated. */
  price: string;
  tagline: string;
  features: string[];
  popular: boolean;
  cta: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}

/** One spec chip: a translated-ish label and a technical value (value NOT translated). */
export interface SpecChip {
  label: string;
  value: string;
}

/** A link on a tool module. `label` and `href` are NOT translated (technical). */
export interface ToolLink {
  label: string;
  href: string;
}

/** One of the three tools presented on the umbrella landing. */
export interface ToolModule {
  /** Mono designator, e.g. "U1 · MCP" — NOT translated. */
  ref: string;
  /** Tool name / repo slug — NOT translated. */
  name: string;
  /** Short benefit line — translated. */
  what: string;
  /** One-paragraph description — translated. */
  body: string;
  /** Technical spec chips — values NOT translated. */
  chips: SpecChip[];
  /** Availability label — translated (e.g. "open source"). */
  status: string;
  /** Status style selector — NOT translated. */
  statusKind: "oss" | "hosted";
  /** Outbound links (GitHub, subdomain) — NOT translated. */
  links: ToolLink[];
  /** When true, the module is stroked in the accent colour (the platform). */
  primary: boolean;
}

/** The umbrella landing (covaga.dev root) that presents all three tools. */
export interface UmbrellaContent {
  nav: {
    tools: string;
    open: string;
    getHub: string;
  };
  hero: {
    eyebrow: string;
    /** Heading; the trailing period is rendered as the accent by the component. */
    heading: string;
    /** Lead paragraph, may contain an inline <strong> — rendered as HTML. */
    leadHtml: string;
    ctaPrimary: string;
    ctaSecondary: string;
    /** Technical spec chips under the hero — values NOT translated. */
    specChips: SpecChip[];
    schemaTitle: string;
    schemaDesc: string;
    figCaption: string;
    /** Short mono caption on the right of the figure — NOT translated. */
    figFlow: string;
  };
  tools: {
    eyebrow: string;
    heading: string;
    lead: string;
    statusOssLabel: string;
    statusHostedLabel: string;
    items: ToolModule[];
  };
  principles: {
    eyebrow: string;
    heading: string;
    items: TitleBody[];
  };
  cta: {
    eyebrow: string;
    heading: string;
    primary: string;
    secondary: string;
  };
  footer: {
    tagline: string;
    net: string;
    toolsLabel: string;
    codeLabel: string;
    projectLabel: string;
    localesLabel: string;
  };
}

export interface SiteContent {
  meta: {
    homeTitle: string;
    homeDescription: string;
    /** Umbrella (covaga.dev root) page title + description. */
    umbrellaTitle: string;
    umbrellaDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    termsTitle: string;
    termsDescription: string;
  };
  /** Umbrella landing content (covaga.dev root). */
  umbrella: UmbrellaContent;
  a11y: {
    skipToContent: string;
    primaryNav: string;
    sectionsNav: string;
    legalNav: string;
    toggleMenu: string;
    languageLabel: string;
  };
  banner: {
    /** Shown in the DETECTED language, offering to switch to it. */
    message: string;
    view: string;
    dismiss: string;
  };
  nav: {
    how: string;
    events: string;
    pricing: string;
    faq: string;
    getStarted: string;
  };
  hero: {
    eyebrowTo: string;
    headingPre: string;
    /** Lead paragraph; contains an inline <strong>ECAD</strong> — rendered as HTML. */
    leadHtml: string;
    ctaPrimary: string;
    ctaSecondary: string;
    schemaTitle: string;
    schemaDesc: string;
    figCaption: string;
  };
  problem: {
    eyebrow: string;
    heading: string;
    todayLabel: string;
    withLabel: string;
    today: TitleBody[];
    solution: TitleBody[];
  };
  how: {
    eyebrow: string;
    heading: string;
    steps: TitleBody[];
  };
  events: {
    eyebrow: string;
    heading: string;
    lead: string;
    liveLabel: string;
    soonLabel: string;
    items: EventItem[];
    destEyebrow: string;
    destHeading: string;
    destSoonLabel: string;
    destinations: DestinationItem[];
    footnote: string;
  };
  pricing: {
    eyebrow: string;
    heading: string;
    lead: string;
    mostPopular: string;
    period: string;
    tiers: PricingTier[];
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: FaqItem[];
  };
  signup: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    heading: string;
    lead: string;
    emailLabel: string;
    companyLabel: string;
    submit: string;
    submitting: string;
    errorGeneric: string;
    successHeading: string;
    successLead: string;
    /** UI labels for the credentials block — ids themselves are NOT translated. */
    tenantIdLabel: string;
    apiKeyLabel: string;
    copy: string;
    nextHeading: string;
    nextSteps: string[];
  };
  footer: {
    tagline: string;
    productLabel: string;
    legalLabel: string;
    privacy: string;
    terms: string;
    contact: string;
    disclaimer: string;
  };
  legal: {
    back: string;
    lastUpdatedLabel: string;
    draftLabel: string;
    updated: string;
    disclaimer: string;
    privacy: LegalDoc;
    terms: LegalDoc;
  };
}
