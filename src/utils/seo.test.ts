import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import {
  presentArtwork,
  type Artist,
  type Artwork,
} from "./artwork-presentation";
import {
  articleSchema,
  artworkSchema,
  exhibitionSchema,
  pageContext,
  webPageSchema,
} from "./seo";

const site = new URL("https://example.test/");
const page = (path: string, locale: "en" | "fr" = "en") =>
  pageContext({ url: new URL(path, site), site }, locale);

const artist = {
  id: "sarah-chen",
  data: { name: "Sarah Chen" },
} as unknown as Artist;
const artwork = {
  id: "whispering-pines",
  data: {
    title: { en: "Whispering Pines", fr: "Pins murmurants" },
    medium: { en: "Watercolour on paper", fr: "Aquarelle sur papier" },
    year: 2023,
    availability: "available",
    artist: { collection: "artists", id: "sarah-chen" },
    dimensions: { width: 50, height: 70, unit: "cm" },
  },
} as unknown as Artwork;
const exhibition = {
  id: "echoes",
  data: {
    title: { en: "Echoes of Stillness" },
    description: { en: "A group show" },
    location: { en: "Domus Picturae, Rome" },
    startDate: new Date("2026-09-03T00:00:00Z"),
    endDate: new Date("2026-10-31T00:00:00Z"),
  },
} as unknown as CollectionEntry<"exhibitions">;
const article = {
  id: "opening",
  data: {
    title: { en: "Opening" },
    description: { en: "We opened" },
    pubDate: new Date("2025-03-15T09:30:00Z"),
  },
} as unknown as CollectionEntry<"news">;

describe("seo schemas", () => {
  it("builds the WebPage default with the site as isPartOf", () => {
    const schema = webPageSchema(
      page("/fr/about", "fr"),
      { name: "Gallery", description: "About it" },
      { title: "About", description: "d" },
    );
    expect(schema).toMatchObject({
      "@type": "WebPage",
      "@id": "https://example.test/fr/about",
      inLanguage: "fr-FR",
      isPartOf: {
        "@type": "WebSite",
        url: "https://example.test/",
        name: "Gallery",
      },
    });
  });

  it("absolutises the artist link and image on a VisualArtwork", () => {
    const p = presentArtwork(artwork, [artist], "fr");
    const schema = artworkSchema(
      page("/fr/artworks/whispering-pines", "fr"),
      p,
      {
        description: "d",
        imageSrc: "/_astro/x.webp",
      },
    );
    expect(schema).toMatchObject({
      "@type": "VisualArtwork",
      name: "Pins murmurants",
      artMedium: "Aquarelle sur papier",
      dateCreated: "2023",
      creator: {
        "@type": "Person",
        name: "Sarah Chen",
        url: "https://example.test/fr/artists/sarah-chen",
      },
      image: "https://example.test/_astro/x.webp",
      width: { "@type": "Distance", name: "50 cm" },
    });
  });

  it("formats exhibition dates as ISO days and articles with full timestamps", () => {
    expect(
      exhibitionSchema(page("/exhibitions/echoes"), exhibition),
    ).toMatchObject({
      "@type": "ExhibitionEvent",
      startDate: "2026-09-03",
      endDate: "2026-10-31",
      location: { "@type": "Place", name: "Domus Picturae, Rome" },
    });
    const a = articleSchema(page("/news/opening"), article, {});
    expect(a).toMatchObject({
      "@type": "NewsArticle",
      headline: "Opening",
      datePublished: "2025-03-15T09:30:00.000Z",
    });
    expect((a as { image?: string }).image).toBeUndefined();
  });
});

describe("pageContext", () => {
  it("derives canonical, alternates and x-default from the site origin", () => {
    const ctx = pageContext(
      { url: new URL("https://example.test/fr/artists/sarah-chen"), site },
      "fr",
    );
    expect(ctx.url.href).toBe("https://example.test/fr/artists/sarah-chen");
    expect(ctx.basePath).toBe("/artists/sarah-chen");
    expect(ctx.alternates).toEqual([
      {
        locale: "en",
        path: "/artists/sarah-chen",
        href: "https://example.test/artists/sarah-chen",
      },
      {
        locale: "fr",
        path: "/fr/artists/sarah-chen",
        href: "https://example.test/fr/artists/sarah-chen",
      },
      {
        locale: "de",
        path: "/de/artists/sarah-chen",
        href: "https://example.test/de/artists/sarah-chen",
      },
    ]);
    expect(ctx.xDefault).toBe("https://example.test/artists/sarah-chen");
  });

  it("maps the home page of a prefixed locale back to the bare origin", () => {
    const ctx = pageContext(
      { url: new URL("https://example.test/de"), site },
      "de",
    );
    expect(ctx.basePath).toBe("/");
    expect(ctx.alternates.map((a) => a.path)).toEqual(["/", "/fr", "/de"]);
    expect(ctx.xDefault).toBe("https://example.test/");
  });

  it("refuses to run without a site origin", () => {
    expect(() =>
      pageContext(
        { url: new URL("https://example.test/"), site: undefined },
        "en",
      ),
    ).toThrow(/astro.config.mjs/);
  });
});
