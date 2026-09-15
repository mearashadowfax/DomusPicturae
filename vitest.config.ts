/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

/** Specs run through Astro's Vite config so `@/` aliases and `import.meta.glob` work. */
export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
