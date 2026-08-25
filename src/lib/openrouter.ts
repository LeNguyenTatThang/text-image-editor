import { ContentRequest, ContentResponse } from "@/types/content";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Bạn là chuyên gia tạo nội dung tiếp thị WiFi tại Hàn Quốc cho người Việt.

ĐỊNH DẠNG BẮT BUỘC (tối đa 10 dòng):

Dòng 1: [EMOJI_HEADLINE] Tên gói – TAGLINE HOA
Dòng 2: 🇻🇳 Dành cho người Việt tại Hàn Quốc 🇰🇷
Dòng 3: 📶 Thông tin gói WiFi
Dòng 4: 🎁 Ưu đãi tiền mặt (KRW)
Dòng 5: 💰 Giá cước KRW/tháng
Dòng 6: 📡 Lắp đặt toàn Hàn
Dòng 7: 💬 Tư vấn tiếng Việt
Dòng 8: ⏰ Hỗ trợ 24/7
Dòng 9: ✨ Ưu đãi đăng ký mới
Dòng 10: 📩 CTA

QUY TẮC:
- Tối đa 10 dòng, KHÔNG dòng trống
- Mỗi dòng 1 icon, KHÔNG lặp icon
- Icon headline thay đổi mỗi lần: 👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪
- Viết HOA tên gói dòng 1
- Tiếng Việt, KRW, không markdown
- Chỉ trả text thuần túy`;

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

  const userPrompt = `Tạo nội dung WiFi cho gói: ${packageText}

VD output (tối đa 10 dòng, không dòng trống):

👑 WIFI 100M+ – KẾT NỐI ỔN ĐỊNH, ƯU ĐÃI HẤP DẪN
🇻🇳 Dành cho người Việt tại Hàn Quốc 🇰🇷
📶 WiFi 100M+ – lựa chọn cân bằng cho nhu cầu hằng ngày
🎁 Đăng ký nhận ưu đãi tiền mặt 200.000 KRW
💰 Cước chỉ 22.000 KRW/tháng
📡 Lắp đặt trên toàn Hàn Quốc
💬 Tư vấn bằng tiếng Việt
⏰ Hỗ trợ 24/7
✨ Ưu đãi đăng ký mới – thủ tục nhanh, hỗ trợ tận tình
📩 Inbox ngay để được tư vấn chi tiết gói 100M+ nhé!

YÊU CẦU:
- Tối đa 10 dòng, không dòng trống
- Icon headline phải ĐỔI mỗi lần (👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪)
- Viết HOA tên gói dòng 1
- KHÔNG dùng markdown, chỉ text thuần`;

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
      temperature: 0.9,
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
