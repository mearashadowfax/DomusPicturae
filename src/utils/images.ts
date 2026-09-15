import type { ImageMetadata } from "astro";
import type { Locale } from "@/i18n/config";
import { text, type LocalizedInput } from "@/i18n/localized";

/**
 * Every image under `src/assets/images/`, keyed by its path from the project
 * root. Keystatic stores image paths as `/images/<folder>/<file>` (its
 * `publicPath`), which maps 1:1 onto `src/assets/images/<folder>/<file>`.
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

/** Anything with an image path and a localised alt text — every content type stores images this way. */
export interface PictureSource {
  image?: string | null;
  imageAlt?: LocalizedInput | null;
}

/** What `<Image>` needs. Output width stays with the caller: it is a layout fact. */
export interface Picture {
  src: ImageMetadata;
  alt: string;
}

/**
 * Resolve a stored image path to the imported image Astro optimises at build
 * time, paired with its alt text for the locale (falling back to
 * `fallbackAlt`, typically the entry's title).
 *
 * Returns `null` when the field is empty. Throws when the field names a file
 * that does not exist: a content error should fail the build, not ship a
 * blank card.
 */
export function picture(
  source: PictureSource,
  locale: Locale,
  fallbackAlt = "",
): Picture | null {
  if (!source.image) return null;
  const path = source.image.startsWith("/") ? source.image : `/${source.image}`;
  const found = images[`/src/assets${path}`];
  if (!found) {
    throw new Error(
      `Image not found: "${source.image}" (expected src/assets${path}). Fix the path or restore the file.`,
    );
  }
  return {
    src: found.default,
    alt: text(source.imageAlt, locale) || fallbackAlt,
  };
}

/** `picture` over a list, dropping entries with no image. */
export function pictures<S extends PictureSource>(
  sources: S[],
  locale: Locale,
  fallbackAlt: (source: S) => string = () => "",
): (Picture & { source: S })[] {
  return sources.flatMap((source) => {
    const p = picture(source, locale, fallbackAlt(source));
    return p ? [{ ...p, source }] : [];
  });
}
