import { describe, expect, it, vi } from "vitest";
import { submitForm } from "./submit";

describe("submitForm", () => {
  it("runs in demo mode without an endpoint and does not call fetch", async () => {
    const fetchImpl = vi.fn();
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await expect(
      submitForm(undefined, { email: "a@b.c" }, fetchImpl),
    ).resolves.toBe("demo");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalled();
    info.mockRestore();
  });

  it("posts JSON to the endpoint without the honeypot field", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await expect(
      submitForm(
        "https://formspree.io/f/abc",
        { email: "a@b.c", website: "" },
        fetchImpl,
      ),
    ).resolves.toBe("sent");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://formspree.io/f/abc");
    expect(JSON.parse(init.body as string)).toEqual({ email: "a@b.c" });
    expect((init.headers as Record<string, string>).Accept).toBe(
      "application/json",
    );
  });

  it("drops submissions that filled the honeypot", async () => {
    const fetchImpl = vi.fn();
    await expect(
      submitForm(
        "https://x",
        { email: "a@b.c", website: "http://spam" },
        fetchImpl,
      ),
    ).resolves.toBe("spam");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("throws on a non-2xx response", async () => {
    const fetchImpl = vi.fn(async () => new Response("no", { status: 500 }));
    await expect(
      submitForm("https://x", { email: "a@b.c" }, fetchImpl),
    ).rejects.toThrow(/500/);
  });
});
