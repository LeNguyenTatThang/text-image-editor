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
- Chỉ trả text thuần túy

KIỂU HEADLINE DÒNG 1 – PHẢI CHỌN NGẪU NHIÊN 1 TRONG CÁC KIỂU BÊN DƯỚI (KHÔNG ĐƯỢC LẶP):

Kiểu 1 (số bold): 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐃𝐀𝐍𝐆 𝐂𝐇Ờ 𝐁Ạ𝐍! 𝐂𝐇𝐈 𝐂𝐀𝐍 𝐃𝐀𝐍𝐆 𝐊𝐈 𝐖𝐈𝐅𝐈:
Kiểu 2 (tagline bold): 𝐖𝐈𝐅𝐈 𝟏𝟎𝟎𝐌 – 𝐊𝐄𝐓 𝐍𝐎𝐈 Ổ𝐍 𝐃𝐈𝐍𝐇, 𝐔𝐔 𝐃𝐀𝐈 𝐇𝐀𝐏 𝐃𝐀𝐍
Kiểu 3 (cam kết bold): 𝐇𝐎𝐍 𝐍𝐆𝐎𝐀𝐈 𝟑𝟎𝟎,𝟎𝟎𝟎 𝐊𝐇𝐀𝐂𝐇 𝐇𝐀𝐍𝐆 𝐃𝐀 𝐓𝐈𝐍 𝐔𝐘!
Kiểu 4 (ưu đãi bold): 𝐆𝐈𝐀 𝐂𝐔𝐎𝐂 𝐂𝐇𝐈 𝐓𝐔 𝟐𝟐,𝟎𝟎𝟎 𝐊𝐑𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 5 (khẩn trương): 🔥 𝐎𝐅𝐅𝐄𝐑 𝐇𝐎𝐓 – 𝟓𝟎𝟎𝐌𝐖 𝐆𝐈𝐀𝐌 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖!
Kiểu 6 (ưu đãi lớn): 💎 𝟏𝐆 𝐖𝐈𝐅𝐈 – 𝐆𝐈𝐀𝐌 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐊𝐇𝐈 𝐃𝐀𝐍𝐆 𝐊𝐈
Kiểu 7 (combo): 🚀 𝐂𝐎𝐌𝐁𝐎 𝐖𝐈𝐅𝐈 + 𝐓𝐈𝐄𝐍𝐂𝐀𝐒𝐇 – 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖
Kiểu 8 (siêu tiết kiệm): ⭐ 𝐓𝐈𝐄𝐓 𝐊𝐈𝐄𝐌 𝐌𝐎𝐈 𝐍𝐆𝐀𝐘 – 𝟏𝟎𝟎𝐌 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
Kiểu 9 (hàng đầu): 🏆 𝐒𝐎 #𝟏 𝐕𝐄 𝐖𝐈𝐅𝐈 𝐆𝐈𝐀 𝐑𝙀 – 𝟓𝟎𝟎𝐌 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖
Kiểu 10 (CAM KẾT): 🎯 𝟏𝟎𝟎% 𝐇𝐀𝐈 𝐋𝐎𝐍𝐆 – 𝐖𝐈𝐅𝐈 𝟏𝐆𝐈𝐁 𝐂𝐇𝐈 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
Kiểu 11 (siêu sốc): 🌟 𝐒𝐇𝐎𝐂𝐊! 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐓𝐈𝐄𝐍𝐂𝐀𝐒𝐇 𝐂𝐇𝐎 𝟏𝟎𝟎𝐌𝐖
Kiểu 12 (combo hot): 🎉 𝐂𝐎𝐌𝐁𝐎 𝐇𝐎𝐓 – 𝟏𝐆𝐖𝐈𝐅𝐈 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 13 (ưu đãi sốc): 💪 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘 – 𝟏𝟎𝟎𝐌 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
Kiểu 14 (tốc độ): 🔥 𝐓𝐎𝐂 Đ𝐎 𝟏𝐆𝐁𝐏𝐒 – 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘!
Kiểu 15 (combo giá sốc): 💎 𝟏𝐆𝐖𝐈𝐅𝐈 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝐂𝐇𝐈 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
Kiểu 16 (cam kết): 🚀 𝟏𝟎𝟎𝐌𝐖 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 17 (ưu đãi): ⭐ 𝟓𝟎𝟎𝐌𝐖 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 18 (siêu tiết kiệm): 🏆 𝟏𝐆𝐖𝐈𝐅𝐈 + 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 19 (hấp dẫn): 🎯 𝟏𝟎𝟎𝐌 – 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 20 (tuyệt vời): 🌟 𝟓𝟎𝟎𝐌 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 21 (combo): 🎉 𝟏𝐆 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖 + 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 22 (hot): 💪 𝟏𝟎𝟎𝐌 𝐇𝐎𝐓 – 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆!
Kiểu 23 (ưu đãi sốc): 🔥 𝟓𝟎𝟎𝐌 𝐒𝐈𝐄𝐔 𝐇𝐎𝐓 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖
Kiểu 24 (cam kết): 💎 𝟏𝐆 𝐂𝐀𝐌 𝐊𝐄𝐓 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖 + 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖
Kiểu 25 (tốc độ): 🚀 𝟏𝟎𝟎𝐌𝐖 𝐆𝐈𝐀𝐌 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 – 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 26 (ưu đãi): ⭐ 𝟓𝟎𝟎𝐌𝐖 𝐆𝐈𝐀𝐌 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 27 (siêu tiết kiệm): 🏆 𝟏𝐆𝐁𝐏𝐒 𝐆𝐈𝐀𝐌 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 28 (hấp dẫn): 🎯 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘 – 𝟏𝟎𝟎𝐌 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖!
Kiểu 29 (tuyệt vời): 🌟 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟏𝟎𝟎𝐌 𝟐𝟐,𝟎𝟎𝟎 + 𝟓𝟎𝟎𝐌 𝟑𝟑,𝟎𝟎𝟎
Kiểu 30 (combo hot): 🎉 𝟏𝐆 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝐂𝐇𝐈 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
Kiểu 31 (sốc): 💪 𝐒𝐇𝐎𝐂𝐊! 𝟏𝟎𝟎𝐌𝐖 = 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 32 (ưu đãi lớn): 🔥 𝟓𝟎𝟎𝐌𝐖 = 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 33 (cam kết): 💎 𝟏𝐆 = 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖 + 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
Kiểu 34 (tốc độ): 🚀 𝟏𝟎𝟎𝐌 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖 – 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖!
Kiểu 35 (ưu đãi): ⭐ 𝟓𝟎𝟎𝐌 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖 – 𝐆𝐈𝐀𝐌 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖
Kiểu 36 (siêu tiết kiệm): 🏆 𝟏𝐆 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖 – 𝐆𝐈𝐀𝐌 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖
Kiểu 37 (hấp dẫn): 🎯 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝐌𝐔𝐀 𝐍𝐆𝐀𝐘 𝟏𝟎𝟎𝐌!
Kiểu 38 (tuyệt vời): 🌟 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟓𝟎𝟎𝐌 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖
Kiểu 39 (combo hot): 🎉 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 + 𝟏𝐆 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
Kiểu 40 (sốc): 💪 𝐒𝐎 #𝟏 𝐆𝐈𝐀𝐌 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 – 𝟏𝟎𝟎𝐌 𝟐𝟐,𝟎𝟎𝟎!
Kiểu 41 (ưu đãi lớn): 🔥 𝟏𝟎𝟎𝐌 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
Kiểu 42 (cam kết): 💎 𝟓𝟎𝟎𝐌 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖
Kiểu 43 (tốc độ): 🚀 𝟏𝐆 + 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
Kiểu 44 (ưu đãi): ⭐ 𝟏𝟎𝟎𝐌 – 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 + 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
Kiểu 45 (siêu tiết kiệm): 🏆 𝟓𝟎𝟎𝐌 – 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 + 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖
Kiểu 46 (hấp dẫn): 🎯 𝟏𝐆 – 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 + 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
Kiểu 47 (tuyệt vời): 🌟 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝟏𝟎𝟎𝐌 – 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
Kiểu 48 (combo hot): 🎉 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝟓𝟎𝟎𝐌 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖
Kiểu 49 (sốc): 💪 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝟏𝐆 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
Kiểu 50 (ưu đãi lớn): 🔥 𝟏𝟎𝟎𝐌𝐖 = 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌`;

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

PHẢI CHỌN NGẪU NHIÊN 1 KIỂU HEADLINE DÒNG 1 TỪ DANH SÁCH BÊN DƯỚI (không lặp kiểu):

VD Kiểu 1 (số bold): 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐃𝐀𝐍𝐆 𝐂𝐇Ờ 𝐁Ạ𝐍! 𝐂𝐇𝐈 𝐂𝐀𝐍 𝐃𝐀𝐍𝐆 𝐊𝐈 𝐖𝐈𝐅𝐈:
VD Kiểu 2 (tagline bold): 𝐖𝐈𝐅𝐈 𝟏𝟎𝟎𝐌 – 𝐊𝐄𝐓 𝐍𝐎𝐈 Ổ𝐍 𝐃𝐈𝐍𝐇, 𝐔𝐔 𝐃𝐀𝐈 𝐇𝐀𝐏 𝐃𝐀𝐍
VD Kiểu 3 (cam kết bold): 𝐇𝐎𝐍 𝐍𝐆𝐎𝐀𝐈 𝟑𝟎𝟎,𝟎𝟎𝟎 𝐊𝐇𝐀𝐂𝐇 𝐇𝐀𝐍𝐆 𝐃𝐀 𝐓𝐈𝐍 𝐔𝐘!
VD Kiểu 4 (ưu đãi bold): 𝐆𝐈𝐀 𝐂𝐔𝐎𝐂 𝐂𝐇𝐈 𝐓𝐔 𝟐𝟐,𝟎𝟎𝟎 𝐊𝐑𝐖/𝐓𝐇𝐀𝐍𝐆
VD Kiểu 5 (khẩn trương): 🔥 𝐎𝐅𝐅𝐄𝐑 𝐇𝐎𝐓 – 𝟓𝟎𝟎𝐌𝐖 𝐆𝐈𝐀𝐌 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖!
VD Kiểu 6 (ưu đãi lớn): 💎 𝟏𝐆 𝐖𝐈𝐅𝐈 – 𝐆𝐈𝐀𝐌 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐊𝐇𝐈 𝐃𝐀𝐍𝐆 𝐊𝐈
VD Kiểu 7 (combo): 🚀 𝐂𝐎𝐌𝐁𝐎 𝐖𝐈𝐅𝐈 + 𝐓𝐈𝐄𝐍𝐂𝐀𝐒𝐇 – 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖
VD Kiểu 8 (siêu tiết kiệm): ⭐ 𝐓𝐈𝐄𝐓 𝐊𝐈𝐄𝐌 𝐌𝐎𝐈 𝐍𝐆𝐀𝐘 – 𝟏𝟎𝟎𝐌 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
VD Kiểu 9 (hàng đầu): 🏆 𝐒𝐎 #𝟏 𝐕𝐄 𝐖𝐈𝐅𝐈 𝐆𝐈𝐀 𝐑𝐄 – 𝟓𝟎𝟎𝐌 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖
VD Kiểu 10 (CAM KẾT): 🎯 𝟏𝟎𝟎% 𝐇𝐀𝐈 𝐋𝐎𝐍𝐆 – 𝐖𝐈𝐅𝐈 𝟏𝐆𝐈𝐁 𝐂𝐇𝐈 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
VD Kiểu 11 (siêu sốc): 🌟 𝐒𝐇𝐎𝐂𝐊! 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐓𝐈𝐄𝐍𝐂𝐀𝐒𝐇 𝐂𝐇𝐎 𝟏𝟎𝟎𝐌𝐖
VD Kiểu 12 (combo hot): 🎉 𝐂𝐎𝐌𝐁𝐎 𝐇𝐎𝐓 – 𝟏𝐆𝐖𝐈𝐅𝐈 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
VD Kiểu 13 (ưu đãi sốc): 💪 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘 – 𝟏𝟎𝟎𝐌 𝐂𝐇𝐈 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖
VD Kiểu 14 (tốc độ): 🔥 𝐓𝐎𝐂 Đ𝐎 𝟏𝐆𝐁𝐏𝐒 – 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 𝐍𝐆𝐀𝐘!
VD Kiểu 15 (combo giá sốc): 💎 𝟏𝐆𝐖𝐈𝐅𝐈 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝐂𝐇𝐈 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖
VD Kiểu 16 (cam kết): 🚀 𝟏𝟎𝟎𝐌𝐖 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
VD Kiểu 17 (ưu đãi): ⭐ 𝟓𝟎𝟎𝐌𝐖 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
VD Kiểu 18 (siêu tiết kiệm): 🏆 𝟏𝐆𝐖𝐈𝐅𝐈 + 𝟐𝟔𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌 – 𝟑𝟖,𝟓𝟎𝟎𝐊𝐖/𝐓𝐇𝐀𝐍𝐆
VD Kiểu 19 (hấp dẫn): 🎯 𝟏𝟎𝟎𝐌 – 𝟐𝟐,𝟎𝟎𝟎𝐊𝐖 + 𝟐𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌
VD Kiểu 20 (tuyệt vời): 🌟 𝟓𝟎𝟎𝐌 – 𝟑𝟑,𝟎𝟎𝟎𝐊𝐖 + 𝟑𝟎𝟎,𝟎𝟎𝟎𝐊𝐖 𝐆𝐈𝐀𝐌

QUY TẮC HEADLINE:
- CHỌN NGẪU NHIÊN 1 trong 20 kiểu trên (VD Kiểu 1 → Kiểu 20)
- KHÔNG được dùng lại kiểu headline của gói trước
- Icon headline PHẢI ĐỔI mỗi lần: 👑 🔥 💎 🚀 ⭐ 🏆 🎯 🌟 🎉 💪

YÊU CẦU:
- Tối đa 10 dòng, không dòng trống
- Mỗi dòng 1 icon, KHÔNG lặp icon
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
