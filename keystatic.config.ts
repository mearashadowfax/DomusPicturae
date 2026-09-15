import { config } from "@keystatic/core";
import { collections, singletons } from "./src/content-model/collections";
import {
  keystaticCollection,
  keystaticSingleton,
} from "./src/content-model/keystatic";

/**
 * Keystatic admin configuration.
 *
 * The fields come from the content model in `src/content-model/`; this file
 * only decides storage and how the admin is organised. The admin runs at
 * `/keystatic` under `pnpm dev` in `local` storage mode and edits the files in
 * `src/content/` directly. To edit content from a hosted admin instead, switch
 * to `github` storage and add an SSR adapter — see docs/deployment.md.
 */
const KEYSTATIC_STORAGE_MODE = "local" as "local" | "github";
const GITHUB_REPO = { owner: "REPO_OWNER", name: "REPO_NAME" };

const storage =
  KEYSTATIC_STORAGE_MODE === "github"
    ? ({
        kind: "github",
        repo: `${GITHUB_REPO.owner}/${GITHUB_REPO.name}`,
      } as const)
    : ({ kind: "local" } as const);

const entries = <V, R>(
  record: Record<string, V>,
  map: (name: string, value: V) => R,
) =>
  Object.fromEntries(
    Object.entries(record).map(([name, value]) => [name, map(name, value)]),
  );

export default config({
  storage,
  ui: {
    brand: { name: "Domus Picturae" },
    navigation: {
      Catalogue: ["artists", "artworks"],
      Programme: ["exhibitions", "workshops", "news"],
      Pages: ["homepage", "about", "pages"],
      Settings: ["site"],
    },
  },
  collections: entries(collections, keystaticCollection),
  singletons: entries(singletons, keystaticSingleton),
});
