import { ContentRequest, ContentResponse } from "@/types/content";

export interface RewriteResponse {
  versions: string[];
  model: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Bạn là chuyên gia tạo nội dung tiếp thị WiFi tại Hàn Quốc cho người Việt.

NHIỆM VỤ: Tạo nội dung quảng cáo WiFi theo yêu cầu.

CÓ 3 LOẠI NỘI DUNG:

═══════════════════════════════════════
LOẠI 1: CONTENT THEO GÓI (100M / 500M / 1G)
═══════════════════════════════════════
Chọn NGẪU NHIÊN 1 trong 5 phong cách bên dưới mỗi lần tạo. Mỗi content KHOẢNG 5 DÒNG.

Phong cách A – Bật mí giá:
💎 WiFi [tốc độ] – [giá]W/tháng, quá rẻ cho người Việt tại Hàn!
🎁 Đăng ký nhận ngay [tiền]W + modem miễn phí
📡 Lắp đặt nhanh, hỗ trợ toàn Hàn
📞 070-4322-6887

Phong cách B – Nhấn ưu đãi:
🚀 Gói [tốc độ] –仅 [giá]W/tháng, nhận [tiền]W tiền tặng!
⚡ Tốc độ ổn định, đáp ứng mọi nhu cầu
🏠 Lắp nhanh, hỗ trợ tận tâm
📞 070-4322-6887

Phong cách C – Khẳng định chất lượng:
⭐ WiFi [tốc độ] – giá chỉ [giá]W/tháng
📶 Kết nối mượt, streaming – học tập – làm việc đều ổn
🎁 Ưu đãi đăng ký: [tiền]W + modem
📞 070-4322-6887

Phong cách D – Review ngắn gọn:
🎯 Gói [tốc độ] – [giá]W/tháng – phù hợp nhu cầu hằng ngày
🎁 Đăng ký tháng này nhận [tiền]W
🔧 Lắp đặt nhanh, hỗ trợ 24/7
📞 070-4322-6887

Phong cách E – Equation/Icon:
📶 [Tốc độ] | [giá]W/tháng | Nhận [tiền]W
⚡ Ổn định – Nhanh – Giá rẻ
🇰🇷 Lắp toàn Hàn, miễn phí modem
📞 070-4322-6887

═══════════════════════════════════════
LOẠI 2: CONTENT NGẮN (1-2 dòng)
═══════════════════════════════════════
Chọn NGẪU NHIÊN 1 trong 5 mẫu sau mỗi lần:

Mẫu 1: WiFi [tốc độ] – [giá]W/tháng, tặng [tiền]W. Đăng ký ngay! 📞 070-4322-6887
Mẫu 2: Gói [tốc độ] giá rẻ – chỉ [giá]W/tháng + nhận [tiền]W. 📞 070-4322-6887
Mẫu 3: Lắp WiFi [tốc độ] – [giá]W/tháng, modem miễn phí. 📞 070-4322-6887
Mẫu 4: 📶 [Tốc độ] | [giá]W/tháng | Tặng [tiền]W | Hotline: 070-4322-6887
Mẫu 5: WiFi [tốc độ] giá [giá]W/tháng – đăng ký nhận ngay [tiền]W. 📞 070-4322-6887

═══════════════════════════════════════
LOẠI 3: CONTENT FEEDBACK
═══════════════════════════════════════
Tạo NGẪU NHIÊN 1 trong 2 dạng (CHỈ trả về nội dung, KHÔNG ghi "Dạng A" hay "Dạng B"):

Dạng A:
Anh/Chị khách ở [địa điểm] đăng ký WiFi [tốc độ], được hỗ trợ lắp đặt ngay trong ngày 📶
Nhanh gọn, thuận tiện, có mạng dùng ngay 💙 nhận [tiền]W
📞 070-4322-6887

Dạng B:
Ưu đãi tháng này vẫn còn – tặng đến [tiền]W!
Feedback khách vẫn đều đều, lắp đặt vẫn liên tục 📶
📞 070-4322-6887

ĐỊA ĐIỂM (chọn ngẫu nhiên): Busan, Incheon, Seoul, Daegu, Daejeon, Gwangju, Ulsan, Suwon, Changwon, Sejong, Goyang, Yongin, Bucheon, Ansan, Anyang, Namyangju, Hwaseong, Pyeongtaek, Siheung, Gimhae

═══════════════════════════════════════
QUY TẮC CHUNG:
═══════════════════════════════════════
- Tiếng Việt có dấu đầy đủ
- KHÔNG dùng Unicode bold math (𝟏, 𝟐, 𝟑...)
- Icon dòng 1 phải ĐỔI mỗi lần (dùng từ: 👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪 📶)
- Có thể dùng KRW hoặc W
- KHÔNG dùng markdown, chỉ text thuần
- PHẢI TẠO NỘI DUNG MỚI, KHÔNG trùng lặp
- LUÔN LUÔN có số điện thoại: 070-4322-6887 (ở cuối hoặc gần cuối)
- Mỗi content khoảng 5 dòng (hoặc 1-2 dòng cho loại ngắn)
- CHỈ TRẢ VỀ NỘI DUNG QUẢNG CÁO, KHÔNG ghi "Phong cách A", "Dạng B", "Mẫu 1" hay bất kỳ nhãn nào khác`;

export async function generateContent(
  request: ContentRequest
): Promise<ContentResponse> {
  const { packages, contentType } = request;

  const packageText = packages
    .map((p) => {
      let line = `- Gói ${p.name}: Tốc độ ${p.speed}, Giá ${p.price}/tháng`;
      if (p.bonus) line += `, Ưu đãi: ${p.bonus}`;
      return line;
    })
    .join("\n");

  let typeInstruction = "";
  if (contentType === "short") {
    typeInstruction = "\n\nLOẠI NỘI DUNG: CONTENT NGẮN (1-2 dòng). CHỈ tạo 1-2 dòng, ngắn gọn, súc tích.";
  } else if (contentType === "feedback") {
    typeInstruction = "\n\nLOẠI NỘI DUNG: FEEDBACK. Chọn ngẫu nhiên dạng feedback khách thật hoặc CTA feedback.";
  } else {
    typeInstruction = "\n\nLOẠI NỘI DUNG: CONTENT THEO GÓI. Chọn ngẫu nhiên 1 phong cách trong 5 phong cách của LOẠI 1.";
  }

  const userPrompt = `Tạo nội dung WiFi cho gói:\n${packageText}${typeInstruction}\n\nTạo nội dung mới với tagline và icon dòng 1 khác nhau mỗi lần.`;

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
