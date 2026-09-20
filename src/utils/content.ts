import { getCollection, getEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";
import { listArtists, type Artist, type ArtistListing } from "./artists";
import {
  artworksByArtist,
  isCatalogueWork,
  isPrivateCollectionWork,
  presentArtwork,
  presentArtworks,
  relatedArtworks,
  type Artwork,
  type ArtworkPresentation,
} from "./artwork-presentation";
import {
  bodyMarkdown,
  renderMarkdown,
  type BodyCollection,
  type BodySources,
} from "./body";
import type { Picture } from "./images";
import {
  classifyExhibitions,
  sortNews,
  sortWorkshops,
  type ExhibitionsByStatus,
  type Workshop,
} from "./programme";

/**
 * The content module: every question a view asks of the content, answered
 * in domain terms (CONTEXT.md). This is the only module that imports
 * `astro:content`; the rules it applies (which works are in the Catalogue,
 * how Artists are listed, which Exhibitions are current, how a body falls
 * back between locales) live in pure modules beside it and are tested there.
 */

// ---------------------------------------------------------------- singletons

export const getSite = () => getEntry("site", "index").then(required("site"));
export const getHomepage = () =>
  getEntry("homepage", "index").then(required("homepage"));
export const getAboutPage = () =>
  getEntry("about", "index").then(required("about"));

/** A standalone page (terms, privacy policy) by its id in `src/content/pages/`. */
export const getPage = (id: string) =>
  getEntry("pages", id).then(required(`pages/${id}`));

function required<T>(name: string) {
  return (entry: T | undefined): T => {
    if (!entry)
      throw new Error(`Missing content: src/content/${name}/index.json`);
    return entry;
  };
}

// ---------------------------------------------------------------- catalogue

/** Every Artist, alphabetical, Estates listed separately. */
export async function getArtists(): Promise<ArtistListing> {
  return listArtists(await getCollection("artists"));
}

/** The works one section holds, presented for a locale. */
async function presentSection(
  inSection: (artwork: Artwork) => boolean,
  locale: Locale,
) {
  const [artworks, artists] = await Promise.all([
    getCollection("artworks"),
    getCollection("artists"),
  ]);
  return presentArtworks(artworks.filter(inSection), artists, locale);
}

/** The Catalogue, presented for a locale. */
export const getCatalogue = (locale: Locale) =>
  presentSection(isCatalogueWork, locale);

/** The Private Collection, presented for a locale. */
export const getPrivateCollection = (locale: Locale) =>
  presentSection(isPrivateCollectionWork, locale);

/** Every work by an artist, whichever section it is in, presented. */
export async function getArtistWorks(artist: Artist, locale: Locale) {
  return presentArtworks(
    artworksByArtist(await getCollection("artworks"), artist),
    [artist],
    locale,
  );
}

/** One artwork's presentation for a locale (resolves its artist). */
export async function getArtworkPresentation(artwork: Artwork, locale: Locale) {
  return presentArtwork(artwork, await getCollection("artists"), locale);
}

/** The artist's other works, whichever section they are in. */
export async function getRelatedArtworks(presentation: ArtworkPresentation) {
  return relatedArtworks(presentation, await getCollection("artworks"));
}

export interface FeaturedArtwork {
  presentation: ArtworkPresentation;
  /** Always present: a featured work without an image fails the build. */
  image: Picture;
  /** The editor's caption, falling back to the title. */
  caption: string;
}

/**
 * The Artworks featured on the homepage, in the editor's order. Featuring a
 * work that does not exist, is in the Private Collection or has no image is
 * a content error and fails the build rather than silently dropping it.
 */
export async function getFeaturedArtworks(
  locale: Locale,
): Promise<FeaturedArtwork[]> {
  const [homepage, artworks, artists] = await Promise.all([
    getHomepage(),
    getCollection("artworks"),
    getCollection("artists"),
  ]);
  return homepage.data.collection.map((item) => {
    const artwork = artworks.find((a) => a.id === item.artwork.id);
    if (!artwork) {
      throw new Error(
        `Homepage features artwork "${item.artwork.id}", which does not exist in src/content/artworks/.`,
      );
    }
    const presentation = presentArtwork(artwork, artists, locale);
    if (presentation.section !== "artworks") {
      throw new Error(
        `Homepage features "${artwork.id}", which is in the Private Collection. Feature a Catalogue work or change its availability.`,
      );
    }
    if (!presentation.image) {
      throw new Error(
        `Homepage features "${artwork.id}", which has no image. Add one or feature another work.`,
      );
    }
    return {
      presentation,
      image: presentation.image,
      caption: text(item.caption, locale) || presentation.title,
    };
  });
}

// ---------------------------------------------------------------- programme

export interface Events {
  exhibitions: ExhibitionsByStatus;
  workshops: Workshop[];
}

/** Exhibitions by status as of `now` (build time), and every Workshop. */
export async function getEvents(now = new Date()): Promise<Events> {
  const [exhibitions, workshops] = await Promise.all([
    getCollection("exhibitions"),
    getCollection("workshops"),
  ]);
  return {
    exhibitions: classifyExhibitions(exhibitions, now),
    workshops: sortWorkshops(workshops),
  };
}

/** Every News post, newest first. */
export async function getNews() {
  return sortNews(await getCollection("news"));
}

// ---------------------------------------------------------------- bodies

/** Raw Markdown bodies of every directory-style entry, keyed by path from the project root. */
const bodies: BodySources = import.meta.glob<string>(
  "/src/content/*/*/*/*.md",
  { query: "?raw", import: "default", eager: true },
);

/** The Markdown source of an entry's body for a locale, falling back to the default locale. */
export function getBodyMarkdown(
  collection: BodyCollection,
  id: string,
  locale: Locale,
): string {
  return bodyMarkdown(bodies, collection, id, locale);
}

/** Render an entry's localised body to HTML. */
export function renderBody(
  collection: BodyCollection,
  id: string,
  locale: Locale,
): Promise<string> {
  return renderMarkdown(getBodyMarkdown(collection, id, locale));
}

// ---------------------------------------------------------------- static paths

/**
 * The `getStaticPaths` implementations the thin route files in `src/pages/`
 * re-export. They pick entries with the same rules as the queries above and
 * build params from entry ids, which `routes.*` turn back into hrefs; both
 * sides of a dynamic route therefore agree by construction.
 */

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
