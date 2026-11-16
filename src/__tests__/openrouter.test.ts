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

    const fetchMock = vi.fn();
    for (let i = 0; i < 9; i++) {
      fetchMock.mockResolvedValueOnce(errorResponse(402, creditsError));
    }
    fetchMock.mockResolvedValueOnce(
      okResponse({
        model: "openrouter/free",
        choices: [{ message: { content: "⚡ Nội dung\n🎁 Quà tặng" } }],
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await generateContent(request);

    expect(result.content).toBe("⚡ Nội dung\n🎁 Quà tặng");
    expect(result.model).toBe("openrouter/free");

    const models = fetchMock.mock.calls.map(
      ([, init]) => JSON.parse((init as RequestInit).body as string).model
    );
    expect(models).toEqual([
      "dots-studio/dots-3-note-preview:free",
      "particle-ai/particle-1:free",
      "cohere/north-mini-code:free",
      "recursive/flint-v1.0:free",
      "inclusionai/ling-3.2-flash:free",
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-31b-it:free",
      "liquid/lfm-3-1.7b:free",
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
          model: "dots-studio/dots-3-note-preview:free",
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
    expect(bodies[1].model).toBe("dots-studio/dots-3-note-preview:free");
  });

  it("skips models gated behind agentic harnesses", async () => {
    const gatedError = {
      error: {
        message:
          "dots-studio/dots-3-note-preview:free is only available on agentic harnesses.",
        code: 403,
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(403, gatedError))
      .mockResolvedValueOnce(
        okResponse({
          model: "particle-ai/particle-1:free",
          choices: [{ message: { content: "Nội dung mới" } }],
        })
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await generateContent(request);

    expect(result.content).toBe("Nội dung mới");
    expect(result.model).toBe("particle-ai/particle-1:free");

    const models = fetchMock.mock.calls.map(
      ([, init]) => JSON.parse((init as RequestInit).body as string).model
    );
    expect(models).toEqual([
      "dots-studio/dots-3-note-preview:free",
      "particle-ai/particle-1:free",
    ]);
  });
});
