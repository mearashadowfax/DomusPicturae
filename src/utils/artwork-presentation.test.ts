import { describe, expect, it } from "vitest";
import {
  artworksByArtist,
  isCatalogueWork,
  isPrivateCollectionWork,
  presentArtwork,
  presentArtworks,
  relatedArtworks,
  type Artist,
  type Artwork,
} from "./artwork-presentation";

const artist = {
  id: "sarah-chen",
  data: { name: "Sarah Chen" },
} as unknown as Artist;
const other = {
  id: "james-park",
  data: { name: "James Park" },
} as unknown as Artist;

function artwork(
  id: string,
  availability: string,
  artistId = "sarah-chen",
  extra: Record<string, unknown> = {},
): Artwork {
  return {
    id,
    data: {
      availability,
      artist: { collection: "artists", id: artistId },
      title: { en: `${id} (en)`, fr: `${id} (fr)` },
      dimensions: { width: 100, height: 80, unit: "cm" },
      ...extra,
    },
  } as unknown as Artwork;
}

describe("presentArtwork", () => {
  it("puts available and sold works in the catalogue on the light theme", () => {
    const p = presentArtwork(artwork("a", "available"), [artist], "fr");
    expect(p).toMatchObject({
      section: "artworks",
      theme: "light",
      badge: null,
      canInquire: true,
      href: "/fr/artworks/a",
    });
    expect(presentArtwork(artwork("b", "sold"), [artist], "en")).toMatchObject({
      section: "artworks",
      badge: "sold",
      canInquire: false,
      href: "/artworks/b",
    });
  });

  it("puts not-for-sale works in the private collection on the dark theme", () => {
    expect(
      presentArtwork(artwork("c", "not-for-sale"), [artist], "de"),
    ).toMatchObject({
      section: "private-collection",
      theme: "dark",
      badge: "notForSale",
      canInquire: false,
      href: "/de/private-collection/c",
    });
  });

  it("carries the localised title, year, image and shape", () => {
    const p = presentArtwork(artwork("a", "available"), [artist], "fr");
    expect(p).toMatchObject({
      title: "a (fr)",
      year: undefined,
      image: null,
      isSquare: false,
    });
    const square = artwork("b", "available", "sarah-chen", {
      year: 2024,
      dimensions: { width: 50, height: 50, unit: "cm" },
    });
    expect(presentArtwork(square, [artist], "de")).toMatchObject({
      title: "b (en)",
      year: 2024,
      isSquare: true,
    });
  });

  it("resolves the artist and fails on a dangling reference", () => {
    expect(
      presentArtwork(artwork("a", "available"), [other, artist], "en").artist,
    ).toBe(artist);
    expect(() =>
      presentArtwork(artwork("a", "available", "nobody"), [artist], "en"),
    ).toThrow(/nobody/);
  });
});

describe("relatedArtworks", () => {
  const pool = [
    artwork("self", "available"),
    artwork("same-artist", "sold"),
    artwork("same-artist-private", "not-for-sale"),
    artwork("other-artist", "available", "james-park"),
  ];

  it("keeps the same artist across sections, excluding the work itself", () => {
    const p = presentArtwork(pool[0], [artist, other], "en");
    expect(relatedArtworks(p, pool).map((r) => r.artwork.id)).toEqual([
      "same-artist",
      "same-artist-private",
    ]);
  });

  it("relates a private work to the artist's catalogue works", () => {
    const p = presentArtwork(pool[2], [artist, other], "en");
    expect(relatedArtworks(p, pool).map((r) => r.artwork.id)).toEqual([
      "self",
      "same-artist",
    ]);
  });
});

describe("artworksByArtist", () => {
  it("keeps every work by the artist, whichever section it is in", () => {
    const pool = [
      artwork("a", "available"),
      artwork("b", "not-for-sale"),
      artwork("c", "sold", "james-park"),
    ];
    expect(artworksByArtist(pool, artist).map((a) => a.id)).toEqual(["a", "b"]);
  });
});

describe("section predicates", () => {
  it("split the catalogue from the private collection", () => {
    const [a, b] = presentArtworks(
      [artwork("a", "sold"), artwork("b", "not-for-sale")],
      [artist],
      "en",
    );
    expect(isCatalogueWork(a.artwork)).toBe(true);
    expect(isPrivateCollectionWork(b.artwork)).toBe(true);
  });
});
