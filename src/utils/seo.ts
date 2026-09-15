import type { CollectionEntry } from "astro:content";
import type { Thing, WithContext } from "schema-dts";
import { localeTags, type Locale } from "@/i18n/config";
import { text } from "@/i18n/localized";
import { routes } from "@/routes";
import type { ArtworkPresentation } from "./artwork-presentation";

/**
 * Structured data (schema.org JSON-LD) for each page type, built from plain
 * inputs so the shapes live in one place and can be checked in a spec.
 * Every builder needs the page's canonical `url` and the site origin `site`
 * (to absolutise links and images); the views pass `Astro.url` and `Astro.site`.
 */

export interface PageContext {
  /** Canonical URL of the page. */
  url: URL;
  /** Site origin, for absolute links and images. */
  site: URL;
  locale: Locale;
}

export interface SiteIdentity {
  name: string;
  description: string;
}

const absolute = (path: string, site: URL) => new URL(path, site).href;

/** The default schema for any page. */
export function webPageSchema(
  page: PageContext,
  site: SiteIdentity,
  meta: { title: string; description: string },
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": page.url.href,
    url: page.url.href,
    name: meta.title,
    description: meta.description,
    inLanguage: localeTags[page.locale],
    isPartOf: {
      "@type": "WebSite",
      url: page.site.href,
      name: site.name,
      description: site.description,
    },
  };
}

export function artistSchema(
  page: PageContext,
  artist: CollectionEntry<"artists">,
  description: string,
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": page.url.href,
    url: page.url.href,
    name: artist.data.name,
    description,
  };
}

export function artworkSchema(
  page: PageContext,
  presentation: ArtworkPresentation,
  meta: { description: string; imageSrc?: string },
): WithContext<Thing> {
  const { artwork, artist, locale } = presentation;
  const { width, height, unit } = artwork.data.dimensions;
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": page.url.href,
    url: page.url.href,
    name: text(artwork.data.title, locale),
    description: meta.description,
    creator: {
      "@type": "Person",
      name: artist.data.name,
      url: absolute(routes.artist(locale, artist), page.site),
    },
    dateCreated: artwork.data.year ? String(artwork.data.year) : undefined,
    artMedium: text(artwork.data.medium, locale),
    width: { "@type": "Distance", name: `${width} ${unit}` },
    height: { "@type": "Distance", name: `${height} ${unit}` },
    image: meta.imageSrc ? absolute(meta.imageSrc, page.site) : undefined,
  };
}

export function exhibitionSchema(
  page: PageContext,
  exhibition: CollectionEntry<"exhibitions">,
): WithContext<Thing> {
  const { locale } = page;
  return {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    "@id": page.url.href,
    url: page.url.href,
    name: text(exhibition.data.title, locale),
    description: text(exhibition.data.description, locale),
    startDate: exhibition.data.startDate.toISOString().slice(0, 10),
    endDate: exhibition.data.endDate.toISOString().slice(0, 10),
    location: {
      "@type": "Place",
      name: text(exhibition.data.location, locale),
    },
    inLanguage: localeTags[locale],
  };
}

export function articleSchema(
  page: PageContext,
  article: CollectionEntry<"news">,
  meta: { imageSrc?: string },
): WithContext<Thing> {
  const { locale } = page;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": page.url.href,
    url: page.url.href,
    headline: text(article.data.title, locale),
    description: text(article.data.description, locale),
    datePublished: article.data.pubDate.toISOString(),
    image: meta.imageSrc ? absolute(meta.imageSrc, page.site) : undefined,
    inLanguage: localeTags[locale],
  };
}
