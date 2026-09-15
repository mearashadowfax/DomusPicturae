// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import { defaultLocale, locales } from "./src/i18n/config.ts";

/**
 * The site builds fully static. Keystatic's admin needs server routes, so it
 * is only included when running `astro dev`; `astro build` leaves it out. To
 * run the admin in production, add an SSR adapter and switch Keystatic to
 * `github` storage — see docs/deployment.md. Set SKIP_KEYSTATIC=1 to leave it
 * out of dev as well.
 */
const includeKeystatic =
  process.argv.includes("dev") && !process.env.SKIP_KEYSTATIC;

// https://astro.build/config
export default defineConfig({
  site: "https://domus-picturae.vercel.app",
  output: "static",
  trailingSlash: "never",

  build: {
    // Every page's CSS is a few KB; inlining it removes the render-blocking
    // stylesheet requests (the CSP already allows inline styles).
    inlineStylesheets: "always",
  },

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Baskervville",
      cssVariable: "--font-baskervville",
      styles: ["normal"],
      weights: [300, 400, 900],
      fallbacks: ["serif"],
    },
    {
      provider: fontProviders.fontshare(),
      name: "Satoshi",
      cssVariable: "--font-satoshi",
      styles: ["normal"],
      weights: [300, 400, 500, 600, 900],
      fallbacks: ["sans-serif"],
    },
  ],

  experimental: {
    clientPrerender: true,
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((locale) => [locale, locale])),
      },
    }),
    react(),
    ...(includeKeystatic ? [keystatic()] : []),
  ],
});
