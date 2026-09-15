import {
  getCollection,
  getEntry,
  type CollectionEntry,
  type CollectionKey,
} from "astro:content";
import { marked } from "marked";
import { defaultLocale, type Locale } from "@/i18n/config";
import {
  isCatalogueWork,
  isPrivateCollectionWork,
  presentArtwork,
  presentArtworks,
  relatedArtworks,
  type Artist,
  type Artwork,
  type ArtworkPresentation,
} from "./artwork-presentation";

/**
 * Helpers for reading content collections. Views call these instead of
 * filtering `getCollection` results themselves so the rules (what counts as a
 * catalogue work, how bodies are localised) live in one place.
 */

// ---------------------------------------------------------------- singletons

export const getSite = () => getEntry("site", "index").then(required("site"));
export const getHomepage = () =>
  getEntry("homepage", "index").then(required("homepage"));
export const getAboutPage = () =>
  getEntry("about", "index").then(required("about"));

function required<T>(name: string) {
  return (entry: T | undefined): T => {
    if (!entry)
      throw new Error(`Missing content: src/content/${name}/index.json`);
    return entry;
  };
}

// ---------------------------------------------------------------- catalogue

export {
  isCatalogueWork,
  isPrivateCollectionWork,
  presentArtwork,
  presentArtworks,
  relatedArtworks,
  type Artist,
  type Artwork,
  type ArtworkPresentation,
} from "./artwork-presentation";

export async function getCatalogue() {
  return (await getCollection("artworks")).filter(isCatalogueWork);
}

export async function getPrivateCollection() {
  return (await getCollection("artworks")).filter(isPrivateCollectionWork);
}

export async function getArtistsSorted() {
  return (await getCollection("artists")).sort((a, b) =>
    a.data.name.localeCompare(b.data.name),
  );
}

export function artworksByArtist(artworks: Artwork[], artist: Artist) {
  return artworks.filter((artwork) => artwork.data.artist.id === artist.id);
}

/** The catalogue, presented for a locale (one artists lookup for the whole list). */
export async function presentCatalogue(locale: Locale) {
  return presentArtworks(
    await getCatalogue(),
    await getCollection("artists"),
    locale,
  );
}

/** One artwork, presented for a locale. */
export async function presentEntry(artwork: Artwork, locale: Locale) {
  return presentArtwork(artwork, await getCollection("artists"), locale);
}

/** The artist's other works, whichever section they are in. */
export async function presentRelated(presentation: ArtworkPresentation) {
  return relatedArtworks(presentation, await getCollection("artworks"));
}

// ---------------------------------------------------------------- programme

export async function getNewsSorted() {
  return (await getCollection("news")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getExhibitionsByStatus(now = new Date()) {
  const exhibitions = await getCollection("exhibitions");
  const current = exhibitions.filter(
    (e) => now >= e.data.startDate && now <= e.data.endDate,
  );
  const upcoming = exhibitions
    .filter((e) => now < e.data.startDate)
    .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf());
  const past = exhibitions
    .filter((e) => now > e.data.endDate)
    .sort((a, b) => b.data.endDate.valueOf() - a.data.endDate.valueOf());
  return { current, upcoming, past };
}

// ---------------------------------------------------------------- bodies

/**
 * Raw Markdown bodies of every directory-style entry, keyed by path:
 * `/src/content/<collection>/<id>/body/<locale>.md`.
 */
const bodies = import.meta.glob<string>("/src/content/**/body/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

type BodyCollection = Extract<
  CollectionKey,
  "news" | "exhibitions" | "workshops" | "pages"
>;

/** The Markdown source of an entry's body for a locale, falling back to the default locale. */
export function getBodyMarkdown(
  collection: BodyCollection,
  id: string,
  locale: Locale,
): string {
  const path = (l: Locale) => `/src/content/${collection}/${id}/body/${l}.md`;
  const source =
    bodies[path(locale)]?.trim() || bodies[path(defaultLocale)]?.trim() || "";
  return source;
}

/** Render an entry's localised body to HTML. */
export async function renderBody(
  collection: BodyCollection,
  id: string,
  locale: Locale,
): Promise<string> {
  return marked.parse(getBodyMarkdown(collection, id, locale));
}

/**
 * Render a body as two parts: everything up to the last paragraph, and the
 * last paragraph on its own. News articles show a slideshow between them.
 */
export async function renderBodySplit(
  collection: BodyCollection,
  id: string,
  locale: Locale,
) {
  const source = getBodyMarkdown(collection, id, locale);
  const paragraphs = source.split(/\n\s*\n/).filter((p) => p.trim());
  if (paragraphs.length < 2) {
    return { main: await marked.parse(source), closing: "" };
  }
  return {
    main: await marked.parse(paragraphs.slice(0, -1).join("\n\n")),
    closing: await marked.parse(paragraphs[paragraphs.length - 1]),
  };
}

/** Split a plain-text field into paragraphs on blank lines. */
export function paragraphs(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
