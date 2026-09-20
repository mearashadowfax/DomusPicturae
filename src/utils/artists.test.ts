import { describe, expect, it } from "vitest";
import { listArtists, type Artist } from "./artists";

const artist = (name: string, isEstate = false) =>
  ({ id: name.toLowerCase(), data: { name, isEstate } }) as unknown as Artist;

describe("listArtists", () => {
  it("sorts alphabetically and lists Estates separately", () => {
    const { living, estates } = listArtists([
      artist("Yuki Tanaka"),
      artist("Marcus Weber", true),
      artist("Emma Thompson"),
      artist("Isabella Rodriguez", true),
    ]);
    expect(living.map((a) => a.data.name)).toEqual([
      "Emma Thompson",
      "Yuki Tanaka",
    ]);
    expect(estates.map((a) => a.data.name)).toEqual([
      "Isabella Rodriguez",
      "Marcus Weber",
    ]);
  });

  it("does not mutate its input", () => {
    const input = [artist("B"), artist("A")];
    listArtists(input);
    expect(input.map((a) => a.data.name)).toEqual(["B", "A"]);
  });
});
