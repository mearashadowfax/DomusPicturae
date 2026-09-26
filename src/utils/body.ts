import { marked } from "marked";
import { collections } from "@/content-model/collections";
import { locales, type Locale } from "@/i18n/config";
import { pick } from "@/i18n/localized";

/**
 * The Localisable body of a directory-style entry: where its Markdown lives,
 * which locale's file is used, and how it becomes HTML. Pure: the sources are
 * passed in (the content module hands over the glob), so it runs in tests.
 */

type Collections = typeof collections;
type HasBody<S> = {
  [F in keyof S]: S[F] extends { kind: "body" } ? true : never;
}[keyof S];

/** Collections whose entries carry a `field.body()`, derived from the model. */
export type BodyCollection = {
  [K in keyof Collections]: HasBody<Collections[K]["fields"]> extends never
    ? never
    : K;
}[keyof Collections];

/** Raw Markdown keyed by path from the project root, as `import.meta.glob` returns it. */
export type BodySources = Record<string, string>;

/**
 * The directory the body files live in. Keystatic stores a nested content
 * field at `<field key>/<locale>.md`, so the directory is whatever the
 * collection's body field is called in the model; reading the key from the
 * model (rather than hard-coding "body") keeps this side in step with what
 * Keystatic writes if the field is ever renamed.
 */
export function bodyDirectory(collection: BodyCollection): string {
  const entry = Object.entries(collections[collection].fields).find(
    ([, field]) => field.kind === "body",
  );
  if (!entry) throw new Error(`Collection "${collection}" has no body field.`);
  return entry[0];
}

/** Path of one locale's body file, from the project root. */
export function bodyPath(
  collection: BodyCollection,
  id: string,
  locale: Locale,
): string {
  return `/src/content/${collection}/${id}/${bodyDirectory(collection)}/${locale}.md`;
}

/**
 * The Markdown source of an entry's body for a locale. Falls back like any
 * Localisable field: to the default locale, never to a third one. An empty
 * or whitespace-only file counts as missing.
 */
export function bodyMarkdown(
  sources: BodySources,
  collection: BodyCollection,
  id: string,
  locale: Locale,
): string {
  const perLocale = Object.fromEntries(
    locales.map((l) => [l, sources[bodyPath(collection, id, l)]?.trim()]),
  );
  return pick(perLocale, locale) ?? "";
}

/** Markdown → HTML. */
export async function renderMarkdown(source: string): Promise<string> {
  return marked.parse(source);
}

export interface RenderedBody {
  main: string;
  /** The closing paragraph on its own, when asked for and the body has one; else null. */
  closing: string | null;
}

/**
 * Render an entry's localised body to HTML from the given sources, falling
 * back like `bodyMarkdown`. With `splitClosing`, the last paragraph is
 * rendered separately so a page can place something (a slideshow) before it.
 */
export async function renderBodyFrom(
  sources: BodySources,
  collection: BodyCollection,
  id: string,
  locale: Locale,
  { splitClosing = false }: { splitClosing?: boolean } = {},
): Promise<RenderedBody> {
  const source = bodyMarkdown(sources, collection, id, locale);
  if (!splitClosing)
    return { main: await renderMarkdown(source), closing: null };
  const { main, closing } = splitClosingParagraph(source);
  return {
    main: await renderMarkdown(main),
    closing: closing ? await renderMarkdown(closing) : null,
  };
}

/**
 * Split a Markdown source into everything up to its last paragraph and the
 * last paragraph on its own, for pages that place something (a slideshow)
 * before the closing paragraph. A single-paragraph source is all `main`.
 */
export function splitClosingParagraph(source: string): {
  main: string;
  closing: string;
} {
  const parts = paragraphs(source);
  if (parts.length < 2) return { main: source, closing: "" };
  return {
    main: parts.slice(0, -1).join("\n\n"),
    closing: parts[parts.length - 1],
  };
}

/** Split plain text or Markdown into paragraphs on blank lines. */
export function paragraphs(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
