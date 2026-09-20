# Deployment

`pnpm build` writes a fully static site to `dist/`. It has no server-side code, so it deploys to any static host: Vercel, Netlify, Cloudflare Pages, GitHub Pages, an S3 bucket, or a plain web server.

Before deploying, set the canonical URL once: `site` in `astro.config.mjs`. Every absolute URL (sitemap, canonical, hreflang links, social sharing images, structured data) is derived from it. To deliver form submissions, set `PUBLIC_FORM_NEWSLETTER` and `PUBLIC_FORM_WORKSHOP` in the host's build environment (see `docs/forms.md`); without them the forms run in demo mode.

## Vercel (the demo)

The demo is hosted on Vercel. No adapter is needed for a static build; Vercel detects Astro and runs `pnpm build`. `vercel.json` only adds HTTP security headers and is ignored by other hosts, so you can keep or delete it.

## Keystatic in production

Keystatic's admin needs server routes, so `astro.config.mjs` includes it only during `astro dev`. Editing content is therefore a local workflow: run `pnpm dev`, edit at `/keystatic`, commit the changed files under `src/content/`, and deploy.

To edit from a hosted admin instead:

1. Add an SSR adapter (`pnpm astro add vercel`, `netlify`, `node`, …).
2. In `keystatic.config.ts`, set `KEYSTATIC_STORAGE_MODE` to `"github"` and fill in `GITHUB_REPO`.
3. Include the Keystatic integration in production builds by changing `includeKeystatic` in `astro.config.mjs`.
4. Follow Keystatic's GitHub setup guide to create the GitHub App and environment variables.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: Prettier (`pnpm format:check`), type and content checks (`pnpm check`) and a full build. Dependabot keeps dependencies current (`.github/dependabot.yml`).
