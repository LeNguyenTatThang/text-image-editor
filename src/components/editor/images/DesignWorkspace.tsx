"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { htmlToPlainText } from "@/lib/html-text";
import {
  DESIGN_LOCK_DATE_LABEL,
  DesignAspectRatio,
  DesignResponse,
  DesignStyle,
  isDesignFeatureAvailable,
} from "@/lib/imageDesign";

interface DesignWorkspaceProps {
  initialContent?: string;
  onAddImage?: (image: { dataUrl: string; filename: string }) => void;
}

interface StyleOption {
  key: DesignStyle;
  label: string;
  hint: string;
}

interface PaletteOption {
  key: string;
  label: string;
  colors: string[];
  background: string;
}

const STYLES: StyleOption[] = [
  { key: "promo", label: "Khuyến mãi", hint: "Nổi bật, nhiều ưu đãi" },
  { key: "bold", label: "Đậm mạnh", hint: "Chữ lớn, tác động cao" },
  { key: "minimal", label: "Tối giản", hint: "Sạch, nhiều khoảng trống" },
  { key: "tech", label: "Công nghệ", hint: "Ánh sáng, gradient" },
  { key: "premium", label: "Cao cấp", hint: "Tinh tế, sang trọng" },
];

const ASPECTS: DesignAspectRatio[] = ["1:1", "4:3", "3:4", "16:9", "9:16"];

const PALETTES: PaletteOption[] = [
  { key: "blue", label: "Xanh dương", colors: ["#1677FF", "#00D9FF"], background: "#020B2D" },
  { key: "orange", label: "Cam vàng", colors: ["#FF6B00", "#FFC400"], background: "#1A0B00" },
  { key: "red", label: "Đỏ trắng", colors: ["#E53935", "#FF8A65"], background: "#FFFFFF" },
  { key: "green", label: "Xanh lá", colors: ["#00A86B", "#B7F34A"], background: "#04140C" },
  { key: "purple", label: "Tím", colors: ["#7C4DFF", "#E040FB"], background: "#0E0620" },
  { key: "light", label: "Sáng sạch", colors: ["#1677FF", "#FF4D4F"], background: "#F5FAFF" },
];

const MAX_CONTENT_CHARS = 700;

function extensionFor(mediaType: string): string {
  if (mediaType.includes("webp")) return ".webp";
  if (mediaType.includes("jpeg") || mediaType.includes("jpg")) return ".jpg";
  if (mediaType.includes("svg")) return ".svg";
  return ".png";
}

export default function DesignWorkspace({ initialContent = "", onAddImage }: DesignWorkspaceProps) {
  const [content, setContent] = useState(initialContent);
  const [style, setStyle] = useState<DesignStyle>("promo");
  const [aspect, setAspect] = useState<DesignAspectRatio>("1:1");
  const [palette, setPalette] = useState("blue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DesignResponse | null>(null);
  const locked = !isDesignFeatureAvailable();

  const selectedPalette = useMemo(
    () => PALETTES.find((item) => item.key === palette) ?? PALETTES[0],
    [palette]
  );

  const loadFromEditor = useCallback((silent = false) => {
    const editor = document.querySelector("[data-rich-editor]");
    if (!editor) {
      if (!silent) toast.error("Không tìm thấy nội dung trong trình soạn thảo");
      return;
    }

    const text = htmlToPlainText(editor.innerHTML);
    if (!text) {
      if (!silent) toast.error("Trình soạn thảo đang trống");
      return;
    }

    setContent(text);
    if (!silent) toast.success("Đã lấy nội dung từ trình soạn thảo");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!content.trim()) {
      toast.error("Chưa có nội dung để thiết kế");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          style,
          aspectRatio: aspect,
          colors: selectedPalette.colors,
          backgroundColor: selectedPalette.background,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Lỗi khi tạo thiết kế");
      }

      const data: DesignResponse = await response.json();
      setResult(data);
      toast.success("Đã tạo thiết kế");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, [content, style, aspect, selectedPalette]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = `design-${Date.now()}${extensionFor(result.mediaType)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  const handleAdd = useCallback(() => {
    if (!result || !onAddImage) return;
    onAddImage({
      dataUrl: result.dataUrl,
      filename: `design-${Date.now()}${extensionFor(result.mediaType)}`,
    });
  }, [result, onAddImage]);

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-2/5 min-w-[280px] max-w-[460px] flex flex-col border-r border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20 overflow-hidden">
        {locked && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Tính năng đã khóa từ {DESIGN_LOCK_DATE_LABEL} vì API Recraft đóng.
            </p>
          </div>
        )}

        {error && (
          <div className="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-3 py-3">
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
            <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                Nội dung
              </span>
              <button
                onClick={() => loadFromEditor()}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#1677FF]/10 text-[#1677FF] hover:bg-[#1677FF]/20 dark:bg-[#00D9FF]/10 dark:text-[#00D9FF] dark:hover:bg-[#00D9FF]/20 transition-all duration-150"
                title="Lấy nội dung đang có trong trình soạn thảo"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 006.3 5.7L4 8m16 8l-2.3 2.3A8 8 0 014 15" />
                </svg>
                Lấy từ editor
              </button>
            </header>
            <div className="p-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CONTENT_CHARS}
                placeholder="Nội dung cần đưa vào thiết kế..."
                className="w-full h-24 text-[11px] text-zinc-800 bg-white border border-zinc-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#1677FF]/50 focus:ring-2 focus:ring-[#1677FF]/10 resize-none overflow-y-auto leading-relaxed dark:text-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800 dark:focus:border-[#00D9FF]/50 dark:focus:ring-[#00D9FF]/10 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
              <div className="mt-1 flex justify-end text-[10px] text-zinc-400 dark:text-zinc-600 tabular-nums">
                {content.length}/{MAX_CONTENT_CHARS}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
            <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Phong cách
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Chỉ thêm thiết kế</span>
            </header>
            <div className="p-1.5 flex flex-wrap gap-1.5">
              {STYLES.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStyle(item.key)}
                  title={item.hint}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-150 active:scale-[0.97] ${
                    style === item.key
                      ? "bg-[#1677FF] text-white shadow-sm dark:bg-[#00D9FF] dark:text-[#020B2D]"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
            <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Tỉ lệ & màu
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">1K</span>
            </header>
            <div className="p-1.5 flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-1.5">
                {ASPECTS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setAspect(item)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-150 active:scale-[0.97] ${
                      aspect === item
                        ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {PALETTES.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setPalette(item.key)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-all duration-150 ${
                      palette === item.key
                        ? "border-[#1677FF] bg-[#1677FF]/10 text-[#1677FF] dark:border-[#00D9FF] dark:bg-[#00D9FF]/10 dark:text-[#00D9FF]"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="flex -space-x-1">
                      {item.colors.map((color) => (
                        <span
                          key={color}
                          className="w-3 h-3 rounded-full border border-white/70 dark:border-zinc-900"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={loading || locked || !content.trim()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-xl text-white bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-400 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] transition-all duration-150"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {locked ? "Đã khóa" : loading ? "Recraft đang thiết kế..." : "Tạo thiết kế"}
          </button>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
            Prompt gọn, chỉ gửi nội dung + phong cách + màu qua controls để tiết kiệm token.
          </p>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
            Thiết kế
          </span>
          {result?.usage?.totalTokens && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              {result.usage.totalTokens} tokens
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0 p-3">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <div className="w-9 h-9 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Đang tạo thiết kế từ nội dung...</p>
            </div>
          ) : result ? (
            <div className="h-full flex flex-col gap-2">
              <div className="flex-1 min-h-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.dataUrl}
                  alt="Thiết kế được tạo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-all duration-150"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tải xuống
                </button>
                {onAddImage && (
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#1677FF] text-white hover:bg-[#1677FF]/90 dark:bg-[#00D9FF] dark:text-[#020B2D] dark:hover:bg-[#00D9FF]/90 transition-all duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm vào danh sách
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800/60 flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Chưa có thiết kế</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600">Lấy nội dung rồi bấm Tạo thiết kế</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
