import { describe, expect, it } from "vitest";
import { getYear } from "./utils";

describe("getYear", () => {
  it("reads a stored calendar day in UTC, whatever the build machine's zone", () => {
    // Content dates coerce to UTC midnight; west of UTC that instant is
    // still 31 December in local time.
    expect(getYear(new Date("2025-01-01"))).toBe(2025);
    expect(getYear(new Date("2025-12-31T23:59:59Z"))).toBe(2025);
  });
});
