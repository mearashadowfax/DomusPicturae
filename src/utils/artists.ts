import type { CollectionEntry } from "astro:content";

/**
 * How Artists are listed (CONTEXT.md): alphabetically, with Estates listed
 * separately from living Artists. Pure: takes entries and returns a value,
 * so it runs in tests.
 */

export type Artist = CollectionEntry<"artists">;

export interface ArtistListing {
  living: Artist[];
  estates: Artist[];
}

const byName = (a: Artist, b: Artist) => a.data.name.localeCompare(b.data.name);

export function listArtists(artists: Artist[]): ArtistListing {
  const sorted = [...artists].sort(byName);
  return {
    living: sorted.filter((artist) => !artist.data.isEstate),
    estates: sorted.filter((artist) => artist.data.isEstate),
  };
}
