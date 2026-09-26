import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";

/**
 * The gallery's identity as the page chrome shows it: name and wordmarks,
 * localised tagline and description, and contact details as ready-made
 * links, resolved from the `site` singleton for a locale. Pure: takes the
 * entry and returns a value, so it runs in tests.
 */

export type Site = CollectionEntry<"site">;

export interface ContactLink {
  /** As the editor wrote it. */
  label: string;
  href: string;
}

export interface SiteIdentity {
  name: string;
  wordmarks: Wordmarks;
  /** Localised, falling back to the default locale. */
  tagline: string;
  /** The default meta description, localised. */
  description: string;
  addressLines: string[];
  phone: ContactLink | null;
  email: ContactLink | null;
  /** A mailto link with the subject filled in, or null when no email is set. */
  inquiryHref: (subject: string) => string | null;
  social: { x: string | null; instagram: string | null };
  showreelHref: string | null;
  credit: { name: string; href: string | undefined } | null;
}

export interface Wordmarks {
  first: string;
  last: string;
}

/**
 * The two halves of the gallery name used as wordmarks: the hero and the
 * viewing room show the last word, the footer the first, so a two-word name
 * reads across the page. A one-word name is both.
 */
export function wordmarks(name: string): Wordmarks {
  const words = name.trim().split(/\s+/);
  return { first: words[0] ?? "", last: words[words.length - 1] ?? "" };
}

export function presentSite(site: Site, locale: Locale): SiteIdentity {
  const { data } = site;
  const email = data.email || null;
  return {
    name: data.name,
    wordmarks: wordmarks(data.name),
    tagline: text(data.tagline, locale),
    description: text(data.description, locale),
    addressLines: data.address.split("\n"),
    phone: data.phone
      ? { label: data.phone, href: `tel:${data.phone.replace(/\s+/g, "")}` }
      : null,
    email: email ? { label: email, href: `mailto:${email}` } : null,
    inquiryHref: (subject) =>
      email ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : null,
    social: {
      x: data.social.x || null,
      instagram: data.social.instagram || null,
    },
    showreelHref: data.showreelLink || null,
    credit: data.creditName
      ? { name: data.creditName, href: data.creditUrl || undefined }
      : null,
  };
}
