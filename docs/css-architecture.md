# CSS architecture

The template uses plain CSS: design tokens as custom properties, a small set of global rules, and component-scoped `<style>` blocks for everything else. There is no utility framework.

## Files

```
src/assets/styles/
├── global.css      Entry point: declares the layer order and imports the two files below
├── variables.css   Design tokens (colours, radius, motion, viewport units) and the dark theme
├── base.css        Reset, document defaults and a few shared patterns
└── forms.css       Styles for the two React form islands
```

`global.css` is imported once, in `src/layouts/MainLayout.astro`. `forms.css` is imported by the form components themselves.

## Cascade layers

```css
@layer tokens, base, utilities;
```

Everything in the global files sits in one of these layers. Component `<style>` blocks are unlayered, so they always win over global rules without needing higher specificity or `!important`.

## Tokens

All colours, the corner radius and the motion curves are custom properties on `:root` in `variables.css`. Components reference tokens, never raw values. Changing the palette is a matter of editing that file.

### Viewport units

Sizes scale with the viewport through `--unit-fx`: `1` equals one pixel on a 1440px-wide design. Write `calc(24 * var(--unit-fx))` where a design specifies 24px. The unit is recalculated for tablets (768px base) and phones (375px base) so proportions hold across screens, and it stops growing at a 1920px viewport so wide monitors get margins rather than 30px body text. Raise or remove that ceiling in `variables.css` if your design wants to keep scaling.

### Layout tokens

Two spacing values change with the breakpoint rather than scaling with the unit, so they are tokens rather than numbers in components:

| Token           | Desktop / tablet | Phone       | Use                                                                                     |
| --------------- | ---------------- | ----------- | --------------------------------------------------------------------------------------- |
| `--gutter`      | `40` units       | `20` units  | The page's side padding. Every page-level section uses `padding-inline: var(--gutter)`. |
| `--section-gap` | `250` units      | `100` units | The vertical gap between homepage sections.                                             |

Full-bleed strips inside a gutter (the workshop carousel) cancel it with `margin-inline: calc(-1 * var(--gutter))` and put it back as `padding-inline`, so the strip runs edge to edge while its cards still snap to the gutter.

### Dark theme

A page opts in with `<MainLayout theme="dark">`, which sets `data-theme="dark"` on `<body>`. The `[data-theme="dark"]` block in `variables.css` swaps the surface and text tokens and cools the brand accent slightly (the light theme's sand reads orange on the plum surface); no component knows which theme it is rendered in. The private collection pages use it.

Text tokens name where they are legible: `--color-text-primary` / `secondary` / `tertiary` are for the current surface, and `--color-text-on-dark-muted` is only for the permanently dark bands (the homepage About section, the 404 page) — it fails contrast on light surfaces.

## Component styles

Each `.astro` component styles itself in a `<style>` block. Astro scopes the selectors to that component, so class names are plain and descriptive (`.artwork-card`, `.menu-link`, `.is-active`) rather than BEM. Use `:global()` only for elements a component cannot scope itself, such as rendered Markdown or an `<img>` produced by a child component.

Three conventions:

- Modifier and state classes are prefixed `is-` (`.is-active`, `.is-hidden`, `.is-dragging`).
- Responsive overrides live at the bottom of each `<style>` block, desktop-first: a tablet block under `@media screen and (max-width: 1024px)` where the layout needs to change (it also applies to phones), then the phone block under `@media screen and (max-width: 600px)`, which wins by source order. Most components only need the phone block; the tablet band otherwise inherits the desktop layout on the 768px unit base.
- Anything sized in units that must not exceed the screen — the wordmarks in the hero and footer, whose text is editor-controlled — is shrunk to fit by `fitText` (below) rather than tuned by hand.

## Shared patterns

`base.css` provides a handful of classes that recur across pages:

| Class                                | Use                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `.link-underline`                    | A link whose underline draws in from the left on hover                                                           |
| `.button-outline`                    | An outlined button that fills with the brand colour on hover                                                     |
| `.section-heading` / `.section-rule` | A small page heading with a brand-coloured rule                                                                  |
| `.hide`                              | Fade helper used by scripted reveals                                                                             |
| `[data-reveal="lines"]` / `"rule"`   | Starting state (hidden / zero-width) for the scroll reveals `reveal()` plays; phones get the final state         |
| `.visually-hidden`                   | Screen-reader-only text                                                                                          |
| `.tap-target`                        | Gives a small text link a 24px hit area on touch screens without moving it (`.link-underline` has this built in) |

## Motion

Scroll-driven and reveal animations use GSAP and Lenis smooth scrolling. `src/assets/scripts/motion.ts` registers the GSAP plugins once, defines the house easing (`EASE`) and exposes the recipes the pages share:

| Recipe                         | Effect                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `reveal(root?)`                | Plays every `data-reveal` under `root` (`lines` or `rule`), triggered by its nearest `<section>`          |
| `revealLines(target, trigger)` | Splits text into lines that rise into view as `trigger` scrolls in                                        |
| `drawRule(target, trigger)`    | Draws a horizontal rule from left to right                                                                |
| `slideIn(containers)`          | Slides an image container in from the left while its image slides in from the right                       |
| `onDesktop(init)`              | Runs `init` once fonts are ready and again when the desktop breakpoint is crossed, cleaning up in between |

Component `<script>` blocks import `gsap`, `ScrollTrigger` and the recipes from there rather than from `gsap` directly, so plugins are registered in one place.

Scroll reveals are declared in markup rather than wired up by selector: a section puts `data-reveal="lines"` on a heading or paragraph and `data-reveal="rule"` on an `<hr>`, and the page's script calls `reveal()` once. The hidden starting state lives in `base.css` under the same attribute, so nothing can be left hidden with no script to reveal it. Where a script still addresses an element by class (the hero, the collection images, the scroll scenes), the selector refers to the same class name as the styles; rename both together.

`src/assets/scripts/fitText.ts` exports `fitText(element, { container, fill })`: it shrinks a single-line element's `font-size` until the text fits its container (or `fill` of it), re-measuring when the container resizes. The stylesheet's size remains the ceiling and the no-JS fallback. The hero and footer wordmarks use it because the gallery name comes from Keystatic and can be any length.

Scroll scenes that only make sense with room to move — the 404 page — are built inside `onDesktop()`, and phones get a static layout from the same markup. The viewing room's track responds to the wheel, to pointer drag (touch and mouse) and to the arrow keys.

Under `prefers-reduced-motion: reduce`, every recipe applies its final state immediately and creates no tween, the homepage skips its preloader choreography, decorative parallax is not attached, and `smoothScroll.ts` leaves native scrolling alone. Interaction-driven scenes (the viewing room, the private collection) still respond to scrolling, since that is how they are navigated.
