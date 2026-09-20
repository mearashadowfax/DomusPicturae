# Domus Picturae

A website template for contemporary art galleries, built with [Astro](https://astro.build/) and [Keystatic](https://keystatic.com/). You get a finished gallery site – artists, artworks, a viewing room, a private collection, exhibitions, workshops and news – in every language you need, with a browser-based editor for the content and no server to run.

<p align="left">
    <a href="https://domus-picturae.vercel.app" target="_blank">
      <img src="src/assets/images/cover.jpg" alt="Domus Picturae – Multilingual Astro Template for Art Galleries" /></a>
</p>

**Live demo:** [domus-picturae.vercel.app](https://domus-picturae.vercel.app). All demo content – artists, artworks, events – is fictional.

Two things set it apart from a general-purpose Astro starter. Every text field is localised per field, so each page exists **once** and is rendered for every locale; adding a language is a documented six-step change, not a copy of the site. And the content model is described **once** in `src/content-model/collections.ts` and generates both the Astro content schemas and the Keystatic admin, so the editor and the build never drift apart.

- **Gallery-native content model.** Artists and estates, artworks with `available` / `sold` / `not-for-sale` status, exhibitions, workshops, news and pages. Availability decides where a work is shown: catalogue and viewing room, or the dark-themed private collection.
- **Multilingual by construction.** English, French and German out of the box on Astro's i18n routing, with typed UI strings, `hreflang` links and per-locale sitemap entries. The locale list in `src/i18n/config.ts` is the single source of truth.
- **Git-based editing.** Keystatic runs at `/keystatic` in development and writes straight to `src/content/`, so content ships in the same commits as code.
- **Fully static.** No adapter, no runtime. Deploys to Vercel, Netlify, Cloudflare Pages, GitHub Pages or any web server.
- **Plain CSS design system.** Tokens as custom properties, cascade layers, component-scoped styles and a token-swap dark theme. No utility framework.
- **Motion.** GSAP and Lenis power smooth scrolling, scroll-driven reveals, a horizontal viewing room and a 3D private-collection scene.
- **Forms that work on day one.** Newsletter and workshop registration islands (React, react-hook-form, zod, honeypot) deliver to Formspree or any JSON webhook, and run in demo mode until you configure one.
- **SEO and quality gates.** Per-page metadata, Open Graph, schema.org JSON-LD, sitemap and robots.txt; type and content checks, Vitest specs, Prettier and a CI workflow on every PR.

An artwork is one JSON file with a key per locale on every text field. This entry is served at `/artworks/alpine-echo-field`, `/fr/artworks/alpine-echo-field` and `/de/artworks/alpine-echo-field`; change `availability` to `"not-for-sale"` and it moves to `/private-collection/…` instead:

```json
{
  "title": {
    "en": "Alpine Echo Field",
    "fr": "Champ d'écho alpin",
    "de": "Alpines Echofeld"
  },
  "year": 2021,
  "artist": "marcus-weber",
  "availability": "sold"
}
```

---

## Table of Contents

- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Customization](#customization)
  - [Gallery Details](#gallery-details)
  - [Navigation](#navigation)
  - [Design Tokens and Dark Theme](#design-tokens-and-dark-theme)
  - [Forms](#forms)
- [Content Management](#content-management)
  - [Keystatic CMS](#keystatic-cms)
  - [Localised Content](#localised-content)
  - [Artwork Availability](#artwork-availability)
- [Internationalization](#internationalization)
- [Integrations](#integrations)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Getting Started

You need **Node.js 22.12 or newer** and **pnpm**. If you don't have pnpm, `corepack enable` gives you the version pinned in `package.json`.

**1. Create your repository.** Click **Use this template** at the top of [the GitHub page](https://github.com/mearashadowfax/DomusPicturae), then clone it:

```bash
git clone https://github.com/[YOUR_USERNAME]/[YOUR_REPO_NAME].git
cd [YOUR_REPO_NAME]
```

**2. Install and run.**

```bash
pnpm install
pnpm dev
```

The site is at `http://localhost:4321` and the Keystatic admin at `http://localhost:4321/keystatic`. Edits made in the admin are written to `src/content/`.

**3. Make it yours.** Open **Site settings** in Keystatic and replace the gallery name, address, contact details and social links. Then set the canonical URL in `astro.config.mjs` (`site`). See [Customization](#customization) for the rest.

**4. Build.**

```bash
pnpm build     # static site in dist/
pnpm preview   # serve dist/ locally
```

Other scripts:

- `pnpm check` type-checks components and validates every content entry.
- `pnpm test` runs the unit specs (Vitest).
- `pnpm format:fix` / `pnpm format:check` run Prettier.

---

## Deployment

The build is fully static with no adapter, so `dist/` deploys to Vercel, Netlify, Cloudflare Pages, GitHub Pages or any web server. Before deploying, set the canonical URL in `astro.config.mjs` (`site`), and optionally the two form variables from `.env.template` in your host's build environment.

Click the button below to deploy the template to Vercel in one step:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmearashadowfax%2FDomusPicturae)

> [!NOTE]
> The Keystatic admin needs server routes, so it is only included while running `pnpm dev`; production builds are static. To edit content from a hosted admin, add an SSR adapter and switch Keystatic to GitHub storage as described in [`docs/deployment.md`](docs/deployment.md).

`vercel.json` only adds HTTP security headers and is ignored by other hosts.

---

## Project Structure

```text
src/
├── assets/
│   ├── images/          Images referenced by content (Keystatic uploads go here)
│   ├── scripts/         Smooth scrolling and the GSAP motion module
│   └── styles/          Design tokens, base styles, shared form styles
├── components/
│   ├── forms/           React islands (newsletter, workshop registration)
│   ├── sections/        Page sections and cards, grouped by area
│   └── ui/              Icons, language switcher, slider, cursor
├── content/             Editorial content, one folder per collection
├── content-model/       The content model: one description generates Zod + Keystatic
├── content.config.ts    Astro collections, generated from the model
├── data/                Build-time constants
├── i18n/                Locale list and UI strings per locale
├── layouts/             The page shell
├── pages/               Routes: thin files per locale that render a view
├── routes.ts            Every URL the site serves, as href builders
├── utils/               The content module and the pure rules behind it; images, SEO, formatting
└── views/               One component per page type, shared by every locale
```

---

## Customization

### Gallery Details

The gallery name, tagline, address, contact details, social links and footer credit live in the **Site settings** singleton in Keystatic (`src/content/site/index.json`). The demo ships with the template author's name in the `creditName` / `creditUrl` fields; replace them with your own or clear them to hide the credit. Build-time values – the sharing image and theme colour – are in `src/data/constants.ts` and `public/site.webmanifest`; the canonical URL is `site` in `astro.config.mjs`.

### Navigation

Menu and footer entries are ordered lists in `src/routes.ts`; their labels live with the other UI strings in `src/i18n/ui.ts`, one set per locale, so adding a language never touches the navigation itself.

### Design Tokens and Dark Theme

Colours, radius and motion curves are custom properties in `src/assets/styles/variables.css`. Sizes scale with the viewport through `--unit-fx` (`calc(24 * var(--unit-fx))` for a 24px design value). A page renders on the dark palette by passing `theme="dark"` to the layout; only tokens change. See [`docs/css-architecture.md`](docs/css-architecture.md).

### Forms

The newsletter and workshop forms post JSON to the endpoints in `PUBLIC_FORM_NEWSLETTER` and `PUBLIC_FORM_WORKSHOP` (a Formspree form or any JSON webhook). Unset, they run in demo mode and log the submission instead, so a fresh clone works before any service exists; see [`docs/forms.md`](docs/forms.md).

---

## Content Management

### Keystatic CMS

Run `pnpm dev` and open `http://localhost:4321/keystatic`. Keystatic runs in `local` storage mode and edits the files under `src/content/` directly, so content changes are committed with the rest of the code. Switch `KEYSTATIC_STORAGE_MODE` in `keystatic.config.ts` to `"github"` for hosted editing.

The content model is defined once in `src/content-model/collections.ts`; `src/content.config.ts` (Astro schemas) and `keystatic.config.ts` (admin UI) are generated from it. Six collections (artists, artworks, news, exhibitions, workshops, pages) and three singletons (homepage, about, site settings) ship with the demo.

### Localised Content

Every free-text field is stored as one object with a key per locale:

```json
"title": { "en": "The Blue Interval", "fr": "L'intervalle bleu", "de": "Das blaue Intervall" }
```

Images, dates, numbers and slugs are shared. Long-form entries (news, exhibitions, workshops, pages) keep a Markdown body per language in `body/<locale>.md`. See [`docs/content.md`](docs/content.md).

### Artwork Availability

An artwork is `available`, `sold` or `not-for-sale`. Available and sold works appear in the catalogue and viewing room; works that are not for sale form the private collection, shown on the dark theme.

---

## Internationalization

The locale list in `src/i18n/config.ts` is the single source of truth: `astro.config.mjs`, the content schemas, the Keystatic admin and every component read from it. Each page exists once in `src/views/` and is rendered by a thin route file per locale in `src/pages/`, so `src/pages/` still shows every URL the site serves. The default locale (`en`) is served without a prefix; every other locale lives under `/<locale>/`. Adding a language is a six-step change described in [`docs/i18n.md`](docs/i18n.md).

---

## Integrations

- **[Astro SEO](https://github.com/jonasmerlin/astro-seo)** and **[Astro SEO Schema](https://github.com/codiume/orbit/tree/main/packages/astro-seo-schema)** for metadata and structured data; the JSON-LD shapes live in `src/utils/seo.ts`.
- **Astro Fonts** to self-host Satoshi (Fontshare) and Baskervville (Google Fonts) – fetched at build time and served from `/_astro/fonts/`, so visitors never contact a third-party font CDN.
- **[GSAP](https://gsap.com/)** with ScrollTrigger and SplitText for reveals and scroll-driven scenes.
- **[Lenis](https://lenis.darkroom.engineering/)** for smooth scrolling, synced with ScrollTrigger.
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** with per-locale entries.
- **[Keystatic](https://keystatic.com/)** with localised fields generated from the locale list.

---

## Documentation

| Guide                                                | What it covers                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| [docs/content.md](docs/content.md)                   | The content model, localised fields, adding a content type       |
| [docs/i18n.md](docs/i18n.md)                         | Locales, UI strings, navigation labels, adding a language        |
| [docs/css-architecture.md](docs/css-architecture.md) | Tokens, layers, component styles, the dark theme                 |
| [docs/forms.md](docs/forms.md)                       | Wiring the newsletter and workshop registration forms            |
| [docs/deployment.md](docs/deployment.md)             | Static hosting, the Vercel demo, running Keystatic in production |
| [CONTEXT.md](CONTEXT.md)                             | Glossary of the terms used in code and content                   |

---

## Contributing

Contributions are welcome. Open an issue for bugs or proposals, or submit a pull request; CI runs formatting, type/content checks, the unit specs and a full build on every PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

Questions and ideas are welcome in [Discussions](https://github.com/mearashadowfax/DomusPicturae/discussions/new/choose); bugs go to the [issue tracker](https://github.com/mearashadowfax/DomusPicturae/issues).

---

## License

Released under the MIT License. See [LICENSE](LICENSE) for details.
