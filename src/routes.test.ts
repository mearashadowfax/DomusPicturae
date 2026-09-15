import { describe, expect, it } from "vitest";
import type { CollectionEntry } from "astro:content";
import { routes } from "./routes";

const artwork = (id: string, availability: string) =>
  ({ id, data: { availability } }) as unknown as CollectionEntry<"artworks">;

describe("routes", () => {
  it("prefixes non-default locales and leaves the default bare", () => {
    expect(routes.artists("en")).toBe("/artists");
    expect(routes.artists("fr")).toBe("/fr/artists");
    expect(routes.home("de")).toBe("/de");
    expect(routes.exhibition("de", "echoes-of-stillness")).toBe(
      "/de/exhibitions/echoes-of-stillness",
    );
    expect(routes.cv("sarah-chen")).toBe("/cv/sarah-chen.pdf");
  });

  it("sends an artwork to the section its Availability implies", () => {
    expect(routes.artwork("en", artwork("a", "available"))).toBe("/artworks/a");
    expect(routes.artwork("en", artwork("b", "sold"))).toBe("/artworks/b");
    expect(routes.artwork("fr", artwork("c", "not-for-sale"))).toBe(
      "/fr/private-collection/c",
    );
  });

  it("accepts an entry or a bare id for the other detail routes", () => {
    const artist = { id: "sarah-chen" } as CollectionEntry<"artists">;
    expect(routes.artist("en", artist)).toBe(routes.artist("en", "sarah-chen"));
    expect(routes.article("de", "grand-opening")).toBe(
      "/de/news/grand-opening",
    );
    expect(routes.workshop("fr", "abstract")).toBe("/fr/workshops/abstract");
  });
});
