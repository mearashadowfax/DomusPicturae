import type { Thing, WithContext } from "schema-dts";
import {
  localeTags,
  locales,
  localizePath,
  stripLocale,
  type Locale,
} from "@/i18n/config";
import type { ArtistPresentation } from "./artists";
import type { ArtworkPresentation } from "./artwork-presentation";
import { paragraphs } from "./body";
import type {
  ExhibitionPresentation,
  NewsPresentation,
  WorkshopPresentation,
} from "./programme";
import type { SiteIdentity } from "./site";

/**
 * Where a page sits on the web, decided once per request (`pageContext`),
 * the structured data (schema.org JSON-LD) for each page type, and each
 * page type's title and meta description (`*Meta`), built from
 * presentations so the shapes live in one place and can be checked in a
 * spec. The site origin comes from `site` in astro.config.mjs and nowhere
 * else, so canonical, hreflang and structured data cannot disagree.
 */

export interface PageContext {
  /** Canonical URL of the page. */
  url: URL;
  /** Site origin, for absolute links and images. */
  site: URL;
  locale: Locale;
  /** The page's path without its locale prefix. */
  basePath: string;
  /** The same page in every Locale: a site-relative `path` and absolute `href`. */
  alternates: { locale: Locale; path: string; href: string }[];
  /** The default Locale's URL, for `hreflang="x-default"`. */
  xDefault: string;
}

/**
 * Derive the page context from the Astro global (`Astro.url`, `Astro.site`).
 * `site` is mandatory: without it there is no origin to absolutise anything
 * against, and every link would be wrong on the live site.
 */
export function pageContext(
  astro: { url: URL; site: URL | undefined },
  locale: Locale,
): PageContext {
  if (!astro.site) {
    throw new Error(
      "Astro.site is not set: add `site` to astro.config.mjs so canonical URLs, hreflang links and structured data have an origin.",
    );
  }
  const site = astro.site;
  const basePath = stripLocale(astro.url.pathname);
  return {
    url: astro.url,
    site,
    locale,
    basePath,
    alternates: locales.map((l) => {
      const path = localizePath(l, basePath);
      return { locale: l, path, href: new URL(path, site).href };
    }),
    xDefault: new URL(basePath, site).href,
  };
}

const absolute = (path: string, site: URL) => new URL(path, site).href;

/** The default schema for any page. */
export function webPageSchema(
  page: PageContext,
  site: Pick<SiteIdentity, "name" | "description">,
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
  artist: ArtistPresentation,
  description: string,
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": page.url.href,
    url: page.url.href,
    name: artist.name,
    description,
  };
}

export function artworkSchema(
  page: PageContext,
  presentation: ArtworkPresentation,
  meta: { description: string; imageSrc?: string },
): WithContext<Thing> {
  const { artist, year } = presentation;
  const { width, height, unit } = presentation.dimensions;
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": page.url.href,
    url: page.url.href,
    name: presentation.title,
    description: meta.description,
    creator: {
      "@type": "Person",
      name: artist.name,
      url: absolute(artist.href, page.site),
    },
    dateCreated: year ? String(year) : undefined,
    artMedium: presentation.medium,
    width: { "@type": "QuantitativeValue", value: width, unitText: unit },
    height: { "@type": "QuantitativeValue", value: height, unitText: unit },
    image: meta.imageSrc ? absolute(meta.imageSrc, page.site) : undefined,
  };
}

export function exhibitionSchema(
  page: PageContext,
  exhibition: ExhibitionPresentation,
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    "@id": page.url.href,
    url: page.url.href,
    name: exhibition.title,
    description: exhibition.description,
    startDate: exhibition.startDate.toISOString().slice(0, 10),
    endDate: exhibition.endDate.toISOString().slice(0, 10),
    location: {
      "@type": "Place",
      name: exhibition.location,
    },
    inLanguage: localeTags[page.locale],
  };
}

export function articleSchema(
  page: PageContext,
  article: NewsPresentation,
  meta: { imageSrc?: string },
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": page.url.href,
    url: page.url.href,
    headline: article.title,
    description: article.description,
    datePublished: article.date.toISOString(),
    image: meta.imageSrc ? absolute(meta.imageSrc, page.site) : undefined,
    inLanguage: localeTags[page.locale],
  };
}

// ---------------------------------------------------------------- page meta

/**
 * What a page hands to the layout: its title, meta description and
 * structured data, decided together so the `<meta>` tags and the JSON-LD
 * cannot disagree. Each page type's description falls back along its own
 * chain; image URLs arrive already optimised (`imageSrc`), keeping this
 * module pure.
 */
export interface PageMeta {
  title: string;
  /** Undefined falls back to the site description in the layout. */
  description: string | undefined;
  schema?: WithContext<Thing>;
}

/** The biography's first paragraph, else the short bio. */
export function artistMeta(
  page: PageContext,
  artist: ArtistPresentation,
): PageMeta {
  const description = artist.biography[0] || artist.shortBio;
  return {
    title: artist.name,
    description,
    schema: artistSchema(page, artist, description),
  };
}

/**
 * The meta description is a caption built from the facts ("Title, Artist,
 * 2024. Oil on canvas, 100 × 80 cm."); the structured data prefers the
 * editor's description when there is one.
 */
export function artworkMeta(
  page: PageContext,
  presentation: ArtworkPresentation,
  images: { imageSrc?: string },
): PageMeta {
  const { title, artist, year, medium, dimensions } = presentation;
  const { width, height, unit } = dimensions;
  const caption = `${title}, ${artist.name}${year ? `, ${year}` : ""}. ${medium}, ${width} × ${height} ${unit}.`;
  return {
    title,
    description: caption,
    schema: artworkSchema(page, presentation, {
      description: presentation.description || caption,
      imageSrc: images.imageSrc,
    }),
  };
}

export function exhibitionMeta(
  page: PageContext,
  exhibition: ExhibitionPresentation,
): PageMeta {
  return {
    title: exhibition.title,
    description: exhibition.description,
    schema: exhibitionSchema(page, exhibition),
  };
}

/** A Workshop is described by its registration info; it has no schema. */
export function workshopMeta(workshop: WorkshopPresentation): PageMeta {
  return { title: workshop.title, description: workshop.registerInfo };
}

export function articleMeta(
  page: PageContext,
  article: NewsPresentation,
  images: { imageSrc?: string },
): PageMeta {
  return {
    title: article.title,
    description: article.description,
    schema: articleSchema(page, article, images),
  };
}

/** The About page is described by the first paragraph of its intro, without markup. */
export function aboutMeta(title: string, introHtml: string): PageMeta {
  return {
    title,
    description: paragraphs(introHtml.replace(/<[^>]+>/g, ""))[0],
  };
}
