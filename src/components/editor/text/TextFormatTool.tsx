"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

const BOLD_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d400 + i)])
);
const BOLD_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d41a + i)])
);
const BOLD_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7ce + i)])
);

const ITALIC_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d434 + i)])
);
const ITALIC_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d44e + i)])
);

const SANS_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d5a0 + i)])
);
const SANS_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d5ba + i)])
);
const SANS_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7e2 + i)])
);

const SANS_BOLD_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d5d4 + i)])
);
const SANS_BOLD_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d5ee + i)])
);

const DOUBLE_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d538 + i)])
);
const DOUBLE_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d552 + i)])
);
const DOUBLE_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7d8 + i)])
);

const MONO_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d670 + i)])
);
const MONO_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d68a + i)])
);
const MONO_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7e2 + i)])
);

const SCRIPT_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d49c + i)])
);
const SCRIPT_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d4b0 + i)])
);

const FRAKTUR_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d504 + i)])
);
const FRAKTUR_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d51e + i)])
);

const CIRCLED_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x24b6 + i)])
);
const CIRCLED_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x24d0 + i)])
);
const CIRCLED_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x2460 + i)])
);

const SQUARED_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1f130 + i)])
);

const FULLWIDTH_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0xff21 + i)])
);
const FULLWIDTH_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0xff41 + i)])
);
const FULLWIDTH_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0xff10 + i)])
);

const SMALLCAPS_MAP: Record<string, string> = {
  a: "\u0251", b: "\u0253", c: "\u0254", d: "\u0256", e: "\u0259",
  f: "\u0283", g: "\u0261", h: "\u0266", i: "\u026a", j: "\u029d",
  k: "\u029f", l: "\u0234", m: "\u0271", n: "\u0272", o: "\u0254",
  p: "\u028a", q: "\u028a", r: "\u027d", s: "\u0282", t: "\u0288",
  u: "\u0289", v: "\u028b", w: "\u028d", x: "\u03c7", y: "\u028e",
  z: "\u0291",
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  a: "\u1d43", b: "\u1d47", c: "\u1d9c", d: "\u1d48", e: "\u1d49",
  f: "\u1da0", g: "\u1d4d", h: "\u02b0", i: "\u2071", j: "\u2b0d",
  k: "\u1d4f", l: "\u1d4c", m: "\u1d50", n: "\u207f", o: "\u1d52",
  p: "\u1d56", q: "\u02a3", r: "\u02b3", s: "\u02e2", t: "\u1d57",
  u: "\u1d58", v: "\u1d5b", w: "\u02b7", x: "\u02e3", y: "\u02b8",
  z: "\u1dbb",
  A: "\u1d2c", B: "\u1d2e", C: "\u1d9c", D: "\u1d48", E: "\u1d49",
  F: "\u1da0", G: "\u1d4d", H: "\u02b0", I: "\u2071", J: "\u2b0d",
  K: "\u1d4f", L: "\u1d4c", M: "\u1d50", N: "\u207f", O: "\u1d52",
  P: "\u1d56", Q: "\u02a3", R: "\u02b3", S: "\u02e2", T: "\u1d57",
  U: "\u1d58", V: "\u1d5b", W: "\u02b7", X: "\u02e3", Y: "\u02b8",
  Z: "\u1dbb",
  "0": "\u2070", "1": "\u00b9", "2": "\u00b2", "3": "\u00b3",
  "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077",
  "8": "\u2078", "9": "\u2079",
};

function mapChars(text: string, upper: Record<string, string>, lower: Record<string, string>, digit?: Record<string, string>): string {
  return text
    .split("")
    .map((ch) => upper[ch] || lower[ch] || (digit && digit[ch]) || ch)
    .join("");
}

const STYLES = [
  { label: "Bold", transform: (t: string) => mapChars(t, BOLD_UPPER, BOLD_LOWER, BOLD_DIGIT), icon: "B" },
  { label: "Italic", transform: (t: string) => mapChars(t, ITALIC_UPPER, ITALIC_LOWER), icon: "I" },
  { label: "Underline", transform: (t: string) => t.split("").map((ch) => ch + "\u0332").join(""), icon: "U" },
  { label: "Strikethrough", transform: (t: string) => t.split("").map((ch) => ch + "\u0336").join(""), icon: "S" },
  { label: "Monospace", transform: (t: string) => mapChars(t, MONO_UPPER, MONO_LOWER, MONO_DIGIT), icon: "M" },
  { label: "Small Caps", transform: (t: string) => t.split("").map((ch) => (ch >= "A" && ch <= "Z") ? ch : SMALLCAPS_MAP[ch.toLowerCase()] || ch).join(""), icon: "SC" },
  { label: "Fancy", transform: (t: string) => mapChars(t, SCRIPT_UPPER, SCRIPT_LOWER), icon: "F" },
  { label: "Double", transform: (t: string) => mapChars(t, DOUBLE_UPPER, DOUBLE_LOWER, DOUBLE_DIGIT), icon: "D" },
  { label: "Reverse", transform: (t: string) => t.split("").reverse().join(""), icon: "R" },
  { label: "Sans Serif", transform: (t: string) => mapChars(t, SANS_UPPER, SANS_LOWER, SANS_DIGIT), icon: "SS" },
  { label: "Sans Bold", transform: (t: string) => mapChars(t, SANS_BOLD_UPPER, SANS_BOLD_LOWER), icon: "SB" },
  { label: "Fraktur", transform: (t: string) => mapChars(t, FRAKTUR_UPPER, FRAKTUR_LOWER), icon: "FK" },
  { label: "Circled", transform: (t: string) => mapChars(t, CIRCLED_UPPER, CIRCLED_LOWER, CIRCLED_DIGIT), icon: "Ⓒ" },
  { label: "Squared", transform: (t: string) => mapChars(t, SQUARED_UPPER, {}), icon: " Sq" },
  { label: "Fullwidth", transform: (t: string) => mapChars(t, FULLWIDTH_UPPER, FULLWIDTH_LOWER, FULLWIDTH_DIGIT), icon: "FW" },
  { label: "Superscript", transform: (t: string) => t.split("").map((ch) => SUPERSCRIPT_MAP[ch] || ch).join(""), icon: "Sup" },
] as const;

export default function TextFormatTool() {
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!input.trim()) return STYLES.map(() => "");
    return STYLES.map((style) => style.transform(input));
  }, [input]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedIndex(index);
    toast.success("Đã sao chép");
    setTimeout(() => setCopiedIndex(null), 1200);
  }, []);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* LEFT: Input */}
      <div className="w-1/2 flex flex-col border-r border-zinc-200/60 dark:border-zinc-800/60">
        <div className="px-3 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Input</span>
        </div>
        <div className="flex-1 p-3 min-h-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập text cần chuyển đổi..."
            className="w-full h-full text-sm text-zinc-800 bg-white border border-zinc-200/80 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1677FF]/50 focus:ring-2 focus:ring-[#1677FF]/10 resize-none overflow-y-auto leading-relaxed transition-all duration-150 min-h-[120px] dark:text-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800 dark:focus:border-[#00D9FF]/50 dark:focus:ring-[#00D9FF]/10 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* RIGHT: Output */}
      <div className="w-1/2 flex flex-col min-h-0">
        <div className="px-3 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Output</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {STYLES.map((style, i) => {
            const result = results[i];
            const isCopied = copiedIndex === i;
            return (
              <div
                key={style.label}
                className="animate-slide-in group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1677FF]/5 dark:hover:bg-[#00D9FF]/5 border border-transparent hover:border-[#1677FF]/10 dark:hover:border-[#00D9FF]/10 transition-all duration-150"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-[#1677FF]/10 text-[#1677FF] dark:bg-[#00D9FF]/10 dark:text-[#00D9FF]">
                      {style.icon}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {style.label}
                    </span>
                  </div>
                  <div className={`text-sm truncate leading-relaxed font-medium ${result ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-200 dark:text-zinc-700"}`}>
                    {result || "\u2014"}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(result, i)}
                  disabled={!result}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-all duration-150 shadow-sm active:scale-95 disabled:opacity-0 disabled:group-hover:opacity-0 ${
                    isCopied
                      ? "bg-[#00D9FF] text-[#020B2D]"
                      : "bg-[#1677FF] text-white hover:bg-[#1677FF]/90 dark:bg-[#00D9FF] dark:text-[#020B2D] dark:hover:bg-[#00D9FF]/90"
                  }`}
                  title={`Copy ${style.label}`}
                >
                  {isCopied ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                  {isCopied ? "OK" : "Copy"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
