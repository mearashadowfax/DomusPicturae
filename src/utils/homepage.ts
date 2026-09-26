import type { CollectionEntry } from "astro:content";
import { HOMEPAGE_ITEMS_LIMIT } from "@/data/constants";
import type { Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";
import { presentArtistListing, type ArtistPresentation } from "./artists";
import {
  presentArtwork,
  type Artist,
  type Artwork,
  type ArtworkPresentation,
} from "./artwork-presentation";
import { pictures, type Picture } from "./images";
import {
  presentNews,
  presentWorkshop,
  sortNews,
  sortWorkshops,
  type NewsPost,
  type NewsPresentation,
  type Workshop,
  type WorkshopPresentation,
} from "./programme";

/**
 * The homepage, decided in one place: which Featured Artworks it shows and
 * the content errors that fail the build (CONTEXT.md), which Artists and how
 * many Workshops and News posts it lists, and every section's localised
 * text. Pure: takes entries and returns a value, so it runs in tests; each
 * homepage section only renders its slice.
 */

export interface HomepageEntries {
  homepage: CollectionEntry<"homepage">;
  artworks: Artwork[];
  artists: Artist[];
  workshops: Workshop[];
  news: NewsPost[];
}

export interface FeaturedArtwork {
  presentation: ArtworkPresentation;
  /** Always present: a featured work without an image fails the build. */
  image: Picture;
  /** The editor's caption, falling back to the title. */
  caption: string;
}

export interface HomepageSection {
  title: string;
  content: string;
}

export interface AboutTeaserItem extends Picture {
  /** Position in the gallery field, in percent. */
  top: number;
  left: number;
  parallaxSpeed: number;
}

export interface Homepage {
  intro: HomepageSection;
  featured: FeaturedArtwork[];
  /** Living Artists only; Estates have their own tab on the artists index. */
  artists: ArtistPresentation[];
  events: HomepageSection & {
    description: string;
    buttonText: string;
    /** The first few Workshops. */
    workshops: WorkshopPresentation[];
  };
  /** The latest few News posts. */
  news: NewsPresentation[];
  about: { content: string; buttonText: string; gallery: AboutTeaserItem[] };
}

export function presentHomepage(
  entries: HomepageEntries,
  locale: Locale,
): Homepage {
  const { intro, events, about } = entries.homepage.data;
  return {
    intro: {
      title: text(intro.subheading, locale),
      content: text(intro.content, locale),
    },
    featured: featuredArtworks(entries, locale),
    artists: presentArtistListing(entries.artists, locale).living,
    events: {
      title: text(events.subheading, locale),
      content: text(events.content, locale),
      description: text(events.description, locale),
      buttonText: text(events.buttonText, locale),
      workshops: sortWorkshops(entries.workshops)
        .slice(0, HOMEPAGE_ITEMS_LIMIT)
        .map((workshop) => presentWorkshop(workshop, locale)),
    },
    news: sortNews(entries.news)
      .slice(0, HOMEPAGE_ITEMS_LIMIT)
      .map((post) => presentNews(post, locale)),
    about: {
      content: text(about.content, locale),
      buttonText: text(about.buttonText, locale),
      gallery: pictures(about.galleryItems, locale).map(
        ({ src, alt, source }) => ({
          src,
          alt,
          top: source.top,
          left: source.left,
          parallaxSpeed: source.parallaxSpeed,
        }),
      ),
    },
  };
}

/**
 * The Featured Artworks, in the editor's order. Featuring a work that does
 * not exist, is in the Private Collection or has no image is a content error
 * and fails the build rather than silently dropping it.
 */
function featuredArtworks(
  { homepage, artworks, artists }: HomepageEntries,
  locale: Locale,
): FeaturedArtwork[] {
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
