import { describe, expect, it } from "vitest";
import {
  bodyDirectory,
  bodyMarkdown,
  bodyPath,
  paragraphs,
  renderBodyFrom,
  renderMarkdown,
  splitClosingParagraph,
} from "./body";

describe("bodyPath", () => {
  it("names the directory after the collection's body field", () => {
    expect(bodyDirectory("news")).toBe("body");
    expect(bodyPath("news", "grand-opening", "fr")).toBe(
      "/src/content/news/grand-opening/body/fr.md",
    );
  });
});

describe("bodyMarkdown", () => {
  const sources = {
    "/src/content/news/opening/body/en.md": "English body",
    "/src/content/news/opening/body/fr.md": "Corps français",
    "/src/content/news/opening/body/de.md": "   \n",
  };

  it("uses the requested locale when present", () => {
    expect(bodyMarkdown(sources, "news", "opening", "fr")).toBe(
      "Corps français",
    );
  });

  it("falls back to the default locale, treating a blank file as missing", () => {
    expect(bodyMarkdown(sources, "news", "opening", "de")).toBe("English body");
  });

  it("returns an empty string when neither exists", () => {
    expect(bodyMarkdown({}, "news", "opening", "fr")).toBe("");
  });
});

describe("splitClosingParagraph", () => {
  it("separates the last paragraph from the rest", () => {
    expect(splitClosingParagraph("One.\n\nTwo.\n \nThree.")).toEqual({
      main: "One.\n\nTwo.",
      closing: "Three.",
    });
  });

  it("keeps a single paragraph whole", () => {
    expect(splitClosingParagraph("Only.")).toEqual({
      main: "Only.",
      closing: "",
    });
  });
});

describe("paragraphs", () => {
  it("splits on blank lines and drops empty parts", () => {
    expect(paragraphs("a\n\n\n b \n\nc")).toEqual(["a", "b", "c"]);
    expect(paragraphs(undefined)).toEqual([]);
  });
});

describe("renderMarkdown", () => {
  it("renders Markdown to HTML", async () => {
    expect(await renderMarkdown("# Title")).toContain("<h1>Title</h1>");
  });
});

describe("renderBodyFrom", () => {
  const sources = {
    "/src/content/news/opening/body/en.md": "First *one*.\n\nSecond.\n\nLast.",
    "/src/content/news/single/body/en.md": "Only paragraph.",
    "/src/content/news/single/body/fr.md": "  ",
  };

  it("renders the whole body with no closing unless asked", async () => {
    const body = await renderBodyFrom(sources, "news", "opening", "en");
    expect(body.closing).toBeNull();
    expect(body.main).toContain("<em>one</em>");
    expect(body.main).toContain("<p>Last.</p>");
  });

  it("renders the closing paragraph separately when asked", async () => {
    const body = await renderBodyFrom(sources, "news", "opening", "en", {
      splitClosing: true,
    });
    expect(body.main).toContain("<p>Second.</p>");
    expect(body.main).not.toContain("Last.");
    expect(body.closing).toBe("<p>Last.</p>\n");
  });

  it("gives no closing for a single paragraph, after the locale fallback", async () => {
    const body = await renderBodyFrom(sources, "news", "single", "fr", {
      splitClosing: true,
    });
    expect(body).toEqual({ main: "<p>Only paragraph.</p>\n", closing: null });
  });
});
