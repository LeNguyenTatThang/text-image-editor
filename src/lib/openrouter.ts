import { ContentRequest, ContentResponse } from "@/types/content";

export interface RewriteResponse {
  versions: string[];
  model: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Bạn là chuyên gia tạo nội dung tiếp thị WiFi tại Hàn Quốc cho người Việt.

NHIỆM VỤ: Tạo nội dung quảng cáo WiFi cho gói cước được yêu cầu.

ĐỊNH DẠNG (tối đa 10 dòng, mỗi dòng 1 icon):
- Dòng 1: [EMOJI] Tên gói + tagline hấp dẫn (HOA tên gói)
- Dòng 2: 🇻🇳 Dành cho người Việt tại Hàn Quốc 🇰🇷
- Dòng 3: 📶 Thông tin tốc độ gói WiFi
- Dòng 4: 🎁 Ưu đãi tiền mặt (KRW)
- Dòng 5: 💰 Giá cước KRW/tháng
- Dòng 6: 📡 Lắp đặt toàn Hàn
- Dòng 7: 💬 Tư vấn tiếng Việt
- Dòng 8: ⏰ Hỗ trợ 24/7
- Dòng 9: ✨ Ưu đãi đăng ký mới
- Dòng 10: 📩 CTA (kêu gọi hành động)

QUY TẮC:
- Mỗi dòng BẮT BUỘC có 1 icon, KHÔNG lặp icon giữa các dòng
- Icon dòng 1 phải ĐỔI mỗi lần tạo (dùng ngẫu nhiên từ: 👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪)
- Viết HOA tên gói ở dòng 1
- Tiếng Việt có dấu đầy đủ, có thể dùng KRW
- KHÔNG dùng markdown, chỉ text thuần
- Tối đa 10 dòng, KHÔNG dòng trống
- PHẢI TẠO NỘI DUNG MỚI, KHÔNG được trùng lặp với các lần trước
- Mỗi lần tạo phải có tagline và icon khác nhau`;

export async function generateContent(
  request: ContentRequest
): Promise<ContentResponse> {
  const { packages } = request;

  const packageText = packages
    .map((p) => {
      let line = `- Gói ${p.name}: Tốc độ ${p.speed}, Giá ${p.price}/tháng`;
      if (p.bonus) line += `, Ưu đãi: ${p.bonus}`;
      return line;
    })
    .join("\n");

  const userPrompt = `Tạo nội dung WiFi cho gói:\n${packageText}\n\nTạo nội dung mới với tagline và icon dòng 1 khác nhau mỗi lần.`;

  const model = "xiaomi/mimo-v2.5";

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://text-image-editor.app",
      "X-OpenRouter-Title": "WiFi Content Generator",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from OpenRouter");
  }

  const content = data.choices[0].message?.content
    ?? data.choices[0].delta?.content
    ?? "";

  if (!content) {
    throw new Error(`Model không trả về nội dung. Response: ${JSON.stringify(data).slice(0, 500)}`);
  }

  return {
    content,
    model: data.model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

const REWRITE_SYSTEM_PROMPT = `Bạn là chuyên gia viết lại nội dung tiếp thị WiFi tại Hàn Quốc cho người Việt.

NHIỆM VỤ: Viết lại đoạn text được cho thành 3 phiên bản khác nhau.

QUY TẮC:
- Mỗi phiên bản viết lại phải có phong cách khác nhau (hấp dẫn, chuyên nghiệp, thân thiện)
- Giữ nguyên ý nghĩa và thông tin quan trọng (giá, tên gói, ưu đãi)
- Ngắn gọn, dễ đọc, phù hợp cho ảnh quảng cáo
- Tiếng Việt có dấu đầy đủ, có thể dùng emoji
- Trả về ĐÚNG 3 phiên bản, phân tách bằng xuống dòng
- KHÔNG đánh số thứ tự, KHÔNG dùng markdown
- Mỗi phiên bản chỉ 1-2 dòng`;

export async function rewriteText(
  text: string,
  context?: string
): Promise<RewriteResponse> {
  const userPrompt = context
    ? `Nội dung trong ảnh: ${context}\n\nĐoạn cần viết lại: "${text}"\n\nViết lại 3 phiên bản:`
    : `Đoạn cần viết lại: "${text}"\n\nViết lại 3 phiên bản:`;

  const model = "xiaomi/mimo-v2.5";

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://text-image-editor.app",
      "X-OpenRouter-Title": "WiFi Text Rewriter",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: REWRITE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from OpenRouter");
  }

  const content = data.choices[0].message?.content
    ?? data.choices[0].delta?.content
    ?? "";

  if (!content) {
    throw new Error("Model không trả về nội dung");
  }

  const versions = content
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .slice(0, 3);

  return {
    versions,
    model: data.model,
  };
}
