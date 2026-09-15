import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { routes } from "@/routes";
import { badgeFor, sectionFor, type Badge, type Section } from "./availability";

/**
 * Everything a page needs to show an Artwork, decided in one place from its
 * Availability (see CONTEXT.md): which section it belongs to, which theme
 * that section uses, what badge it carries and whether it can be enquired
 * about. Pure: takes entries and returns a value, so it runs in tests.
 */

export type Artwork = CollectionEntry<"artworks">;
export type Artist = CollectionEntry<"artists">;

export type { Badge, Section } from "./availability";
export { isCatalogueWork, isPrivateCollectionWork } from "./availability";

export interface ArtworkPresentation {
  artwork: Artwork;
  artist: Artist;
  locale: Locale;
  section: Section;
  theme: "light" | "dark";
  /** Localised URL of the detail page. */
  href: string;
  /** Key into `ui.artworks`, or null when no badge is shown. */
  badge: Badge;
  canInquire: boolean;
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
  const { availability } = artwork.data;
  const section = sectionFor(availability);
  return {
    artwork,
    artist,
    locale,
    section,
    theme: section === "private-collection" ? "dark" : "light",
    href: routes.artwork(locale, artwork),
    badge: badgeFor(availability),
    canInquire: availability === "available",
  };
}

export function presentArtworks(
  artworks: Artwork[],
  artists: Artist[],
  locale: Locale,
): ArtworkPresentation[] {
  return artworks.map((artwork) => presentArtwork(artwork, artists, locale));
}

/**
 * The artist's other works, presented. Catalogue and Private Collection
 * works relate to each other; each card links into its own section.
 */
export function relatedArtworks(
  presentation: ArtworkPresentation,
  pool: Artwork[],
): ArtworkPresentation[] {
  return pool
    .filter(
      (candidate) =>
        candidate.id !== presentation.artwork.id &&
        candidate.data.artist.id === presentation.artist.id,
    )
    .map((candidate) =>
      presentArtwork(candidate, [presentation.artist], presentation.locale),
    );
}
