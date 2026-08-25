"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import { PackageInfo, ContentResponse } from "@/types/content";

interface TextWorkspaceProps {
  onTextChange?: (info: { charCount: number; lineCount: number }) => void;
}

interface PackageForm {
  name: string;
  speed: string;
  price: string;
  bonus: string;
}

const PRESET_PACKAGES: PackageForm[] = [
  { name: "100M", speed: "100Mbps", price: "22.000", bonus: "200.000" },
  { name: "500M", speed: "500Mbps", price: "33.000", bonus: "300.000" },
  { name: "1G", speed: "1Gbps", price: "38.500", bonus: "260.000" },
];

export default function TextWorkspace({ onTextChange }: TextWorkspaceProps) {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const typeContent = useCallback(async (html: string) => {
    const editor = document.querySelector("[data-rich-editor]");
    if (!editor) return;

    const lines = html.split(/\n/).filter((l) => l.trim().length > 0);
    editor.innerHTML = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let tag: HTMLElement;

      if (i === 0) {
        tag = document.createElement("h1");
        tag.style.fontSize = "1.6em";
        tag.style.fontWeight = "800";
        tag.style.lineHeight = "1.2";
        tag.style.margin = "0 0 4px 0";
      } else if (i <= 2) {
        tag = document.createElement("h2");
        tag.style.fontSize = "1.15em";
        tag.style.fontWeight = "700";
        tag.style.lineHeight = "1.3";
        tag.style.margin = "0";
      } else {
        tag = document.createElement("p");
        tag.style.fontSize = "0.95em";
        tag.style.fontWeight = "500";
        tag.style.lineHeight = "1.4";
        tag.style.margin = "0";
      }

      editor.appendChild(tag);

      for (let j = 0; j < line.length; j++) {
        tag.textContent += line[j];
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 8));
      }

      if (i < lines.length - 1) {
        await new Promise((r) => setTimeout(r, 30));
      }
    }

    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  const generateForPackage = useCallback(async (preset: PackageForm) => {
    setLoadingPackage(preset.name);
    setStage("Đang gửi yêu cầu...");
    setError(null);

    try {
      const packageData: PackageInfo[] = [
        {
          name: preset.name,
          speed: preset.speed,
          price: preset.price,
          bonus: preset.bonus || undefined,
        },
      ];

      setStage("AI đang viết nội dung...");
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages: packageData, style: "promotional" }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Lỗi khi tạo nội dung");
      }

      setStage("Đang hiển thị...");
      const result: ContentResponse = await response.json();

      if (!result.content) {
        throw new Error("Không nhận được nội dung từ AI");
      }

      await typeContent(result.content);
      toast.success("Đã tạo nội dung AI");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoadingPackage(null);
      setStage("");
    }
  }, [typeContent]);

  const autoFormat = useCallback(() => {
    const editor = document.querySelector("[data-rich-editor]");
    if (!editor) return;

    const lines = editor.innerHTML.split(/<br\s*\/?>/i);
    const formatted = lines.map((line, index) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = line;
      let text = tmp.textContent || "";

      text = text.replace(
        /(\d{1,3}(?:\.\d{3})*)\s*(KRW|₫|VND|W|w| đồng|đ)/gi,
        "<b>$1 $2</b>"
      );

      text = text.replace(
        /(100M|500M|1G|2G|300M|200M)\b/g,
        "<b>$1</b>"
      );

      if (index === 0) {
        text = `<h1 style="font-size:1.6em;font-weight:800;line-height:1.2;margin:0 0 4px 0">${text}</h1>`;
      } else if (index <= 2) {
        text = `<h2 style="font-size:1.15em;font-weight:700;line-height:1.3;margin:0">${text}</h2>`;
      } else {
        text = `<p style="font-size:0.95em;font-weight:500;line-height:1.4;margin:0">${text}</p>`;
      }

      return text;
    });

    editor.innerHTML = formatted.join("");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800/60">
        {PRESET_PACKAGES.map((preset) => {
          const isLoading = loadingPackage === preset.name;
          const isAnyLoading = loadingPackage !== null;
          return (
            <button
              key={preset.name}
              onClick={() => generateForPackage(preset)}
              disabled={isAnyLoading}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.97] ${
                isLoading
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              }`}
              title={`Tạo nội dung cho gói ${preset.name}`}
            >
              {isLoading ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {preset.name}
            </button>
          );
        })}

        <div className="w-px h-5 bg-zinc-300 mx-1 dark:bg-zinc-800" />

        <button
          onClick={autoFormat}
          disabled={loadingPackage !== null}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.97]"
          title="Tự động định dạng: bôi đậm giá tiền, nổi bật ưu đãi"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Định dạng
        </button>
      </div>

      {error && (
        <div className="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loadingPackage && stage && (
        <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] text-blue-600 dark:text-blue-400">{stage}</p>
        </div>
      )}

      <RichTextEditor onTextChange={onTextChange} />
    </div>
  );
}
