// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// Static output, Cloudflare Pages ready. No SSR adapter.
export default defineConfig({
  output: "static",
  site: "https://byndr.pages.dev",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
