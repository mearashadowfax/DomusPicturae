import { describe, expect, it } from "vitest";
import { artist as fixture } from "@/test/fixtures";
import {
  listArtists,
  presentArtist,
  presentArtistListing,
  type Artist,
} from "./artists";

const artist = (name: string, isEstate = false) =>
  ({ id: name.toLowerCase(), data: { name, isEstate } }) as unknown as Artist;

describe("listArtists", () => {
  it("sorts alphabetically and lists Estates separately", () => {
    const { living, estates } = listArtists([
      artist("Yuki Tanaka"),
      artist("Marcus Weber", true),
      artist("Emma Thompson"),
      artist("Isabella Rodriguez", true),
    ]);
    expect(living.map((a) => a.data.name)).toEqual([
      "Emma Thompson",
      "Yuki Tanaka",
    ]);
    expect(estates.map((a) => a.data.name)).toEqual([
      "Isabella Rodriguez",
      "Marcus Weber",
    ]);
  });

  it("does not mutate its input", () => {
    const input = [artist("B"), artist("A")];
    listArtists(input);
    expect(input.map((a) => a.data.name)).toEqual(["B", "A"]);
  });
});

describe("presentArtist", () => {
  const portrait = "/images/artworks/the-blue-interval/image.jpg";

  it("resolves the href, CV link and portrait alt for a locale", () => {
    const p = presentArtist(
      fixture("sarah-chen", {
        name: "Sarah Chen",
        hasCv: true,
        image: portrait,
      }),
      "fr",
    );
    expect(p).toMatchObject({
      id: "sarah-chen",
      name: "Sarah Chen",
      href: "/fr/artists/sarah-chen",
      cvHref: "/cv/sarah-chen.pdf",
    });
    expect(p.portrait?.alt).toBe("Sarah Chen");
    const bare = presentArtist(fixture("james-park"), "en");
    expect(bare.cvHref).toBeNull();
    expect(bare.portrait).toBeNull();
  });

  it("falls back to the default locale, never to a third one", () => {
    const p = presentArtist(
      fixture("a", {
        shortBio: { en: "English", de: "Deutsch" },
        quote: { de: "Nur Deutsch" },
      }),
      "fr",
    );
    expect(p.shortBio).toBe("English");
    expect(p.quote).toBe("");
  });

  it("splits the biography into paragraphs", () => {
    const p = presentArtist(
      fixture("a", { biography: { en: "First.\n\nSecond.\n\n" } }),
      "en",
    );
    expect(p.biography).toEqual(["First.", "Second."]);
  });
});

describe("presentArtistListing", () => {
  it("keeps the listing rules and presents each artist", () => {
    const { living, estates } = presentArtistListing(
      [
        fixture("b", { name: "B" }),
        fixture("a", { name: "A", isEstate: true }),
      ],
      "de",
    );
    expect(living.map((a) => a.href)).toEqual(["/de/artists/b"]);
    expect(estates.map((a) => a.name)).toEqual(["A"]);
  });
});
