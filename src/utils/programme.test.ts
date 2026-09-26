import { describe, expect, it } from "vitest";
import * as fixtures from "@/test/fixtures";
import {
  classifyExhibitions,
  exhibitionStatus,
  presentExhibition,
  presentNews,
  presentWorkshop,
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

describe("presentExhibition", () => {
  const show = fixtures.exhibition("autumn", {
    title: { en: "Autumn", fr: "Automne" },
    timeline: { en: "Sept 3 – Oct 31, 2026" },
    startDate: new Date("2026-09-03"),
    endDate: new Date("2026-10-31"),
    openingHours: [{ day: { en: "Mon", de: "Mo" }, hours: "10–18" }],
  });

  it("shows the timeline until the show closes, then the year", () => {
    const during = presentExhibition(show, "fr", new Date("2026-10-01"));
    expect(during).toMatchObject({
      status: "current",
      title: "Automne",
      dateline: "Sept 3 – Oct 31, 2026",
      href: "/fr/exhibitions/autumn",
    });
    expect(presentExhibition(show, "en", new Date("2026-08-01")).dateline).toBe(
      "Sept 3 – Oct 31, 2026",
    );
    const after = presentExhibition(show, "en", new Date("2027-01-01"));
    expect(after).toMatchObject({ status: "past", dateline: "2026" });
  });

  it("agrees with classifyExhibitions on status", () => {
    const now = new Date("2026-10-31T23:30:00Z");
    expect(exhibitionStatus(show, now)).toBe("current");
    expect(classifyExhibitions([show], now).current).toEqual([show]);
  });

  it("dates a show that opens on 1 January in its own year", () => {
    const newYear = fixtures.exhibition("new-year", {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
    });
    expect(
      presentExhibition(newYear, "en", new Date("2026-01-01")).dateline,
    ).toBe("2025");
  });

  it("localises opening hours, falling back to the default locale", () => {
    expect(presentExhibition(show, "de").openingHours).toEqual([
      { day: "Mo", hours: "10–18" },
    ]);
    expect(presentExhibition(show, "fr").openingHours[0].day).toBe("Mon");
  });
});

describe("presentWorkshop", () => {
  it("resolves the href and leaves the video out when there is none", () => {
    expect(presentWorkshop(fixtures.workshop("painting"), "de")).toMatchObject({
      href: "/de/workshops/painting",
      title: "painting (en)",
      video: null,
      image: null,
    });
  });
});

describe("presentNews", () => {
  it("carries the date and the date as printed for the locale", () => {
    const p = presentNews(
      fixtures.news("opening", { pubDate: new Date("2025-03-15T09:30:00Z") }),
      "de",
    );
    expect(p).toMatchObject({
      href: "/de/news/opening",
      dateLabel: "15.03.25",
    });
    expect(p.date.toISOString()).toBe("2025-03-15T09:30:00.000Z");
  });
});
