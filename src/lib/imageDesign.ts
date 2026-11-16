export type DesignStyle = "promo" | "minimal" | "bold" | "tech" | "premium";

export type DesignAspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export interface DesignRequest {
  content: string;
  style?: DesignStyle;
  aspectRatio?: DesignAspectRatio;
  colors?: string[];
  backgroundColor?: string;
}

export interface DesignResponse {
  dataUrl: string;
  mediaType: string;
  model: string;
  usage?: {
    totalTokens: number;
  };
}

const IMAGE_API_URL = "https://openrouter.ai/api/v1/images";
const DESIGN_MODEL = "recraft/recraft-v4.1-flash-v2:free";
const MAX_CONTENT_CHARS = 700;

export const DESIGN_LOCK_DATE_LABEL = "28/11/2026";

const DESIGN_CUTOFF_TIME = new Date("2026-11-28T00:00:00+07:00").getTime();

export function isDesignFeatureAvailable(now: Date = new Date()): boolean {
  return now.getTime() < DESIGN_CUTOFF_TIME;
}

const STYLE_PROMPTS: Record<DesignStyle, string> = {
  promo: "vibrant promotional poster, bold headline, clean balanced layout, high contrast",
  minimal: "minimal flat design, generous whitespace, subtle accents, elegant typography",
  bold: "high-impact sale banner, very large bold typography, energetic composition",
  tech: "modern technology theme, fiber-optic glow, sleek gradients, futuristic",
  premium: "premium elegant design, refined typography, luxury feel",
};

interface OpenRouterImageResponse {
  data?: Array<{
    b64_json?: string;
    media_type?: string;
  }>;
  usage?: {
    total_tokens?: number;
  };
}

function hexToRgb(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(value)) {
    return [
      parseInt(value[0] + value[0], 16),
      parseInt(value[1] + value[1], 16),
      parseInt(value[2] + value[2], 16),
    ];
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }

  return null;
}

export function buildDesignPrompt(content: string, style: DesignStyle): string {
  return `Create a social media advertising image. Design style: ${STYLE_PROMPTS[style]}. Keep all text large and readable. Render the following text EXACTLY as written, preserving Vietnamese diacritics, emojis, numbers, and line breaks. Do not add, translate, paraphrase, or invent any text:\n${content}`;
}

export async function generateDesignImage(
  request: DesignRequest
): Promise<DesignResponse> {
  if (!isDesignFeatureAvailable()) {
    throw new Error(
      `Tính năng tạo thiết kế đã khóa từ ${DESIGN_LOCK_DATE_LABEL} vì API Recraft đóng.`
    );
  }

  const content = request.content.trim().slice(0, MAX_CONTENT_CHARS);

  if (!content) {
    throw new Error("Nội dung trống");
  }

  const style = request.style && request.style in STYLE_PROMPTS
    ? request.style
    : "promo";

  const controls: Record<string, unknown> = {};

  const colors = (request.colors ?? [])
    .map(hexToRgb)
    .filter((rgb): rgb is [number, number, number] => rgb !== null);

  if (colors.length > 0) {
    controls.colors = colors.map((rgb) => ({ rgb }));
  }

  const background = request.backgroundColor
    ? hexToRgb(request.backgroundColor)
    : null;

  if (background) {
    controls.background_color = { rgb: background };
  }

  const body: Record<string, unknown> = {
    model: DESIGN_MODEL,
    prompt: buildDesignPrompt(content, style),
    aspect_ratio: request.aspectRatio ?? "1:1",
    n: 1,
  };

  if (Object.keys(controls).length > 0) {
    body.provider = {
      options: {
        recraft: { controls },
      },
    };
  }

  const response = await fetch(IMAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://text-image-editor.app",
      "X-OpenRouter-Title": "WiFi Design Image",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `OpenRouter image API error: ${response.status}`;

    try {
      const parsed = JSON.parse(errorText) as {
        error?: { message?: string } | string;
      };
      if (typeof parsed.error === "string") {
        message = parsed.error;
      } else if (parsed.error?.message) {
        message = parsed.error.message;
      }
    } catch {
      if (errorText) message = errorText;
    }

    throw new Error(message);
  }

  const data = (await response.json()) as OpenRouterImageResponse;
  const image = data.data?.[0];

  if (!image?.b64_json) {
    throw new Error("Model không trả về hình ảnh");
  }

  const mediaType = image.media_type ?? "image/png";

  return {
    dataUrl: `data:${mediaType};base64,${image.b64_json}`,
    mediaType,
    model: DESIGN_MODEL,
    usage: data.usage?.total_tokens
      ? { totalTokens: data.usage.total_tokens }
      : undefined,
  };
}
