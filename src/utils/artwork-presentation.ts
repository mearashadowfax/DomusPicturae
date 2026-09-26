import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";
import { routes } from "@/routes";
import { presentArtist, type ArtistPresentation } from "./artists";
import { badgeFor, sectionFor, type Badge, type Section } from "./availability";
import { picture, type Picture } from "./images";

/**
 * Everything a page needs to show an Artwork, decided in one place from its
 * Availability (see CONTEXT.md): which section it belongs to, which theme
 * that section uses, what badge it carries and whether it can be enquired
 * about; plus its localised fields, its artist, the resolved image and its
 * shape, so a card, a slide and the detail page all read the same value.
 * Pure: takes entries and returns a value, so it runs in tests.
 */

export type Artwork = CollectionEntry<"artworks">;
export type Artist = CollectionEntry<"artists">;

export type { Badge, Section } from "./availability";
export { isCatalogueWork, isPrivateCollectionWork } from "./availability";

export interface ArtworkPresentation {
  id: string;
  artist: ArtistPresentation;
  locale: Locale;
  section: Section;
  theme: "light" | "dark";
  /** Localised URL of the detail page. */
  href: string;
  /** Key into `ui.artworks`, or null when no badge is shown. */
  badge: Badge;
  canInquire: boolean;
  /** Localised title, falling back to the default locale. */
  title: string;
  year: number | undefined;
  /** Localised medium. */
  medium: string;
  /** Localised description, or an empty string. */
  description: string;
  /** Not localisable: the same numbers in every locale. */
  dimensions: { width: number; height: number; unit: string };
  /** The artwork's image with its alt text (the title when none is set), or null when it has none. */
  image: Picture | null;
  /** Square works are shown contained rather than cropped. */
  isSquare: boolean;
}

/**
 * Present one artwork. A dangling artist reference is a content error and
 * fails the build rather than rendering "Unknown artist".
 */
export function presentArtwork(
  artwork: Artwork,
  artists: Artist[],
  locale: Locale,
): ArtworkPresentation {
  const artist = artists.find(
    (candidate) => candidate.id === artwork.data.artist.id,
  );
  if (!artist) {
    throw new Error(
      `Artwork "${artwork.id}" references artist "${artwork.data.artist.id}", which does not exist in src/content/artists/.`,
    );
  }
  const { availability, dimensions } = artwork.data;
  const section = sectionFor(availability);
  const title = text(artwork.data.title, locale);
  return {
    id: artwork.id,
    artist: presentArtist(artist, locale),
    locale,
    section,
    theme: section === "private-collection" ? "dark" : "light",
    href: routes.artwork(locale, artwork),
    badge: badgeFor(availability),
    canInquire: availability === "available",
    title,
    year: artwork.data.year ?? undefined,
    medium: text(artwork.data.medium, locale),
    description: text(artwork.data.description, locale),
    dimensions,
    image: picture(artwork.data, locale, title),
    isSquare: dimensions.width === dimensions.height,
  };
}

export function presentArtworks(
  artworks: Artwork[],
  artists: Artist[],
  locale: Locale,
): ArtworkPresentation[] {
  return artworks.map((artwork) => presentArtwork(artwork, artists, locale));
}

/** Every work by an artist, whichever section it is in. */
export function artworksByArtist(
  artworks: Artwork[],
  artist: Pick<Artist, "id">,
): Artwork[] {
  return artworks.filter((artwork) => artwork.data.artist.id === artist.id);
}

/**
 * The artist's other works, presented. Catalogue and Private Collection
 * works relate to each other; each card links into its own section.
 */
export function relatedArtworks(
  presentation: ArtworkPresentation,
  pool: Artwork[],
  artists: Artist[],
): ArtworkPresentation[] {
  return presentArtworks(
    artworksByArtist(pool, presentation.artist).filter(
      (candidate) => candidate.id !== presentation.id,
    ),
    artists,
    presentation.locale,
  );
}
