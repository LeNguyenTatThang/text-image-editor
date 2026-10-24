import { ContentRequest, ContentResponse } from "@/types/content";

export interface RewriteResponse {
  versions: string[];
  model: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const CONTENT_MODELS = [
  "xiaomi/mimo-v2.6-flash",
  "xiaomi/mimo-v2.5",
  "openai/gpt-4o-mini",
];

const SYSTEM_PROMPT = `Bạn là chuyên gia tạo nội dung tiếp thị WiFi tại Hàn Quốc cho người Việt.

NHIỆM VỤ: Tạo nội dung quảng cáo WiFi theo yêu cầu.

CÓ 5 LOẠI NỘI DUNG:

═══════════════════════════════════════
LOẠI 1: CONTENT THEO GÓI (100M / 500M / 1G)
═══════════════════════════════════════
Chọn NGẪU NHIÊN 1 trong 5 phong cách bên dưới mỗi lần tạo. Mỗi content KHOẢNG 5 DÒNG.

Phong cách A – Bật mí giá:
💎 WiFi [tốc độ] – [giá]원/tháng, quá rẻ cho người Việt tại Hàn!
🎁 Đăng ký nhận ngay [tiền]원 + modem miễn phí
📡 Lắp đặt nhanh, hỗ trợ toàn Hàn
📞 070-4322-6887

Phong cách B – Nhấn ưu đãi:
🚀 Gói [tốc độ] –仅 [giá]원/tháng, nhận [tiền]원 tiền tặng!
⚡ Tốc độ ổn định, đáp ứng mọi nhu cầu
🏠 Lắp nhanh, hỗ trợ tận tâm
📞 070-4322-6887

Phong cách C – Khẳng định chất lượng:
⭐ WiFi [tốc độ] – giá chỉ [giá]원/tháng
📶 Kết nối mượt, streaming – học tập – làm việc đều ổn
🎁 Ưu đãi đăng ký: [tiền]원 + modem
📞 070-4322-6887

Phong cách D – Review ngắn gọn:
🎯 Gói [tốc độ] – [giá]원/tháng – phù hợp nhu cầu hằng ngày
🎁 Đăng ký tháng này nhận [tiền]원
🔧 Lắp đặt nhanh, hỗ trợ 24/7
📞 070-4322-6887

Phong cách E – Equation/Icon:
📶 [Tốc độ] | [giá]원/tháng | Nhận [tiền]원
⚡ Ổn định – Nhanh – Giá rẻ
🇰🇷 Lắp toàn Hàn, miễn phí modem
📞 070-4322-6887

═══════════════════════════════════════
LOẠI 2: CONTENT NGẮN (1-2 dòng)
═══════════════════════════════════════
Chọn NGẪU NHIÊN 1 trong 15 mẫu sau mỗi lần:

Mẫu 1: WiFi [tốc độ] – [giá]원/tháng, tặng [tiền]원. Đăng ký ngay! 📞 070-4322-6887
Mẫu 2: Gói [tốc độ] giá rẻ – chỉ [giá]원/tháng + nhận [tiền]원. 📞 070-4322-6887
Mẫu 3: Lắp WiFi [tốc độ] – [giá]원/tháng, modem miễn phí. 📞 070-4322-6887
Mẫu 4: 📶 [Tốc độ] | [giá]원/tháng | Tặng [tiền]원 | Hotline: 070-4322-6887
Mẫu 5: WiFi [tốc độ] giá [giá]원/tháng – đăng ký nhận ngay [tiền]원. 📞 070-4322-6887
Mẫu 6: ⚡ [Tốc độ] chỉ [giá]원/tháng – tặng [tiền]원, lắp trong ngày. 📞 070-4322-6887
Mẫu 7: 🏆 WiFi [tốc độ] giá tốt nhất – [giá]원/tháng, quà [tiền]원. 📞 070-4322-6887
Mẫu 8: 🔥 Chốt ngay [tốc độ] – [giá]원/tháng, nhận [tiền]원 + modem miễn phí. 📞 070-4322-6887
Mẫu 9: 📶 [Tốc độ] – [giá]원/tháng – [tiền]원 quà tặng – hỗ trợ 24/7: 070-4322-6887
Mẫu 10: 🎁 Đăng ký WiFi [tốc độ] nhận [tiền]원, chỉ [giá]원/tháng. 📞 070-4322-6887
Mẫu 11: 🇰🇷 WiFi [tốc độ] cho người Việt – [giá]원/tháng, tặng [tiền]원, lắp toàn Hàn. 📞 070-4322-6887
Mẫu 12: 💎 [Tốc độ] siêu rẻ: [giá]원/tháng, tặng ngay [tiền]원. Gọi 070-4322-6887
Mẫu 13: 🚀 Lắp WiFi [tốc độ] hôm nay – [giá]원/tháng, quà [tiền]원, không phí lắp. 📞 070-4322-6887
Mẫu 14: 📞 Gọi ngay 070-4322-6887 – WiFi [tốc độ] [giá]원/tháng, tặng [tiền]원!
Mẫu 15: ✅ WiFi [tốc độ] – [giá]원/tháng – tặng [tiền]원 – modem miễn phí. 📞 070-4322-6887

═══════════════════════════════════════
LOẠI 3: CONTENT FEEDBACK
═══════════════════════════════════════
Tạo NGẪU NHIÊN 1 trong 12 dạng (CHỈ trả về nội dung, KHÔNG ghi "Dạng A", "Dạng B"...):

Dạng A:
Anh/Chị khách ở [địa điểm] đăng ký WiFi [tốc độ], được hỗ trợ lắp đặt ngay trong ngày 📶
Nhanh gọn, thuận tiện, có mạng dùng ngay 💙 nhận [tiền]원
📞 070-4322-6887

Dạng B:
Ưu đãi tháng này vẫn còn – tặng đến [tiền]원!
Feedback khách vẫn đều đều, lắp đặt vẫn liên tục 📶
📞 070-4322-6887

Dạng C:
Khách bên [địa điểm] vừa lắp xong WiFi [tốc độ] trong buổi sáng ☀️
Dùng thử đã thấy mượt, lại còn nhận [tiền]원 🎁
📞 070-4322-6887

Dạng D:
"Lắp nhanh thật, gọi là có ngay!" – khách ở [địa điểm] chia sẻ sau khi dùng WiFi [tốc độ] 🙌
Ưu đãi [tiền]원 vẫn đang áp dụng
📞 070-4322-6887

Dạng E:
Feedback từ khách [địa điểm]: WiFi [tốc độ] ổn định, xem phim không giật 📺
Đăng ký hôm nay nhận thêm [tiền]원 💰
📞 070-4322-6887

Dạng F:
Khách mới ở [địa điểm] chốt gói [tốc độ] chỉ trong 1 cuộc gọi ☎️
Lắp trong ngày, tặng [tiền]원, modem miễn phí 📶
📞 070-4322-6887

Dạng G:
Gia đình anh/chị ở [địa điểm] vừa có WiFi [tốc độ] dùng cho cả nhà 👨‍👩‍👧‍👦
Ưu đãi [tiền]원 được cộng ngay khi ký hợp đồng
📞 070-4322-6887

Dạng H:
Khách [địa điểm] ban đầu phân vân, dùng thử WiFi [tốc độ] là chốt luôn 🤝
Giá [giá]원/tháng, tặng [tiền]원
📞 070-4322-6887

Dạng I:
Feedback thực tế: lắp WiFi [tốc độ] ở [địa điểm] chưa đến 24h ⏱️
Nhân viên hỗ trợ nhiệt tình, quà [tiền]원 trao tay 🎁
📞 070-4322-6887

Dạng J:
Khách ở [địa điểm] vừa gửi lời cảm ơn vì được lắp WiFi [tốc độ] trong ngày 💙
Còn được tặng [tiền]원, quá hời cho người Việt tại Hàn
📞 070-4322-6887

Dạng K:
Hai khách ở [địa điểm] rủ nhau lắp WiFi [tốc độ] cùng lúc 📶
Ai cũng nhận [tiền]원, lắp gọn trong buổi chiều
📞 070-4322-6887

Dạng L:
Khách [địa điểm] đổi sang WiFi [tốc độ], dùng tháng đầu đã hài lòng ✅
Đăng ký ngay nhận [tiền]원 + hỗ trợ tận nhà
📞 070-4322-6887

ĐỊA ĐIỂM (chọn ngẫu nhiên): Busan, Incheon, Seoul, Daegu, Daejeon, Gwangju, Ulsan, Suwon, Changwon, Sejong, Goyang, Yongin, Bucheon, Ansan, Anyang, Namyangju, Hwaseong, Pyeongtaek, Siheung, Gimhae

═══════════════════════════════════════
LOẠI 4: CONTENT GÓI 1 NĂM (100M / 500M / 1G)
═══════════════════════════════════════
Đây là gói cước THỜI HẠN 1 NĂM. BẮT BUỘC nhắc đến "1 năm" trong content.
Chọn NGẪU NHIÊN 1 trong 5 phong cách bên dưới mỗi lần tạo. Mỗi content KHOẢNG 5 DÒNG.
Dùng ĐÚNG giá và quà tặng của gói 1 năm được cung cấp trong yêu cầu. Nếu quà tặng là modem miễn phí thì CHỈ nhắc modem, KHÔNG bịa ra số tiền.

Phong cách A – Bật mí giá 1 năm:
👑 WiFi [tốc độ] gói 1 năm – [giá]원/tháng, quá rẻ cho người Việt tại Hàn!
🎁 Đăng ký nhận ngay [quà tặng]
📡 Lắp đặt nhanh, hỗ trợ toàn Hàn
📞 070-4322-6887

Phong cách B – Nhấn quà tặng:
🔥 Gói [tốc độ] cam kết 1 năm – chỉ [giá]원/tháng
🎁 Quà tặng đặc biệt: [quà tặng] + modem miễn phí
⚡ Tốc độ ổn định, tiết kiệm hơn khi chốt cả năm
🏠 Lắp nhanh, hỗ trợ tận tâm
📞 070-4322-6887

Phong cách C – Khẳng định chất lượng:
⭐ WiFi [tốc độ] 1 năm – giá chỉ [giá]원/tháng
📶 Kết nối mượt, streaming – học tập – làm việc đều ổn
🎁 Ưu đãi gói 1 năm: [quà tặng]
📞 070-4322-6887

Phong cách D – Review ngắn gọn:
🎯 Gói 1 năm [tốc độ] – [giá]원/tháng – giá tốt chốt cả năm
🎁 Đăng ký nhận ngay [quà tặng]
🔧 Lắp đặt nhanh, hỗ trợ 24/7
📞 070-4322-6887

Phong cách E – Equation/Icon:
📶 [Tốc độ] 1N | [giá]원/tháng | [quà tặng]
⚡ Ổn định – Tiết kiệm – Giá rẻ
🇰🇷 Lắp toàn Hàn, miễn phí modem
📞 070-4322-6887

═══════════════════════════════════════
LOẠI 5: CONTENT SIM (SK / LG)
═══════════════════════════════════════
LOẠI 5 DÙNG UNICODE BOLD cho tên nhà mạng và số liệu (như mẫu), ví dụ: 𝐒𝐈𝐌 𝐒𝐊, 𝐋𝐆, 𝟐𝟓𝐆𝐁, 𝟏𝟖.𝟕𝟓𝟎 ₩, 𝟎𝟕𝟎-𝟒𝟑𝟐𝟐-𝟔𝟖𝟖𝟕
LOẠI 1–4 thì KHÔNG dùng Unicode bold.
Dùng ĐÚNG nhà mạng, tên gói, data, giá và quà tặng trong yêu cầu. KHÔNG bịa thông tin.
Chọn NGẪU NHIÊN 1 trong 5 phong cách bên dưới mỗi lần tạo. Mỗi content KHOẢNG 6 DÒNG.
Nếu quà tặng bằng 0 thì bỏ qua dòng quà tặng.

Phong cách A – Mẫu chuẩn:
📱 𝐒𝐈𝐌 [nhà mạng] Hàn Quốc – Kết nối thoải mái, dùng cực tiện!
📞 Gọi & nhắn tin thoải mái mỗi ngày
🌐 [data] tốc độ cao
💰 Chỉ [giá] ₩/tháng
☎️ Đăng ký ngay: 𝟎𝟕𝟎-𝟒𝟑𝟐𝟐-𝟔𝟖𝟖𝟕
🇰🇷 Phù hợp cho du học sinh, người lao động và người Việt tại Hàn Quốc.

Phong cách B – Nhấn quà tặng:
🔥 SIM [nhà mạng] – gói [tên gói], data [data]
💰 Chỉ [giá] ₩/tháng
🎁 Khách mới nhận [quà mới] ₩, chuyển mạng giữ số nhận [quà MNP] ₩
📶 Gọi không giới hạn, SMS thoải mái
☎️ Đăng ký ngay: 𝟎𝟕𝟎-𝟒𝟑𝟐𝟐-𝟔𝟖𝟖𝟕

Phong cách C – Dành cho người Việt:
⭐ 𝐒𝐈𝐌 [nhà mạng] Hàn Quốc cho người Việt
🌐 [data] dùng thỏa thích, hết data vẫn lướt được
💰 [giá] ₩/tháng + quà tặng [quà mới] ₩
🔧 Thủ tục nhanh, hỗ trợ tiếng Việt
☎️ 070-4322-6887

Phong cách D – Review ngắn gọn:
🎯 Gói [tên gói] ([nhà mạng]) – data [data]
💰 Chỉ [giá] ₩/tháng
🎁 Ưu đãi: [quà mới] ₩ (MNP: [quà MNP] ₩)
📞 070-4322-6887

Phong cách E – Equation/Icon:
📱 SIM [nhà mạng] | [data] | [giá] ₩/tháng
⚡ Gọi thoải mái – Data khỏe – Giá rẻ
🎁 Tặng [quà mới] ₩ khi đăng ký mới
☎️ 070-4322-6887

═══════════════════════════════════════
QUY TẮC CHUNG:
═══════════════════════════════════════
- Tiếng Việt có dấu đầy đủ
- KHÔNG dùng Unicode bold math (𝟏, 𝟐, 𝟑...) cho LOẠI 1–4; RIÊNG LOẠI 5 PHẢI dùng
- Icon dòng 1 phải ĐỔI mỗi lần (dùng từ: 👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪 📶 📱)
- Đơn vị tiền tệ: chỉ dùng đơn vị tiền Hàn — KRW, won hoặc ₩ (ký hiệu won Hàn). KHÔNG dùng đồng Việt, ₫, VND, hay "W" đứng riêng
- KHÔNG dùng markdown, chỉ text thuần
- PHẢI TẠO NỘI DUNG MỚI, KHÔNG trùng lặp
- LUÔN LUÔN có số điện thoại: 070-4322-6887 (ở cuối hoặc gần cuối)
- Mỗi content khoảng 5 dòng (hoặc 1-2 dòng cho loại ngắn, 6 dòng cho loại SIM)
- CHỈ TRẢ VỀ NỘI DUNG QUẢNG CÁO, KHÔNG ghi "Phong cách A", "Dạng B", "Mẫu 1" hay bất kỳ nhãn nào khác`;

export async function generateContent(
  request: ContentRequest
): Promise<ContentResponse> {
  const { packages, contentType, sim } = request;

  const isSim = contentType === "sim" && !!sim;

  const packageText = (packages ?? [])
    .map((p) => {
      let line = `- Gói ${p.name}: Tốc độ ${p.speed}, Giá ${p.price}/tháng`;
      if (contentType === "package1year") {
        line += `, Thời hạn: 1 năm, Quà tặng: ${p.bonus || "Modem miễn phí"}`;
      } else if (p.bonus) {
        line += `, Ưu đãi: ${p.bonus}`;
      }
      return line;
    })
    .join("\n");

  const simText = sim
    ? [
        `- Nhà mạng: ${sim.carrier}`,
        `- Tên gói: ${sim.plan}`,
        `- Chính sách: ${sim.policy}`,
        `- Data: ${sim.data}`,
        `- Gọi: ${sim.calls}`,
        `- SMS: ${sim.texts}`,
        `- Giá/tháng (sau giảm): ${sim.price}`,
        `- Quà tặng khách đăng ký mới: ${sim.bonusNew || "0"}`,
        `- Quà tặng chuyển mạng giữ số (MNP): ${sim.bonusMnp || "0"}`,
      ].join("\n")
    : "";

  let typeInstruction = "";
  if (contentType === "short") {
    typeInstruction = "\n\nLOẠI NỘI DUNG: CONTENT NGẮN (1-2 dòng). Chọn ngẫu nhiên 1 trong 15 mẫu của LOẠI 2, CHỈ tạo 1-2 dòng, ngắn gọn, súc tích.";
  } else if (contentType === "feedback") {
    typeInstruction = "\n\nLOẠI NỘI DUNG: FEEDBACK. Chọn ngẫu nhiên 1 trong 12 dạng của LOẠI 3.";
  } else if (contentType === "package1year") {
    typeInstruction = "\n\nLOẠI NỘI DUNG: CONTENT GÓI 1 NĂM. Chọn ngẫu nhiên 1 phong cách trong 5 phong cách của LOẠI 4. BẮT BUỘC nhắc đến \"1 năm\" và dùng ĐÚNG giá, quà tặng đã cung cấp.";
  } else if (isSim) {
    typeInstruction = "\n\nLOẠI NỘI DUNG: CONTENT SIM. Chọn ngẫu nhiên 1 phong cách trong 5 phong cách của LOẠI 5.";
  } else {
    typeInstruction = "\n\nLOẠI NỘI DUNG: CONTENT THEO GÓI. Chọn ngẫu nhiên 1 phong cách trong 5 phong cách của LOẠI 1.";
  }

  const userPrompt = isSim
    ? `Tạo nội dung quảng cáo SIM:\n${simText}${typeInstruction}\n\nTạo nội dung mới với icon dòng 1 và cách diễn đạt khác nhau mỗi lần.`
    : `Tạo nội dung WiFi cho gói:\n${packageText}${typeInstruction}\n\nTạo nội dung mới với tagline và icon dòng 1 khác nhau mỗi lần.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://text-image-editor.app",
      "X-OpenRouter-Title": "WiFi Content Generator",
    },
    body: JSON.stringify({
      models: CONTENT_MODELS,
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

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://text-image-editor.app",
      "X-OpenRouter-Title": "WiFi Text Rewriter",
    },
    body: JSON.stringify({
      models: CONTENT_MODELS,
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
