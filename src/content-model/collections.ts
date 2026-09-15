/**
 * The content model: every collection and singleton, described once.
 *
 * `src/content.config.ts` derives Astro's schemas from this file and
 * `keystatic.config.ts` derives the admin UI, so adding a field is a one-line
 * change here. Text fields are localised (one value per locale) unless
 * declared with `field.plain`; images, dates, numbers and slugs are shared.
 * See docs/content.md.
 */
import { collection, field, singleton } from "./fields";

export const availabilities = ["available", "sold", "not-for-sale"] as const;
export type Availability = (typeof availabilities)[number];

const imageAlt = (label = "Image alt text") => field.text(label);

const slides = (directory: string) =>
  field.array(
    "Slides",
    {
      image: field.image("Image", directory),
      imageAlt: imageAlt(),
      caption: field.text("Caption"),
    },
    "caption",
  );

export const collections = {
  artists: collection({
    label: "Artists",
    layout: "file",
    slugField: "name",
    fields: {
      name: field.name("Name"),
      isEstate: field.checkbox("Estate", {
        description:
          "A deceased artist represented through their estate; listed separately.",
      }),
      image: field.image("Portrait", "artists"),
      imageAlt: imageAlt("Portrait alt text"),
      shortBio: field.text("Short bio", { multiline: true, required: true }),
      biography: field.text("Biography", {
        multiline: true,
        required: true,
        description: "Use blank lines to separate paragraphs",
      }),
      quote: field.text("Quote", { multiline: true }),
      hasCv: field.checkbox("Has CV", {
        description: "Tick when a PDF exists at public/cv/<slug>.pdf",
      }),
    },
  }),

  artworks: collection({
    label: "Artworks",
    layout: "file",
    fields: {
      slug: field.slug(),
      title: field.text("Title", { required: true }),
      year: field.integer("Year"),
      artist: field.relation("Artist", "artists"),
      image: field.image("Image", "artworks", { required: true }),
      imageAlt: imageAlt(),
      medium: field.text("Medium", { required: true }),
      dimensions: field.object(
        "Dimensions",
        {
          width: field.number("Width", { required: true }),
          height: field.number("Height", { required: true }),
          unit: field.select(
            "Unit",
            [
              { label: "cm", value: "cm" },
              { label: "in", value: "in" },
            ],
            "cm",
          ),
        },
        { layout: [4, 4, 4] },
      ),
      description: field.text("Description", { multiline: true }),
      availability: field.select(
        "Availability",
        [
          { label: "Available", value: "available" },
          { label: "Sold", value: "sold" },
          { label: "Not for sale", value: "not-for-sale" },
        ],
        "available",
        "Available and sold works appear in the catalogue; works that are not for sale appear in the private collection.",
      ),
    },
  }),

  news: collection({
    label: "News",
    layout: "directory",
    fields: {
      slug: field.slug(),
      title: field.text("Title", { required: true }),
      pubDate: field.date("Publication date"),
      description: field.text("Description", {
        multiline: true,
        required: true,
      }),
      featuredImage: field.image("Featured image", "news", { required: true }),
      featuredImageAlt: imageAlt("Featured image alt text"),
      slides: slides("news"),
      body: field.body(),
    },
  }),

  exhibitions: collection({
    label: "Exhibitions",
    layout: "directory",
    fields: {
      slug: field.slug(),
      title: field.text("Title", { required: true }),
      description: field.text("Description", { multiline: true }),
      startDate: field.date("Start date"),
      endDate: field.date("End date"),
      timeline: field.text("Dates as displayed", {
        description: 'For example "June 6 – 12, 2025"',
      }),
      image: field.image("Image", "exhibitions", { required: true }),
      imageAlt: imageAlt(),
      location: field.text("Location"),
      admission: field.text("Admission"),
      openingHours: field.array(
        "Opening hours",
        {
          day: field.text("Day"),
          hours: field.plain("Hours"),
        },
        "day",
      ),
      body: field.body(),
    },
  }),

  workshops: collection({
    label: "Workshops",
    layout: "directory",
    fields: {
      slug: field.slug(),
      title: field.text("Title", { required: true }),
      image: field.image("Image", "workshops"),
      imageAlt: imageAlt(),
      video: field.plain("Preview video", {
        description: "Path to an MP4 in public/, played on hover",
      }),
      registerTitle: field.text("Registration title"),
      registerInfo: field.text("Registration info", { multiline: true }),
      body: field.body(),
    },
  }),

  pages: collection({
    label: "Pages",
    layout: "directory",
    fields: {
      slug: field.slug(),
      title: field.text("Title", { required: true }),
      description: field.text("Meta description", { multiline: true }),
      body: field.body(),
    },
  }),
};

export const singletons = {
  homepage: singleton({
    label: "Homepage",
    fields: {
      intro: field.object("Intro", {
        subheading: field.text("Subheading", {
          multiline: true,
          required: true,
        }),
        content: field.text("Content", { multiline: true, required: true }),
      }),
      events: field.object("Events", {
        subheading: field.text("Subheading", {
          multiline: true,
          required: true,
        }),
        content: field.text("Content", { multiline: true, required: true }),
        description: field.text("Description"),
        buttonText: field.text("Button text", { required: true }),
      }),
      about: field.object("About", {
        content: field.text("Content", { multiline: true, required: true }),
        buttonText: field.text("Button text", { required: true }),
        galleryItems: field.array(
          "Gallery images",
          {
            image: field.image("Image", "homepage", { required: true }),
            imageAlt: imageAlt(),
            top: field.number("Top (%)", { required: true, defaultValue: 0 }),
            left: field.number("Left (%)", { required: true, defaultValue: 0 }),
            parallaxSpeed: field.number("Parallax speed", {
              defaultValue: 0.05,
              description: "Between 0.04 and 0.1",
            }),
          },
          "imageAlt",
        ),
      }),
      collection: field.array(
        "Featured artworks",
        {
          artwork: field.relation("Artwork", "artworks"),
          caption: field.text("Caption", {
            description: "Leave empty to use the artwork title",
          }),
        },
        "artwork",
      ),
    },
  }),

  about: singleton({
    label: "About page",
    fields: {
      title: field.text("Title", { required: true }),
      intro: field.text("Intro", { multiline: true, required: true }),
      contentRight: field.text("Second paragraph", {
        multiline: true,
        required: true,
      }),
      contentLast: field.text("Closing paragraph", {
        multiline: true,
        required: true,
      }),
      animationContent: field.text("Animated text", {
        multiline: true,
        required: true,
      }),
      buttonText: field.text("Button text", { required: true }),
      images: field.array(
        "Images",
        {
          caption: field.text("Caption"),
          image: field.image("Image", "about", { required: true }),
          imageAlt: imageAlt(),
        },
        "caption",
      ),
      animatedImages: field.array(
        "Animated images",
        {
          image: field.image("Image", "about", { required: true }),
          imageAlt: imageAlt(),
        },
        "imageAlt",
      ),
    },
  }),

  site: singleton({
    label: "Site settings",
    fields: {
      name: field.plain("Gallery name", { required: true }),
      tagline: field.text("Tagline", {
        required: true,
        description: "Shown in the menu footer",
      }),
      description: field.text("Description", {
        multiline: true,
        required: true,
        description: "Default meta description",
      }),
      address: field.plain("Address", { multiline: true, required: true }),
      phone: field.plain("Phone"),
      email: field.plain("Email"),
      social: field.object("Social links", {
        x: field.url("X (Twitter)"),
        instagram: field.url("Instagram"),
      }),
      showreelLink: field.url(
        "Showreel link",
        "Where the showreel in the menu links to",
      ),
      creditName: field.plain("Credit name", {
        description: "Shown in the footer",
      }),
      creditUrl: field.url("Credit link"),
    },
  }),
};

export type CollectionName = keyof typeof collections;
export type SingletonName = keyof typeof singletons;
