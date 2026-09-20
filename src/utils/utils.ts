import { localeTags, type Locale } from "@/i18n/config";

/** Format a date as `dd.mm.yy` in the locale's conventions. */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, ".");
}

/**
 * The two halves of the gallery name used as wordmarks: the hero and the
 * viewing room show the last word, the footer the first, so a two-word name
 * reads across the page. A one-word name is both.
 */
export function wordmarks(name: string): { first: string; last: string } {
  const words = name.trim().split(/\s+/);
  return { first: words[0] ?? "", last: words[words.length - 1] ?? "" };
}

export function getYear(date: Date): number {
  return date.getFullYear();
}
