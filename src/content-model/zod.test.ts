import { describe, expect, it } from "vitest";
import { z } from "astro/zod";
import { collection, field, singleton } from "./fields";
import { entryPattern, schemaFor } from "./zod";

const deps = {
  reference: (collection: string) =>
    z.string().transform((id) => ({ collection, id })),
};

describe("schemaFor", () => {
  it("localises text fields as one key per locale and respects required", () => {
    const schema = schemaFor(
      singleton({
        label: "x",
        fields: {
          title: field.text("Title", { required: true }),
          note: field.text("Note"),
        },
      }),
      deps,
    );
    expect(
      schema.parse({ title: { en: "a", fr: "b", de: "c" }, note: { en: "" } }),
    ).toEqual({
      title: { en: "a", fr: "b", de: "c" },
      note: { en: "" },
    });
    expect(() => schema.parse({ title: { en: "a" } })).toThrow();
  });

  it("omits slug and body fields, which live in the file layout", () => {
    const schema = schemaFor(
      collection({
        label: "x",
        layout: "directory",
        fields: {
          slug: field.slug(),
          body: field.body(),
          title: field.text("T"),
        },
      }),
      deps,
    );
    expect(Object.keys(schema.shape)).toEqual(["title"]);
  });

  it("applies defaults for checkbox, select, number and array", () => {
    const schema = schemaFor(
      singleton({
        label: "x",
        fields: {
          flag: field.checkbox("F", { defaultValue: true }),
          state: field.select(
            "S",
            [
              { label: "A", value: "a" },
              { label: "B", value: "b" },
            ],
            "b",
          ),
          speed: field.number("N", { defaultValue: 0.5 }),
          items: field.array("I", { name: field.plain("Name") }, "name"),
        },
      }),
      deps,
    );
    expect(schema.parse({})).toEqual({
      flag: true,
      state: "b",
      speed: 0.5,
      items: [],
    });
    expect(() => schema.parse({ state: "c" })).toThrow();
  });

  it("coerces dates and resolves relations through the injected reference", () => {
    const schema = schemaFor(
      singleton({
        label: "x",
        fields: {
          when: field.date("When"),
          who: field.relation("Who", "artists"),
        },
      }),
      deps,
    );
    const parsed = schema.parse({ when: "2026-09-03", who: "sarah-chen" });
    expect(parsed.when).toBeInstanceOf(Date);
    expect(parsed.who).toEqual({ collection: "artists", id: "sarah-chen" });
  });
});

describe("entryPattern", () => {
  it("matches the file layout of each kind", () => {
    expect(
      entryPattern(collection({ label: "x", layout: "file", fields: {} })),
    ).toBe("*.json");
    expect(
      entryPattern(collection({ label: "x", layout: "directory", fields: {} })),
    ).toBe("*/index.json");
    expect(entryPattern(singleton({ label: "x", fields: {} }))).toBe(
      "index.json",
    );
  });
});
