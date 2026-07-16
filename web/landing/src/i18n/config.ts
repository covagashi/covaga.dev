// Locale registry + URL helpers for the Covaga landing site.
// English is the default and lives at the site root (no prefix); every other
// locale is served under its own path prefix (/es/, /de/, /zh-cn/, ...).

export const defaultLocale = "en" as const;

// Ordered list of supported locales. Keep in sync with astro.config.mjs `i18n.locales`.
export const locales = ["en", "es", "de", "pt", "ja", "ko", "zh-cn"] as const;

export type Locale = (typeof locales)[number];

// Human-readable names shown in the language switcher (endonyms).
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  ja: "日本語",
  ko: "한국어",
  "zh-cn": "简体中文",
};

// Short labels for the compact switcher chip.
export const localeShort: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  de: "DE",
  pt: "PT",
  ja: "JA",
  ko: "KO",
  "zh-cn": "ZH",
};

// BCP-47 tags for <html lang> and hreflang alternates.
export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  es: "es",
  de: "de",
  pt: "pt",
  ja: "ja",
  ko: "ko",
  "zh-cn": "zh-CN",
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

// Resolve the active locale from the request URL. The first path segment is a
// locale prefix for non-default locales; otherwise we're on the default locale.
export function getLocaleFromUrl(url: URL): Locale {
  const segment = url.pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : defaultLocale;
}

// Build a path for `path` (e.g. "/", "/privacy") in the given locale.
// The default locale is un-prefixed; others get a `/<locale>` prefix.
export function localizePath(path: string, locale: Locale): string {
  const clean = "/" + path.replace(/^\/+/, "");
  if (locale === defaultLocale) return clean === "/" ? "/" : clean;
  return clean === "/" ? `/${locale}/` : `/${locale}${clean}`;
}

// Strip the locale prefix from a pathname, returning the locale-agnostic route
// (always starts with "/"). Used by the switcher to preserve the current page.
export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  return "/" + parts.join("/");
}
