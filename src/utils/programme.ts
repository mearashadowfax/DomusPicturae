import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";
import { routes } from "@/routes";
import { picture, pictures, type Picture } from "./images";
import { formatDate, getYear } from "./utils";

/**
 * The Programme's rules (CONTEXT.md): which Exhibitions are current,
 * upcoming or past, how News and Workshops are ordered, and everything a
 * card or detail page shows of each, resolved for a locale. Pure: takes
 * entries and a clock and returns values, so it runs in tests.
 *
 * The site is static, so status is decided at build time; a show moves from
 * upcoming to current when the site is next built.
 */

export type Exhibition = CollectionEntry<"exhibitions">;
export type Workshop = CollectionEntry<"workshops">;
export type NewsPost = CollectionEntry<"news">;

export type ExhibitionStatus = "current" | "upcoming" | "past";

export interface ExhibitionsByStatus<E = Exhibition> {
  current: E[];
  /** Soonest first. */
  upcoming: E[];
  /** Most recently closed first. */
  past: E[];
}

/**
 * Calendar day of a date, in UTC. Exhibition dates are stored as calendar
 * days and coerce to UTC midnight, so comparing days (not instants) keeps a
 * show current through the whole of its last day.
 */
const day = (date: Date) => date.toISOString().slice(0, 10);

export function exhibitionStatus(
  exhibition: Exhibition,
  now = new Date(),
): ExhibitionStatus {
  const today = day(now);
  if (today < day(exhibition.data.startDate)) return "upcoming";
  if (day(exhibition.data.endDate) < today) return "past";
  return "current";
}

export function classifyExhibitions(
  exhibitions: Exhibition[],
  now = new Date(),
): ExhibitionsByStatus {
  const withStatus = (status: ExhibitionStatus) =>
    exhibitions.filter((e) => exhibitionStatus(e, now) === status);
  return {
    current: withStatus("current"),
    upcoming: withStatus("upcoming").sort(
      (a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf(),
    ),
    past: withStatus("past").sort(
      (a, b) => b.data.endDate.valueOf() - a.data.endDate.valueOf(),
    ),
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

// ---------------------------------------------------------------- presentations

export interface ExhibitionPresentation {
  id: string;
  href: string;
  status: ExhibitionStatus;
  /** Localised, falling back to the default locale. */
  title: string;
  description: string;
  /** The dates as the editor wrote them. */
  timeline: string;
  /** What a listing shows: the year once the show has closed, the timeline before. */
  dateline: string;
  location: string;
  admission: string;
  openingHours: { day: string; hours: string }[];
  startDate: Date;
  endDate: Date;
  /** The image with its alt text (the title when none is set), or null. */
  image: Picture | null;
}

export function presentExhibition(
  exhibition: Exhibition,
  locale: Locale,
  now = new Date(),
): ExhibitionPresentation {
  const { data } = exhibition;
  const title = text(data.title, locale);
  const status = exhibitionStatus(exhibition, now);
  const timeline = text(data.timeline, locale);
  return {
    id: exhibition.id,
    href: routes.exhibition(locale, exhibition),
    status,
    title,
    description: text(data.description, locale),
    timeline,
    dateline: status === "past" ? String(getYear(data.startDate)) : timeline,
    location: text(data.location, locale),
    admission: text(data.admission, locale),
    openingHours: data.openingHours.map((item) => ({
      day: text(item.day, locale),
      hours: item.hours ?? "",
    })),
    startDate: data.startDate,
    endDate: data.endDate,
    image: picture(data, locale, title),
  };
}

/** Exhibitions by status as of `now`, presented for a locale. */
export function presentExhibitions(
  exhibitions: Exhibition[],
  locale: Locale,
  now = new Date(),
): ExhibitionsByStatus<ExhibitionPresentation> {
  const { current, upcoming, past } = classifyExhibitions(exhibitions, now);
  const present = (e: Exhibition) => presentExhibition(e, locale, now);
  return {
    current: current.map(present),
    upcoming: upcoming.map(present),
    past: past.map(present),
  };
}

export interface WorkshopPresentation {
  id: string;
  href: string;
  title: string;
  registerTitle: string;
  registerInfo: string;
  /** Path to the preview video in `public/`, or null. */
  video: string | null;
  image: Picture | null;
}

export function presentWorkshop(
  workshop: Workshop,
  locale: Locale,
): WorkshopPresentation {
  const { data } = workshop;
  const title = text(data.title, locale);
  return {
    id: workshop.id,
    href: routes.workshop(locale, workshop),
    title,
    registerTitle: text(data.registerTitle, locale),
    registerInfo: text(data.registerInfo, locale),
    video: data.video || null,
    image: picture(data, locale, title),
  };
}

export interface NewsSlide {
  image: ImageMetadata;
  alt: string;
  caption: string;
}

export interface NewsPresentation {
  id: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  /** The date as the site prints it, in the locale's conventions. */
  dateLabel: string;
  /** The featured image with its alt text (the title when none is set), or null. */
  image: Picture | null;
  slides: NewsSlide[];
}

export function presentNews(post: NewsPost, locale: Locale): NewsPresentation {
  const { data } = post;
  const title = text(data.title, locale);
  return {
    id: post.id,
    href: routes.article(locale, post),
    title,
    description: text(data.description, locale),
    date: data.pubDate,
    dateLabel: formatDate(data.pubDate, locale),
    image: picture(
      { image: data.featuredImage, imageAlt: data.featuredImageAlt },
      locale,
      title,
    ),
    slides: pictures(data.slides, locale).map((slide) => ({
      image: slide.src,
      alt: slide.alt,
      caption: text(slide.source.caption, locale),
    })),
  };
}
