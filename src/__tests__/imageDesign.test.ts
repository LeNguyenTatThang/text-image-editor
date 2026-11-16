import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateDesignImage,
  isDesignFeatureAvailable,
} from "@/lib/imageDesign";

function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateDesignImage", () => {
  it("sends a compact Recraft request and returns a data URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({
        data: [{ b64_json: "abc123", media_type: "image/webp" }],
        usage: { total_tokens: 4191 },
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await generateDesignImage({
      content: "WiFi 500M\n27.500₩",
      style: "promo",
      aspectRatio: "4:3",
      colors: ["#1677FF"],
      backgroundColor: "#020B2D",
    });

    expect(result.dataUrl).toBe("data:image/webp;base64,abc123");
    expect(result.usage?.totalTokens).toBe(4191);

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string
    );

    expect(body.model).toBe("recraft/recraft-v4.1-flash-v2:free");
    expect(body.aspect_ratio).toBe("4:3");
    expect(body.n).toBe(1);
    expect(body.prompt).toContain("WiFi 500M\n27.500₩");
    expect(body.prompt).not.toContain("#1677FF");
    expect(body.provider.options.recraft.controls.colors).toEqual([
      { rgb: [22, 119, 255] },
    ]);
    expect(body.provider.options.recraft.controls.background_color).toEqual({
      rgb: [2, 11, 45],
    });
  });

  it("trims content to the token-saving limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({ data: [{ b64_json: "abc", media_type: "image/png" }] })
    );

    vi.stubGlobal("fetch", fetchMock);

    await generateDesignImage({ content: "x".repeat(2000) });

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string
    );

    expect(body.prompt.endsWith("x".repeat(700))).toBe(true);
    expect(body.prompt).not.toContain("x".repeat(701));
  });

  it("throws when content is empty", async () => {
    await expect(generateDesignImage({ content: "   " })).rejects.toThrow(
      "Nội dung trống"
    );
  });
});

describe("isDesignFeatureAvailable", () => {
  it("stays available before 28/11/2026", () => {
    expect(isDesignFeatureAvailable(new Date("2026-11-27T23:59:59+07:00"))).toBe(
      true
    );
  });

  it("locks from 28/11/2026", () => {
    expect(isDesignFeatureAvailable(new Date("2026-11-28T00:00:00+07:00"))).toBe(
      false
    );
    expect(isDesignFeatureAvailable(new Date("2026-12-01T00:00:00+07:00"))).toBe(
      false
    );
  });
});
