import type { CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "@/i18n/config";
import { ui } from "@/i18n/ui";
import { sectionFor } from "@utils/availability";

/**
 * The site's URL structure, in one place: `routes.*` build every localised
 * href from an entry or its id. Pure, so it runs in tests. The matching
 * `getStaticPaths` implementations (`artworkPaths` and friends) live in the
 * content module, `src/utils/content.ts`, since they read the collections;
 * both build params and hrefs from entry ids, so the two sides of a dynamic
 * route agree by construction. Route files themselves stay where Astro
 * expects them (ADR-0002); only the strings they share live here.
 */

type Artwork = CollectionEntry<"artworks">;
type Artist = CollectionEntry<"artists">;
type Exhibition = CollectionEntry<"exhibitions">;
type Workshop = CollectionEntry<"workshops">;
type Article = CollectionEntry<"news">;

const withId = (entry: { id: string } | string) =>
  typeof entry === "string" ? entry : entry.id;

export const routes = {
  home: (locale: Locale) => localizePath(locale, "/"),
  artworks: (locale: Locale) => localizePath(locale, "/artworks"),
  viewingRoom: (locale: Locale) => localizePath(locale, "/viewing-room"),
  privateCollection: (locale: Locale) =>
    localizePath(locale, "/private-collection"),
  artists: (locale: Locale) => localizePath(locale, "/artists"),
  events: (locale: Locale) => localizePath(locale, "/events"),
  news: (locale: Locale) => localizePath(locale, "/news"),
  about: (locale: Locale) => localizePath(locale, "/about"),
  terms: (locale: Locale) => localizePath(locale, "/terms"),
  privacy: (locale: Locale) => localizePath(locale, "/privacy-policy"),

  /** Detail page of an artwork; the section follows its Availability. */
  artwork: (locale: Locale, artwork: Artwork) =>
    localizePath(
      locale,
      `/${sectionFor(artwork.data.availability)}/${artwork.id}`,
    ),
  artist: (locale: Locale, artist: Artist | string) =>
    localizePath(locale, `/artists/${withId(artist)}`),
  exhibition: (locale: Locale, exhibition: Exhibition | string) =>
    localizePath(locale, `/exhibitions/${withId(exhibition)}`),
  workshop: (locale: Locale, workshop: Workshop | string) =>
    localizePath(locale, `/workshops/${withId(workshop)}`),
  article: (locale: Locale, article: Article | string) =>
    localizePath(locale, `/news/${withId(article)}`),
  /** An artist's CV, served straight from `public/cv/`. Not localised. */
  cv: (artist: Artist | string) => `/cv/${withId(artist)}.pdf`,
};

// ---------------------------------------------------------------- navigation

export interface NavLink {
  label: string;
  href: string;
}

/** Ordered entries of the menu; labels come from `ui.nav`. */
const mainNavigation = [
  "home",
  "artworks",
  "artists",
  "events",
  "news",
  "about",
] as const;
/** Ordered entries of the footer; labels come from `ui.footer`. */
const footerNavigation = ["terms", "privacy"] as const;

export function getMainNavigation(locale: Locale): NavLink[] {
  return mainNavigation.map((key) => ({
    label: ui[locale].nav[key],
    href: routes[key](locale),
  }));
}

export function getFooterNavigation(locale: Locale): NavLink[] {
  return footerNavigation.map((key) => ({
    label: ui[locale].footer[key],
    href: routes[key](locale),
  }));
}
