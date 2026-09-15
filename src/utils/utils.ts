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

export function getYear(date: Date): number {
  return date.getFullYear();
}
