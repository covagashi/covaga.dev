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

export interface SiteContent {
  meta: {
    homeTitle: string;
    homeDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    termsTitle: string;
    termsDescription: string;
  };
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
