import { getCollection, type CollectionEntry } from "astro:content";
import { localizePath, type Locale } from "@/i18n/config";
import { ui } from "@/i18n/ui";
import {
  isCatalogueWork,
  isPrivateCollectionWork,
  sectionFor,
} from "@utils/availability";

/**
 * The site's URL structure, in one place.
 *
 * `routes.*` build localised hrefs; the `*Paths` helpers are the
 * `getStaticPaths` implementations the thin route files in `src/pages/`
 * re-export. Both sides of a dynamic route (its params and the links to it)
 * therefore agree by construction. Route files themselves stay where Astro
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

// ---------------------------------------------------------------- static paths

export async function artworkPaths() {
  return (await getCollection("artworks"))
    .filter(isCatalogueWork)
    .map((artwork) => ({ params: { id: artwork.id }, props: { artwork } }));
}

export async function privateCollectionPaths() {
  return (await getCollection("artworks"))
    .filter(isPrivateCollectionWork)
    .map((artwork) => ({ params: { id: artwork.id }, props: { artwork } }));
}

export async function artistPaths() {
  return (await getCollection("artists")).map((artist) => ({
    params: { id: artist.id },
    props: { artist },
  }));
}

export async function newsPaths() {
  return (await getCollection("news")).map((article) => ({
    params: { slug: article.id },
    props: { article },
  }));
}

export async function exhibitionPaths() {
  return (await getCollection("exhibitions")).map((exhibition) => ({
    params: { slug: exhibition.id },
    props: { exhibition },
  }));
}

export async function workshopPaths() {
  return (await getCollection("workshops")).map((workshop) => ({
    params: { slug: workshop.id },
    props: { workshop },
  }));
}
