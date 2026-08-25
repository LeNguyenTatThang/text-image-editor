import { ContentRequest, ContentResponse } from "@/types/content";

export interface RewriteResponse {
  versions: string[];
  model: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Bạn là chuyên gia tạo nội dung tiếp thị WiFi tại Hàn Quốc cho người Việt.

NHIỆM VỤ: Tạo nội dung quảng cáo WiFi cho gói cước được yêu cầu.

BẠN CÓ THỂ CHỌN 1 TRONG CÁC PHONG CÁCH SAU (chọn ngẫu nhiên mỗi lần):

PHONG CÁCH 1 – Ngắn gọn, Equation (5-7 dòng):
🔥 LẮP WIFI – NHẬN NGAY 200.000W TIỀN! 🔥
📶 Wifi tốc độ cao, kết nối ổn định
💰 Cước chỉ 22.000W/tháng
🎁 TẶNG NGAY 200.000W TIỀN khi lắp đặt!
Phù hợp cho người Việt tại Hàn Quốc 🇰🇷
📞 Liên hệ ngay để nhận ưu đãi!
👉 Đăng ký ngay!

PHONG CÁCH 2 – Chi tiết, bulleted (8-10 dòng):
🔥 WIFI 500M – TỐC ĐỘ VƯỢT TRỘI, ƯU ĐÃI CỰC LỚN
🇻🇳 Dành cho người Việt tại Hàn Quốc 🇰🇷
📶 WiFi 500Mbps – tốc độ nhanh, kết nối mượt mà
🎁 Đăng ký nhận ưu đãi tiền mặt 300.000 KRW
💰 Cước chỉ 33.000 KRW/tháng
📡 Lắp đặt trên toàn Hàn Quốc
💬 Tư vấn bằng tiếng Việt
⏰ Hỗ trợ 24/7
✨ Ưu đãi đăng ký mới – thủ tục nhanh, hỗ trợ tận tình
📩 Inbox ngay để được tư vấn chi tiết!

PHONG CÁCH 3 – Khuyến mãi lớn,张先生 (7-9 dòng):
💥 Chỉ với 22.000W/tháng, bạn đã có thể sở hữu đường truyền Internet tốc độ cao.
🎁 ĐẶC BIỆT: TẶNG NGAY 200.000W vào tài khoản khi đăng ký mới.
✨ Quyền lợi khi lắp đặt:
⚡ Tốc độ nhanh, lướt web mượt mà.
📡 Kết nối ổn định, hạn chế giật lag.
📞 Hotline đăng ký: [SĐT]
🔥 Chi phí nhỏ – Ưu đãi lớn – Đăng ký ngay!

PHONG CÁCH 4 – Dài, chi tiết quyền lợi (9-12 dòng):
🚀 LẮP WiFi NGAY HÔM NAY – ƯU ĐÃI CÀNG ĐĂNG KÝ CÀNG HỜI!
📶 Chỉ với [giá]W/tháng, bạn đã có thể sở hữu đường truyền Internet tốc độ cao.
🎁 ĐẶC BIỆT: TẶNG NGAY [tiền]W vào tài khoản khi đăng ký mới.
✨ Quyền lợi khi lắp đặt:
⚡ Tốc độ nhanh, lướt web mượt mà.
📡 Kết nối ổn định, hạn chế giật lag.
🛠️ Lắp đặt nhanh – Hỗ trợ kỹ thuật tận tâm.
🏠 Phù hợp cho gia đình, học tập, làm việc và giải trí.
📞 Hotline đăng ký: [SĐT]
🔥 Chi phí nhỏ – Ưu đãi lớn – Đăng ký ngay!

QUY TẮC:
- Chọn NGẪU NHIÊN 1 phong cách mỗi lần tạo
- Tiếng Việt có dấu đầy đủ, KHÔNG dùng Unicode bold math (𝟏, 𝟐, 𝟑...)
- Icon dòng 1 phải ĐỔI mỗi lần (dùng từ: 👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪)
- Viết HOA tên gói ở dòng 1
- Có thể dùng KRW, W
- KHÔNG dùng markdown, chỉ text thuần
- PHẢI TẠO NỘI DUNG MỚI, KHÔNG trùng lặp`;

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
