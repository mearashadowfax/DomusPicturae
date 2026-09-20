import { describe, expect, it } from "vitest";
import {
  classifyExhibitions,
  sortNews,
  sortWorkshops,
  type NewsPost,
  type Exhibition,
  type Workshop,
} from "./programme";

/** Dates as the content schema produces them: calendar days at UTC midnight. */
const exhibition = (id: string, startDate: string, endDate: string) =>
  ({
    id,
    data: { startDate: new Date(startDate), endDate: new Date(endDate) },
  }) as unknown as Exhibition;

const ids = (entries: { id: string }[]) => entries.map((e) => e.id);

describe("classifyExhibitions", () => {
  const shows = [
    exhibition("spring", "2025-03-15", "2025-05-15"),
    exhibition("autumn", "2026-09-03", "2026-10-31"),
    exhibition("winter", "2026-11-19", "2027-01-16"),
    exhibition("summer-next", "2027-06-01", "2027-08-01"),
  ];

  it("splits by status against the given clock", () => {
    const { current, upcoming, past } = classifyExhibitions(
      shows,
      new Date("2026-09-20T12:00:00Z"),
    );
    expect(ids(current)).toEqual(["autumn"]);
    expect(ids(upcoming)).toEqual(["winter", "summer-next"]);
    expect(ids(past)).toEqual(["spring"]);
  });

  it("keeps a show current through the whole of its last day", () => {
    const lastDay = classifyExhibitions(
      shows,
      new Date("2026-10-31T23:30:00Z"),
    );
    expect(ids(lastDay.current)).toEqual(["autumn"]);
    const dayAfter = classifyExhibitions(
      shows,
      new Date("2026-11-01T00:30:00Z"),
    );
    expect(ids(dayAfter.current)).toEqual([]);
    expect(ids(dayAfter.past)).toEqual(["autumn", "spring"]);
  });

  it("makes a show current from the start of its first day", () => {
    const { current, upcoming } = classifyExhibitions(
      shows,
      new Date("2026-11-19T00:00:00Z"),
    );
    expect(ids(current)).toEqual(["winter"]);
    expect(ids(upcoming)).toEqual(["summer-next"]);
  });

  it("orders upcoming soonest first and past most recent first", () => {
    const { upcoming, past } = classifyExhibitions(
      [...shows].reverse(),
      new Date("2028-01-01T00:00:00Z"),
    );
    expect(ids(upcoming)).toEqual([]);
    expect(ids(past)).toEqual(["summer-next", "winter", "autumn", "spring"]);
  });
});

describe("sortNews", () => {
  it("puts the newest post first without mutating the input", () => {
    const post = (id: string, pubDate: string) =>
      ({ id, data: { pubDate: new Date(pubDate) } }) as unknown as NewsPost;
    const input = [
      post("old", "2025-01-01"),
      post("new", "2026-06-01"),
      post("mid", "2025-09-01"),
    ];
    expect(ids(sortNews(input))).toEqual(["new", "mid", "old"]);
    expect(ids(input)).toEqual(["old", "new", "mid"]);
  });
});

describe("sortWorkshops", () => {
  it("lists workshops by slug", () => {
    const workshop = (id: string) => ({ id, data: {} }) as unknown as Workshop;
    expect(
      ids(sortWorkshops([workshop("painting"), workshop("abstract-art")])),
    ).toEqual(["abstract-art", "painting"]);
  });
});
