# Contributing

Thanks for helping improve DomusPicturae. This page covers how to get set up, what the project expects from a change, and how to get it merged.

## Getting started

```bash
git clone https://github.com/<your-username>/DomusPicturae.git
cd DomusPicturae
pnpm install
pnpm dev
```

The site runs at `http://localhost:4321` and the Keystatic admin at `/keystatic`. No environment variables are needed; the forms run in demo mode until `.env` provides endpoints (see `.env.template`).

Node 22 and pnpm 10 are what CI uses; `packageManager` in `package.json` pins the exact pnpm version for Corepack.

## Before opening a pull request

Run the same gates as CI:

```bash
pnpm format:check   # or `pnpm format:fix` to apply
pnpm check          # types and content entries
pnpm test           # unit specs
pnpm build
```

Keep pull requests focused on one change. Open an issue first for anything larger than a fix, so the approach can be agreed before the work is done.

## Conventions

- **Vocabulary** – use the terms defined in [`CONTEXT.md`](CONTEXT.md) (Artwork, Availability, Private Collection, Locale…) in code, content and issues.
- **Content model** – fields are declared once in `src/content-model/collections.ts`; `src/content.config.ts` and `keystatic.config.ts` are generated from it and should not gain hand-written fields.
- **Routes** – internal URLs come from `src/routes.ts`, never from a path literal in a component.
- **Localisation** – every visible string is either a localised content field or a UI string in `src/i18n/ui.ts`, with a value for every locale.
- **Styling** – plain CSS with design tokens; no utility framework. See [`docs/css-architecture.md`](docs/css-architecture.md).
- **Demo content** – must stay fictional. Do not add real people, addresses, phone numbers or email addresses.
- **Formatting** – Prettier handles it; CI rejects unformatted files.

## Reporting bugs and proposing features

Use the issue templates. For security problems, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
