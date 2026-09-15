import { describe, expect, it } from "vitest";
import { pick, text } from "./localized";

describe("pick", () => {
  it("prefers the requested locale", () => {
    expect(pick({ en: "Blue", fr: "Bleu" }, "fr")).toBe("Bleu");
  });

  it("falls back to the default locale when the requested one is empty or missing", () => {
    expect(pick({ en: "Blue", fr: "" }, "fr")).toBe("Blue");
    expect(pick({ en: "Blue" }, "de")).toBe("Blue");
  });

  it("never falls back to a third locale", () => {
    expect(pick({ fr: "Bleu", de: "Blau" }, "en")).toBeUndefined();
    expect(pick({ en: "", fr: "Bleu" }, "de")).toBeUndefined();
    expect(pick(undefined, "en")).toBeUndefined();
  });

  it("text() returns an empty string instead of undefined", () => {
    expect(text({ fr: "Bleu" }, "de")).toBe("");
  });
});
