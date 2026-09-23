"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

// Mathematical Bold (U+1D400)
const BOLD_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d400 + i)])
);
const BOLD_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d41a + i)])
);
const BOLD_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7ce + i)])
);

// Mathematical Italic (U+1D434)
const ITALIC_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d434 + i)])
);
const ITALIC_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d44e + i)])
);

// Mathematical Sans-Serif (U+1D5A0)
const SANS_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d5a0 + i)])
);
const SANS_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d5ba + i)])
);
const SANS_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7e2 + i)])
);

// Mathematical Sans-Serif Bold (U+1D5D4)
const SANS_BOLD_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d5d4 + i)])
);
const SANS_BOLD_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d5ee + i)])
);

// Mathematical Double-Struck (U+1D538)
const DOUBLE_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d538 + i)])
);
const DOUBLE_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d552 + i)])
);
const DOUBLE_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7d8 + i)])
);

// Mathematical Monospace (U+1D670)
const MONO_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d670 + i)])
);
const MONO_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d68a + i)])
);
const MONO_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x1d7e2 + i)])
);

// Mathematical Script (U+1D49C)
const SCRIPT_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d49c + i)])
);
const SCRIPT_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d4b0 + i)])
);

// Mathematical Fraktur (U+1D504)
const FRAKTUR_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1d504 + i)])
);
const FRAKTUR_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x1d51e + i)])
);

// Circled letters (U+24B6)
const CIRCLED_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x24b6 + i)])
);
const CIRCLED_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0x24d0 + i)])
);
const CIRCLED_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0x2460 + i)])
);

// Squared letters (U+1F130)
const SQUARED_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1f130 + i)])
);

// Fullwidth (U+FF21)
const FULLWIDTH_UPPER: Record<string, string> = Object.fromEntries(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0xff21 + i)])
);
const FULLWIDTH_LOWER: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((c, i) => [c, String.fromCodePoint(0xff41 + i)])
);
const FULLWIDTH_DIGIT: Record<string, string> = Object.fromEntries(
  "0123456789".split("").map((c, i) => [c, String.fromCodePoint(0xff10 + i)])
);

// Small Caps mapping
const SMALLCAPS_MAP: Record<string, string> = {
  a: "\u0251", b: "\u0253", c: "\u0254", d: "\u0256", e: "\u0259",
  f: "\u0283", g: "\u0261", h: "\u0266", i: "\u026a", j: "\u029d",
  k: "\u029f", l: "\u0234", m: "\u0271", n: "\u0272", o: "\u0254",
  p: "\u028a", q: "\u028a", r: "\u027d", s: "\u0282", t: "\u0288",
  u: "\u0289", v: "\u028b", w: "\u028d", x: "\u03c7", y: "\u028e",
  z: "\u0291",
};

// Superscript mapping
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

function toBold(text: string): string {
  return mapChars(text, BOLD_UPPER, BOLD_LOWER, BOLD_DIGIT);
}

function toItalic(text: string): string {
  return mapChars(text, ITALIC_UPPER, ITALIC_LOWER);
}

function toDouble(text: string): string {
  return mapChars(text, DOUBLE_UPPER, DOUBLE_LOWER, DOUBLE_DIGIT);
}

function toMonospace(text: string): string {
  return mapChars(text, MONO_UPPER, MONO_LOWER, MONO_DIGIT);
}

function toScript(text: string): string {
  return mapChars(text, SCRIPT_UPPER, SCRIPT_LOWER);
}

function toFraktur(text: string): string {
  return mapChars(text, FRAKTUR_UPPER, FRAKTUR_LOWER);
}

function toSansSerif(text: string): string {
  return mapChars(text, SANS_UPPER, SANS_LOWER, SANS_DIGIT);
}

function toSansSerifBold(text: string): string {
  return mapChars(text, SANS_BOLD_UPPER, SANS_BOLD_LOWER);
}

function toCircled(text: string): string {
  return mapChars(text, CIRCLED_UPPER, CIRCLED_LOWER, CIRCLED_DIGIT);
}

function toSquared(text: string): string {
  return mapChars(text, SQUARED_UPPER, {});
}

function toFullwidth(text: string): string {
  return mapChars(text, FULLWIDTH_UPPER, FULLWIDTH_LOWER, FULLWIDTH_DIGIT);
}

function toSmallCaps(text: string): string {
  return text
    .split("")
    .map((ch) => (ch >= "A" && ch <= "Z") ? ch : SMALLCAPS_MAP[ch.toLowerCase()] || ch)
    .join("");
}

function toSuperscript(text: string): string {
  return text.split("").map((ch) => SUPERSCRIPT_MAP[ch] || ch).join("");
}

function toUnderline(text: string): string {
  return text.split("").map((ch) => ch + "\u0332").join("");
}

function toStrikethrough(text: string): string {
  return text.split("").map((ch) => ch + "\u0336").join("");
}

function toReverse(text: string): string {
  return text.split("").reverse().join("");
}

interface StyledRow {
  label: string;
  transform: (text: string) => string;
  color: string;
}

const STYLES: StyledRow[] = [
  { label: "Bold", transform: toBold, color: "from-violet-500 to-purple-500" },
  { label: "Italic", transform: toItalic, color: "from-blue-500 to-indigo-500" },
  { label: "Underline", transform: toUnderline, color: "from-emerald-500 to-teal-500" },
  { label: "Strikethrough", transform: toStrikethrough, color: "from-rose-500 to-pink-500" },
  { label: "Monospace", transform: toMonospace, color: "from-zinc-600 to-zinc-700" },
  { label: "Small Caps", transform: toSmallCaps, color: "from-amber-500 to-orange-500" },
  { label: "Fancy", transform: toScript, color: "from-fuchsia-500 to-pink-500" },
  { label: "Double", transform: toDouble, color: "from-cyan-500 to-blue-500" },
  { label: "Reverse", transform: toReverse, color: "from-slate-500 to-gray-600" },
  { label: "Sans Serif", transform: toSansSerif, color: "from-teal-500 to-emerald-500" },
  { label: "Sans Bold", transform: toSansSerifBold, color: "from-indigo-500 to-violet-500" },
  { label: "Fraktur", transform: toFraktur, color: "from-red-600 to-rose-600" },
  { label: "Circled", transform: toCircled, color: "from-pink-500 to-fuchsia-500" },
  { label: "Squared", transform: toSquared, color: "from-orange-500 to-amber-500" },
  { label: "Fullwidth", transform: toFullwidth, color: "from-sky-500 to-blue-500" },
  { label: "Superscript", transform: toSuperscript, color: "from-purple-500 to-indigo-500" },
];

export default function TextFormatTool() {
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Đã sao chép");
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      toast.success("Đã sao chép");
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT: Input */}
        <div className="w-1/2 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
          <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/60">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Input</span>
          </div>
          <div className="flex-1 p-3 min-h-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập text cần chuyển đổi..."
              className="w-full h-full text-sm text-zinc-800 bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none overflow-y-auto leading-relaxed transition-all duration-200 min-h-[120px] dark:text-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800"
            />
          </div>
        </div>

        {/* RIGHT: Output */}
        <div className="w-1/2 flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/60">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Output</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {STYLES.map((style, i) => {
              const result = input.trim() ? style.transform(input) : "";
              const isCopied = copiedIndex === i;
              return (
                <div
                  key={style.label}
                  className="group flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-wider">
                      {style.label}
                    </div>
                    <div className={`text-sm truncate leading-relaxed ${result ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-300 dark:text-zinc-600"}`}>
                      {result || "—"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(result, i)}
                    disabled={!result}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-md transition-all duration-200 shadow-sm active:scale-[0.95] disabled:opacity-30 disabled:cursor-not-allowed ${
                      isCopied
                        ? "bg-green-500 text-white"
                        : `bg-gradient-to-r ${style.color} text-white hover:opacity-90`
                    }`}
                    title={`Copy ${style.label}`}
                  >
                    {isCopied ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    </div>
  );
}
