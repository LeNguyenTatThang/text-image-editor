import { describe, it, expect, vi, afterEach } from "vitest";
import { generateContent } from "@/lib/openrouter";
import { ContentRequest } from "@/types/content";

function errorResponse(status: number, body: unknown): Response {
  return {
    ok: false,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

const request: ContentRequest = {
  packages: [{ name: "500M", speed: "500Mbps", price: "27.500₩" }],
  contentType: "package",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateContent model fallback", () => {
  it("falls back to openrouter/free when credits are insufficient", async () => {
    const creditsError = {
      error: {
        message:
          "This request requires more credits, or fewer max_tokens. You requested up to 512 tokens, but can only afford 20.",
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(402, creditsError))
      .mockResolvedValueOnce(errorResponse(402, creditsError))
      .mockResolvedValueOnce(errorResponse(402, creditsError))
      .mockResolvedValueOnce(
        okResponse({
          model: "upstage/solar-pro-3:free",
          choices: [{ message: { content: "⚡ Nội dung\n🎁 Quà tặng" } }],
        })
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await generateContent(request);

    expect(result.content).toBe("⚡ Nội dung\n🎁 Quà tặng");
    expect(result.model).toBe("upstage/solar-pro-3:free");

    const models = fetchMock.mock.calls.map(
      ([, init]) => JSON.parse((init as RequestInit).body as string).model
    );
    expect(models).toEqual([
      "xiaomi/mimo-v2.6-flash",
      "xiaomi/mimo-v2.5",
      "openai/gpt-4o-mini",
      "openrouter/free",
    ]);
  });

  it("reduces max_tokens when the remaining credits are still usable", async () => {
    const affordableError = {
      error: { message: "You requested up to 512 tokens, but can only afford 300." },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(402, affordableError))
      .mockResolvedValueOnce(
        okResponse({
          model: "xiaomi/mimo-v2.6-flash",
          choices: [{ message: { content: "Nội dung" } }],
        })
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await generateContent(request);

    expect(result.content).toBe("Nội dung");

    const bodies = fetchMock.mock.calls.map(([, init]) =>
      JSON.parse((init as RequestInit).body as string)
    );
    expect(bodies[0].max_tokens).toBe(512);
    expect(bodies[1].max_tokens).toBe(270);
    expect(bodies[1].model).toBe("xiaomi/mimo-v2.6-flash");
  });
});
