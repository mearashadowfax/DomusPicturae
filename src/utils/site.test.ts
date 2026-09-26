import { describe, expect, it } from "vitest";
import { site } from "@/test/fixtures";
import { presentSite, wordmarks } from "./site";

describe("presentSite", () => {
  it("builds contact links from the editor's values", () => {
    const identity = presentSite(
      site({
        phone: "+39 06 123 4567",
        email: "info@example.test",
        address: "Via Giulia 1\n00186 Rome",
      }),
      "en",
    );
    expect(identity.phone).toEqual({
      label: "+39 06 123 4567",
      href: "tel:+39061234567",
    });
    expect(identity.email).toEqual({
      label: "info@example.test",
      href: "mailto:info@example.test",
    });
    expect(identity.addressLines).toEqual(["Via Giulia 1", "00186 Rome"]);
  });

  it("encodes the inquiry subject and gives no link without an email", () => {
    const withEmail = presentSite(site({ email: "info@example.test" }), "en");
    expect(withEmail.inquiryHref("Blue — Sarah Chen & co")).toBe(
      "mailto:info@example.test?subject=Blue%20%E2%80%94%20Sarah%20Chen%20%26%20co",
    );
    const without = presentSite(site(), "en");
    expect(without.inquiryHref("anything")).toBeNull();
    expect(without.email).toBeNull();
    expect(without.phone).toBeNull();
  });

  it("localises the tagline and description with the default-locale fallback", () => {
    const identity = presentSite(
      site({
        tagline: { en: "Contemporary art", fr: "Art contemporain" },
        description: { en: "A gallery", de: "Eine Galerie" },
      }),
      "fr",
    );
    expect(identity.tagline).toBe("Art contemporain");
    expect(identity.description).toBe("A gallery");
  });

  it("drops empty optional links", () => {
    const identity = presentSite(
      site({ social: { x: "", instagram: "https://instagram.test/g" } }),
      "en",
    );
    expect(identity.social).toEqual({
      x: null,
      instagram: "https://instagram.test/g",
    });
    expect(identity.showreelHref).toBeNull();
    expect(identity.credit).toBeNull();
  });
});

describe("wordmarks", () => {
  it("splits a two-word name and repeats a one-word name", () => {
    expect(wordmarks(" Domus  Picturae ")).toEqual({
      first: "Domus",
      last: "Picturae",
    });
    expect(wordmarks("Domus")).toEqual({ first: "Domus", last: "Domus" });
  });
});
