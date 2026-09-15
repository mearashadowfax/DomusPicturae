import socialImageSrc from "@images/social.png";

/**
 * Build-time site constants. Everything editorial (gallery name, contact
 * details, social links) lives in the `site` singleton (`src/content/site/`)
 * and is edited through Keystatic; only values the build itself needs are here.
 */
export const SITE = {
  /** Canonical origin; must match `site` in astro.config.mjs. */
  url: "https://domus-picturae.vercel.app/",
  /** Default social sharing image. */
  socialImage: socialImageSrc,
  /** Theme colour reported to browsers and PWA manifests. */
  themeColor: "#ddd0c8",
} as const;

/** How many workshops and news items the homepage shows. */
export const HOMEPAGE_ITEMS_LIMIT = 3;
