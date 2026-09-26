import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";
import { routes } from "@/routes";
import { paragraphs } from "./body";
import { picture, type Picture } from "./images";

/**
 * How Artists are listed and shown (CONTEXT.md): alphabetically, with
 * Estates listed separately from living Artists; and everything a page needs
 * to show one Artist, resolved for a locale. Pure: takes entries and returns
 * values, so it runs in tests.
 */

export type Artist = CollectionEntry<"artists">;

export interface ArtistListing<A = Artist> {
  living: A[];
  estates: A[];
}

const byName = (a: Artist, b: Artist) => a.data.name.localeCompare(b.data.name);

export function listArtists(artists: Artist[]): ArtistListing {
  const sorted = [...artists].sort(byName);
  return {
    living: sorted.filter((artist) => !artist.data.isEstate),
    estates: sorted.filter((artist) => artist.data.isEstate),
  };
}

export interface ArtistPresentation {
  id: string;
  name: string;
  isEstate: boolean;
  /** Localised URL of the artist's page. */
  href: string;
  /** The CV PDF, or null when the artist has none. */
  cvHref: string | null;
  /** The portrait with its alt text (the name when none is set), or null when there is none. */
  portrait: Picture | null;
  /** Localised, falling back to the default locale. */
  shortBio: string;
  /** Localised biography split into paragraphs. */
  biography: string[];
  /** Localised quote, or an empty string. */
  quote: string;
}

export function presentArtist(
  artist: Artist,
  locale: Locale,
): ArtistPresentation {
  const { name } = artist.data;
  return {
    id: artist.id,
    name,
    isEstate: Boolean(artist.data.isEstate),
    href: routes.artist(locale, artist),
    cvHref: artist.data.hasCv ? routes.cv(artist) : null,
    portrait: picture(artist.data, locale, name),
    shortBio: text(artist.data.shortBio, locale),
    biography: paragraphs(text(artist.data.biography, locale)),
    quote: text(artist.data.quote, locale),
  };
}

/** The listing, with every Artist presented for a locale. */
export function presentArtistListing(
  artists: Artist[],
  locale: Locale,
): ArtistListing<ArtistPresentation> {
  const { living, estates } = listArtists(artists);
  const present = (artist: Artist) => presentArtist(artist, locale);
  return { living: living.map(present), estates: estates.map(present) };
}
