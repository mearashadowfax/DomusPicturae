/**
 * Locale configuration.
 *
 * This is the single source of truth for which languages the site is published
 * in. `astro.config.mjs`, the content schemas, the Keystatic admin and every
 * component read from here. To add a locale: add it to `locales`, give it a
 * label and a language tag, add its UI strings in `ui.ts`, then add a
 * `src/pages/<locale>/` route folder (see docs/i18n.md).
 */
export const locales = ["en", "fr", "de"] as const;

export type Locale = (typeof locales)[number];

/** Served without a URL prefix. Every other locale lives under `/<locale>/`. */
export const defaultLocale: Locale = "en";

/** Short labels shown in the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  de: "DE",
};

/** BCP 47 tags used for `<html lang>`, `hreflang` and structured data. */
export const localeTags: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

/** Narrow an arbitrary value (typically `Astro.currentLocale`) to a Locale. */
export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/**
 * Prefix a site-relative path with the locale segment when needed.
 * `localizePath("fr", "/artists")` → `/fr/artists`; `localizePath("en", "/artists")` → `/artists`.
 */
export function localizePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip a leading locale segment from a pathname. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) segments.shift();
  return `/${segments.join("/")}`;
}

/** Read the locale from a pathname (`/fr/about` → `fr`, `/about` → default). */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}
