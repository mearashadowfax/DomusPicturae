import { describe, expect, it } from "vitest";
import { picture, pictures } from "./images";

const existing = "/images/artworks/the-blue-interval/image.jpg";

describe("picture", () => {
  it("resolves a stored path to the imported image with the localised alt", () => {
    const result = picture(
      { image: existing, imageAlt: { en: "Blue", fr: "Bleu" } },
      "fr",
    );
    expect(result?.src.width).toBeGreaterThan(0);
    expect(result?.alt).toBe("Bleu");
  });

  it("falls back to the default locale, then to fallbackAlt", () => {
    expect(
      picture({ image: existing, imageAlt: { en: "Blue" } }, "de")?.alt,
    ).toBe("Blue");
    expect(picture({ image: existing }, "de", "Title")?.alt).toBe("Title");
  });

  it("accepts paths without a leading slash", () => {
    expect(picture({ image: existing.slice(1) }, "en")).not.toBeNull();
  });

  it("returns null for an empty field", () => {
    expect(picture({ image: "" }, "en")).toBeNull();
    expect(picture({}, "en")).toBeNull();
  });

  it("throws when the file is missing so the build fails", () => {
    expect(() =>
      picture({ image: "/images/artworks/nope/image.jpg" }, "en"),
    ).toThrow(/Image not found/);
  });
});

describe("pictures", () => {
  it("drops entries without an image and keeps the source alongside", () => {
    const list = pictures(
      [
        { image: existing, caption: "a" },
        { image: "", caption: "b" },
      ],
      "en",
      (s) => s.caption,
    );
    expect(list).toHaveLength(1);
    expect(list[0].alt).toBe("a");
    expect(list[0].source.caption).toBe("a");
  });
});
