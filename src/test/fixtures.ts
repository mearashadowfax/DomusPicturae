import type { CollectionEntry } from "astro:content";

/**
 * Fake content entries for specs. Each builder fills the fields the pure
 * modules read with plausible values; pass `data` overrides for the fields a
 * spec is about. Entries are cast, not parsed: only what a spec reads needs
 * to exist.
 */

type Key =
  | "artists"
  | "artworks"
  | "exhibitions"
  | "workshops"
  | "news"
  | "site"
  | "homepage";
/** Field names are checked; values are loose so a spec can leave locales out. */
type Data<C extends Key> = {
  [F in keyof CollectionEntry<C>["data"]]?: unknown;
};

function entry<C extends Key>(
  collection: C,
  id: string,
  defaults: Record<string, unknown>,
  data: Record<string, unknown>,
): CollectionEntry<C> {
  return {
    id,
    collection,
    data: { ...defaults, ...data },
  } as unknown as CollectionEntry<C>;
}

export const artist = (id: string, data: Data<"artists"> = {}) =>
  entry(
    "artists",
    id,
    {
      name: id,
      isEstate: false,
      shortBio: { en: `${id} short bio` },
      biography: { en: `${id} biography` },
      hasCv: false,
    },
    data,
  );

export const artwork = (
  id: string,
  data: Omit<Data<"artworks">, "artist"> & { artist?: string } = {},
) => {
  const { artist: artistId = "artist", ...rest } = data;
  return entry(
    "artworks",
    id,
    {
      availability: "available",
      artist: { collection: "artists", id: artistId },
      title: { en: `${id} (en)`, fr: `${id} (fr)` },
      medium: { en: "Oil on canvas" },
      dimensions: { width: 100, height: 80, unit: "cm" },
    },
    rest,
  );
};

export const exhibition = (id: string, data: Data<"exhibitions"> = {}) =>
  entry(
    "exhibitions",
    id,
    {
      title: { en: `${id} (en)` },
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      timeline: { en: `${id} timeline` },
      openingHours: [],
    },
    data,
  );

export const workshop = (id: string, data: Data<"workshops"> = {}) =>
  entry("workshops", id, { title: { en: `${id} (en)` } }, data);

export const news = (id: string, data: Data<"news"> = {}) =>
  entry(
    "news",
    id,
    {
      title: { en: `${id} (en)` },
      pubDate: new Date("2026-01-01"),
      description: { en: `${id} description` },
      slides: [],
    },
    data,
  );

export const site = (data: Data<"site"> = {}) =>
  entry(
    "site",
    "index",
    {
      name: "Domus Picturae",
      description: { en: "A gallery" },
      tagline: { en: "Tagline" },
      address: "1 Street\nCity",
      social: {},
    },
    data,
  );

export const homepage = (data: Data<"homepage"> = {}) =>
  entry(
    "homepage",
    "index",
    {
      intro: { subheading: { en: "Intro" }, content: { en: "Intro content" } },
      events: {
        subheading: { en: "Events" },
        content: { en: "Events content" },
        buttonText: { en: "All events" },
      },
      about: {
        content: { en: "About" },
        buttonText: { en: "About us" },
        galleryItems: [],
      },
      collection: [],
    },
    data,
  );
