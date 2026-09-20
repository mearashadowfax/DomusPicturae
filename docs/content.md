# Content

All editorial content lives in `src/content/` and is edited through the Keystatic admin at `/keystatic` (`pnpm dev`). Its shape is defined once, in the **content model**:

- `src/content-model/collections.ts` — every collection and singleton, written with the field builders in `fields.ts`
- `src/content-model/zod.ts` — derives the Zod schemas Astro validates content with (used by `src/content.config.ts`)
- `src/content-model/keystatic.ts` — derives the admin UI (used by `keystatic.config.ts`)

## Collections and singletons

| Name          | Where                              | Kind       | Notes                                                                                |
| ------------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `artists`     | `src/content/artists/<slug>.json`  | collection | `isEstate` lists the artist under _Estates_; `hasCv` links to `public/cv/<slug>.pdf` |
| `artworks`    | `src/content/artworks/<slug>.json` | collection | `availability` is `available`, `sold` or `not-for-sale` (see below)                  |
| `exhibitions` | `src/content/exhibitions/<slug>/`  | collection | Grouped into current / upcoming / past by `startDate` and `endDate`                  |
| `workshops`   | `src/content/workshops/<slug>/`    | collection | Listed by slug; optional hover video from `public/`                                  |
| `news`        | `src/content/news/<slug>/`         | collection | Newest first; optional slideshow                                                     |
| `pages`       | `src/content/pages/<slug>/`        | collection | Long-form pages such as terms and privacy policy                                     |
| `homepage`    | `src/content/homepage/index.json`  | singleton  | Text for each homepage section and the featured artworks                             |
| `about`       | `src/content/about/index.json`     | singleton  | The About page                                                                       |
| `site`        | `src/content/site/index.json`      | singleton  | Gallery name, tagline, contact details, social links                                 |

### Availability

An artwork's `availability` drives where it appears:

- `available` and `sold` — the catalogue (`/artworks`, the viewing room, artist pages). Sold works show a _Sold_ badge.
- `not-for-sale` — the private collection (`/private-collection`), rendered on the dark theme without an enquiry button.

## Localised fields

Every free-text field is stored as one object per field, with one key per locale:

```json
"title": { "en": "The Blue Interval", "fr": "L'intervalle bleu", "de": "Das blaue Intervall" }
```

Images, dates, numbers and slugs are shared across locales. In templates, read a localised value with `text(field, locale)` from `src/i18n/localized.ts`; it falls back to the default locale (and no further), so a missing translation shows the default language rather than a blank. A `required` localised field means the default locale must be non-empty; translations are always optional.

## Entries with a body

Collections with long-form text (`exhibitions`, `workshops`, `news`, `pages`) use one directory per entry:

```
src/content/news/domus-picturae-grand-opening/
├── index.json      fields
└── body/
    ├── en.md       localised Markdown body
    ├── fr.md
    └── de.md
```

Keystatic writes the `body/<locale>.md` files itself, naming the directory after the collection's `body` field; `src/utils/body.ts` reads that field's key from the model rather than hard-coding it, so renaming the field moves both sides together. In templates, render a body with `renderBody(collection, id, locale)` from `src/utils/content.ts`; it falls back to the default locale like any other localisable field.

## Images

Keystatic uploads images to `src/assets/images/<collection>/<slug>/` and stores the path as `/images/<collection>/<slug>/<file>`. In templates, `picture({ image, imageAlt }, locale, fallbackAlt)` from `src/utils/images.ts` turns that pair into the `{ src, alt }` Astro's `<Image>` component needs — the alt text falls back to the default locale and then to `fallbackAlt` (usually the entry's title). A path that points at a missing file fails the build with the offending path. `pictures(list, locale)` does the same for arrays such as slides. Always pass a `width` to `<Image>` so the output stays small.

## Field builders

| Builder                                                                                      | Stored as              | Notes                                                        |
| -------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `field.text(label, { required, multiline })`                                                 | `{ en, fr, de }`       | Localised; the default for text                              |
| `field.plain(label)`                                                                         | string                 | Not localised (names, phone numbers, paths)                  |
| `field.slug()`                                                                               | file/directory name    | Required on every collection except those using `field.name` |
| `field.name(label)`                                                                          | string + file name     | A display name that also names the file (artists)            |
| `field.body()`                                                                               | `body/<locale>.md`     | Long-form Markdown per locale                                |
| `field.image(label, dir, { required })`                                                      | `/images/<dir>/…` path | Uploads go to `src/assets/images/<dir>/`                     |
| `field.relation(label, collection)`                                                          | entry id               | Typed reference; required unless `{ required: false }`       |
| `field.date`, `field.integer`, `field.number`, `field.checkbox`, `field.select`, `field.url` | primitives             |                                                              |
| `field.object(label, fields)` / `field.array(label, fields, itemLabel)`                      | nested                 | Compose the above                                            |

## Adding a content type

1. Describe it in `src/content-model/collections.ts` with the builders above (a `layout` of `"file"` or `"directory"`; use `"directory"` when it has a `field.body()`).
2. Register it in `src/content.config.ts` (`define("name", model.name)`) and add it to the admin navigation in `keystatic.config.ts`.
3. Add a view in `src/views/` and a thin route file in `src/pages/` for each locale (see `docs/i18n.md`).
4. Run `pnpm check` — it validates every entry against the model — and `pnpm test`.

Adding a _field_ to an existing type is step 1 alone.
