import { getCollection, getEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { presentArtistListing, type Artist } from "./artists";
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
  splitClosingParagraph,
  type BodyCollection,
  type BodySources,
} from "./body";
import { presentHomepage, type Homepage } from "./homepage";
import { presentSite, type SiteIdentity } from "./site";
import {
  presentExhibitions,
  presentNews,
  presentWorkshop,
  sortNews,
  sortWorkshops,
  type ExhibitionPresentation,
  type ExhibitionsByStatus,
  type WorkshopPresentation,
} from "./programme";

/**
 * The content module: every question a view asks of the content, answered
 * in domain terms (CONTEXT.md). This is the only module that imports
 * `astro:content`; the rules it applies (which works are in the Catalogue,
 * how Artists are listed, which Exhibitions are current, how a body falls
 * back between locales) live in pure modules beside it and are tested there.
 */

// ---------------------------------------------------------------- singletons

const getSite = () => getEntry("site", "index").then(required("site"));

/** The gallery's name, wordmarks and contact details, for a locale. */
export const getSiteIdentity = async (locale: Locale): Promise<SiteIdentity> =>
  presentSite(await getSite(), locale);
const getHomepage = () =>
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

/** Every Artist, alphabetical, Estates listed separately, presented for a locale. */
export async function getArtists(locale: Locale) {
  return presentArtistListing(await getCollection("artists"), locale);
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
  const [artworks, artists] = await Promise.all([
    getCollection("artworks"),
    getCollection("artists"),
  ]);
  return relatedArtworks(presentation, artworks, artists);
}

/** The homepage, every section's slice, for a locale. */
export async function getHomepageModel(locale: Locale): Promise<Homepage> {
  const [homepage, artworks, artists, workshops, news] = await Promise.all([
    getHomepage(),
    getCollection("artworks"),
    getCollection("artists"),
    getCollection("workshops"),
    getCollection("news"),
  ]);
  return presentHomepage(
    { homepage, artworks, artists, workshops, news },
    locale,
  );
}

// ---------------------------------------------------------------- programme

export interface Events {
  exhibitions: ExhibitionsByStatus<ExhibitionPresentation>;
  workshops: WorkshopPresentation[];
}

/** Exhibitions by status as of `now` (build time), and every Workshop, presented. */
export async function getEvents(
  locale: Locale,
  now = new Date(),
): Promise<Events> {
  const [exhibitions, workshops] = await Promise.all([
    getCollection("exhibitions"),
    getCollection("workshops"),
  ]);
  return {
    exhibitions: presentExhibitions(exhibitions, locale, now),
    workshops: sortWorkshops(workshops).map((w) => presentWorkshop(w, locale)),
  };
}

/** Every News post, newest first, presented. */
export async function getNews(locale: Locale) {
  return sortNews(await getCollection("news")).map((post) =>
    presentNews(post, locale),
  );
}

// ---------------------------------------------------------------- bodies

/** Raw Markdown bodies of every directory-style entry, keyed by path from the project root. */
const bodies: BodySources = import.meta.glob<string>(
  "/src/content/*/*/*/*.md",
  { query: "?raw", import: "default", eager: true },
);

export interface RenderedBody {
  main: string;
  /** The closing paragraph on its own, when asked for and the body has one; else null. */
  closing: string | null;
}

/**
 * Render an entry's localised body to HTML, falling back to the default
 * locale. With `splitClosing`, the last paragraph is rendered separately so
 * a page can place something (a slideshow) before it.
 */
export async function renderBody(
  collection: BodyCollection,
  id: string,
  locale: Locale,
  { splitClosing = false }: { splitClosing?: boolean } = {},
): Promise<RenderedBody> {
  const source = bodyMarkdown(bodies, collection, id, locale);
  if (!splitClosing)
    return { main: await renderMarkdown(source), closing: null };
  const { main, closing } = splitClosingParagraph(source);
  return {
    main: await renderMarkdown(main),
    closing: closing ? await renderMarkdown(closing) : null,
  };
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
