# Security Policy

## Scope

Domus Picturae builds to a static site: there is no server runtime, no database and no authentication in production. The surface that matters is the build toolchain (Astro, Keystatic, the dependency tree), the optional Keystatic admin when you enable it in production, and the third-party form endpoint you configure.

## Supported versions

Only the latest commit on `main` receives fixes. Sites generated from the template are yours to maintain; keep dependencies current (the repo ships a Dependabot configuration you can keep).

## Reporting a vulnerability

Please do not open a public issue for security problems. Use [GitHub's private vulnerability reporting](https://github.com/mearashadowfax/DomusPicturae/security/advisories/new) for this repository. Include what you found, how to reproduce it and, if you have one, a suggested fix.

You can expect an acknowledgement within a week. Once a fix is available it will be released on `main` and the advisory published.

## Dependencies

Vulnerabilities in Astro, Keystatic or another dependency should be reported to that project. Dependabot keeps the template's lockfile updated weekly.
