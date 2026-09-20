import type { CollectionEntry } from "astro:content";

/**
 * The Programme's ordering rules (CONTEXT.md): which Exhibitions are current,
 * upcoming or past, and how News and Workshops are ordered. Pure: takes
 * entries and a clock and returns values, so it runs in tests.
 *
 * The site is static, so status is decided at build time; a show moves from
 * upcoming to current when the site is next built.
 */

export type Exhibition = CollectionEntry<"exhibitions">;
export type Workshop = CollectionEntry<"workshops">;
export type NewsPost = CollectionEntry<"news">;

export interface ExhibitionsByStatus {
  current: Exhibition[];
  /** Soonest first. */
  upcoming: Exhibition[];
  /** Most recently closed first. */
  past: Exhibition[];
}

/**
 * Calendar day of a date, in UTC. Exhibition dates are stored as calendar
 * days and coerce to UTC midnight, so comparing days (not instants) keeps a
 * show current through the whole of its last day.
 */
const day = (date: Date) => date.toISOString().slice(0, 10);

export function classifyExhibitions(
  exhibitions: Exhibition[],
  now = new Date(),
): ExhibitionsByStatus {
  const today = day(now);
  const starts = (e: Exhibition) => day(e.data.startDate);
  const ends = (e: Exhibition) => day(e.data.endDate);
  return {
    current: exhibitions.filter((e) => starts(e) <= today && today <= ends(e)),
    upcoming: exhibitions
      .filter((e) => today < starts(e))
      .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf()),
    past: exhibitions
      .filter((e) => ends(e) < today)
      .sort((a, b) => b.data.endDate.valueOf() - a.data.endDate.valueOf()),
  };
}

/** Newest first. */
export function sortNews(news: NewsPost[]): NewsPost[] {
  return [...news].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * Workshops carry no date, so they are listed by slug: a stable order that
 * editors can steer by naming, rather than whatever order the loader found
 * the files in.
 */
export function sortWorkshops(workshops: Workshop[]): Workshop[] {
  return [...workshops].sort((a, b) => a.id.localeCompare(b.id));
}
