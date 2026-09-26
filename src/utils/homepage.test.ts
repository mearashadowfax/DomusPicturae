import { describe, expect, it } from "vitest";
import { HOMEPAGE_ITEMS_LIMIT } from "@/data/constants";
import * as f from "@/test/fixtures";
import { presentHomepage, type HomepageEntries } from "./homepage";

const image = "/images/artworks/the-blue-interval/image.jpg";
const feature = (id: string, caption?: Record<string, string>) => ({
  artwork: { collection: "artworks", id },
  caption,
});

function entries(overrides: Partial<HomepageEntries> = {}): HomepageEntries {
  return {
    homepage: f.homepage(),
    artworks: [
      f.artwork("available", { image }),
      f.artwork("sold", { image, availability: "sold" }),
      f.artwork("private", { image, availability: "not-for-sale" }),
      f.artwork("imageless"),
    ],
    artists: [f.artist("artist", { name: "Artist" })],
    workshops: [],
    news: [],
    ...overrides,
  };
}

describe("presentHomepage: Featured Artworks", () => {
  it("keeps the editor's order and falls back to the title as caption", () => {
    const { featured } = presentHomepage(
      entries({
        homepage: f.homepage({
          collection: [
            feature("sold", { en: "A sold work", fr: "Une œuvre vendue" }),
            feature("available"),
          ],
        }),
      }),
      "fr",
    );
    expect(featured.map((item) => item.caption)).toEqual([
      "Une œuvre vendue",
      "available (fr)",
    ]);
    expect(featured[0].presentation.artist.name).toBe("Artist");
  });

  it.each([
    ["missing", /does not exist/],
    ["private", /Private Collection/],
    ["imageless", /has no image/],
  ])("fails the build when featuring a %s work", (id, message) => {
    expect(() =>
      presentHomepage(
        entries({ homepage: f.homepage({ collection: [feature(id)] }) }),
        "en",
      ),
    ).toThrow(message);
  });
});

describe("presentHomepage: listings", () => {
  const many = <T>(make: (id: string) => T) =>
    Array.from({ length: HOMEPAGE_ITEMS_LIMIT + 2 }, (_, i) =>
      make(`item-${i}`),
    );

  it("shows only the first Workshops and the latest News posts", () => {
    const news = many((id) => f.news(id)).map((post, i) => {
      post.data.pubDate = new Date(Date.UTC(2025, 0, i + 1));
      return post;
    });
    const home = presentHomepage(
      entries({ workshops: many((id) => f.workshop(id)), news }),
      "en",
    );
    expect(home.events.workshops.map((w) => w.id)).toEqual(
      ["item-0", "item-1", "item-2"].slice(0, HOMEPAGE_ITEMS_LIMIT),
    );
    expect(home.news).toHaveLength(HOMEPAGE_ITEMS_LIMIT);
    expect(home.news[0].id).toBe(`item-${HOMEPAGE_ITEMS_LIMIT + 1}`);
  });

  it("lists living Artists only", () => {
    const home = presentHomepage(
      entries({
        artists: [
          f.artist("b", { name: "B" }),
          f.artist("estate", { name: "Estate", isEstate: true }),
          f.artist("a", { name: "A" }),
        ],
      }),
      "en",
    );
    expect(home.artists.map((a) => a.name)).toEqual(["A", "B"]);
  });

  it("localises every section's text", () => {
    const home = presentHomepage(
      entries({
        homepage: f.homepage({
          intro: {
            subheading: { en: "Welcome", de: "Willkommen" },
            content: { en: "Intro" },
          },
        }),
      }),
      "de",
    );
    expect(home.intro).toEqual({ title: "Willkommen", content: "Intro" });
    expect(home.events.buttonText).toBe("All events");
  });
});
