import type { CollectionEntry } from "astro:content";
import type { Availability } from "@/content-model/collections";

/**
 * The one rule that splits the Catalogue from the Private Collection
 * (CONTEXT.md): where an Artwork's Availability sends it.
 */

export type Section = "artworks" | "private-collection";
export type Badge = "sold" | "notForSale" | null;

export function sectionFor(availability: Availability): Section {
  return availability === "not-for-sale" ? "private-collection" : "artworks";
}

export function badgeFor(availability: Availability): Badge {
  if (availability === "sold") return "sold";
  if (availability === "not-for-sale") return "notForSale";
  return null;
}

type Artwork = CollectionEntry<"artworks">;

/** Works shown in the public catalogue. */
export const isCatalogueWork = (artwork: Artwork) =>
  sectionFor(artwork.data.availability) === "artworks";
/** Works shown in the private collection. */
export const isPrivateCollectionWork = (artwork: Artwork) =>
  sectionFor(artwork.data.availability) === "private-collection";
