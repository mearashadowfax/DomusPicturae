import { defaultLocale, type Locale } from "./config";

/**
 * A localised value as stored in content: the default locale is the
 * reference, every other locale is optional (see "Localisable field" in
 * CONTEXT.md).
 */
export type Localized<T = string> = {
  [K in typeof defaultLocale]: T;
} & Partial<Record<Locale, T>>;

/** A localised value as it comes out of a schema: any locale may be missing or empty. */
export type LocalizedInput<T = string> = Partial<
  Record<Locale, T | null | undefined>
>;

const present = <T>(v: T | null | undefined): v is T =>
  v !== undefined && v !== null && v !== "";

/**
 * Pick the value for a locale, falling back to the default locale. A
 * visitor never sees a third language they did not choose: if both are
 * empty the result is `undefined`.
 */
export function pick<T>(
  value: LocalizedInput<T> | undefined,
  locale: Locale,
): T | undefined {
  if (!value) return undefined;
  const preferred = value[locale];
  if (present(preferred)) return preferred;
  const fallback = value[defaultLocale];
  return present(fallback) ? fallback : undefined;
}

/** Like `pick`, but returns an empty string instead of `undefined`. */
export function text(
  value: LocalizedInput<string> | undefined,
  locale: Locale,
): string {
  return pick(value, locale) ?? "";
}
