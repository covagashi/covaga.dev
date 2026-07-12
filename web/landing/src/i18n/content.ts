import type { SiteContent } from "./types";
import type { Locale } from "./config";
import { defaultLocale } from "./config";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { zhCn } from "./locales/zh-cn";

export const content: Record<Locale, SiteContent> = {
  en,
  es,
  de,
  pt,
  ja,
  ko,
  "zh-cn": zhCn,
};

// Return the content bundle for a locale, falling back to the default locale.
export function useContent(locale: Locale): SiteContent {
  return content[locale] ?? content[defaultLocale];
}
