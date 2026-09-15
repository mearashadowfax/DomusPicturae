// `localized.ts` is intentionally not re-exported here: it depends on zod and
// is only needed by content schemas and server-side frontmatter. Client
// scripts import from "@/i18n/config" to keep zod out of the browser bundle.
export * from "./config";
export * from "./ui";
