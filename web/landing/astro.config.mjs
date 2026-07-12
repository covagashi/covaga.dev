// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// Static output, Cloudflare Pages ready. No SSR adapter.
export default defineConfig({
  output: "static",
  site: "https://byndr.dev",
  // English stays at the root (/); other locales are prefixed (/es/, /de/, ...).
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "de", "pt", "ja", "ko", "zh-cn"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap({ i18n: {
    defaultLocale: "en",
    locales: {
      en: "en",
      es: "es",
      de: "de",
      pt: "pt",
      ja: "ja",
      ko: "ko",
      "zh-cn": "zh-CN",
    },
  } })],
  vite: {
    plugins: [tailwindcss()],
  },
});
