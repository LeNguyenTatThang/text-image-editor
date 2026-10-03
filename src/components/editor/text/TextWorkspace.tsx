"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import TextFormatTool from "./TextFormatTool";
import { PackageInfo, ContentResponse, ContentType, SimInfo } from "@/types/content";
import {
  SIM_CARRIERS,
  SimPlan,
  formatWon,
  getSimPlans,
  simPlanLabel,
} from "@/lib/sim-plans";

interface TextWorkspaceProps {
  onTextChange?: (info: { charCount: number; lineCount: number }) => void;
}

interface PackageForm {
  name: string;
  speed: string;
  price: string;
  bonus: string;
  contentType: ContentType;
}

const PRESET_PACKAGES_3Y: PackageForm[] = [
  { name: "100M", speed: "100Mbps", price: "23.100", bonus: "190.000", contentType: "package" },
  { name: "500M", speed: "500Mbps", price: "34.100", bonus: "280.000", contentType: "package" },
  { name: "1G", speed: "1Gbps", price: "39.600", bonus: "280.000", contentType: "package" },
];

const PRESET_PACKAGES_1Y: PackageForm[] = [
  { name: "100M", speed: "100Mbps", price: "24.200", bonus: "Modem miễn phí", contentType: "package1year" },
  { name: "500M", speed: "500Mbps", price: "31.900", bonus: "100.000", contentType: "package1year" },
  { name: "1G", speed: "1Gbps", price: "38.500", bonus: "150.000", contentType: "package1year" },
];

const CONTENT_TYPE_BUTTONS: { type: ContentType; label: string; color: string }[] = [
  { type: "short", label: "Ngắn", color: "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400" },
  { type: "feedback", label: "Feedback", color: "from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400" },
];

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 pr-7 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#1677FF]/40 dark:focus:ring-[#00D9FF]/40 cursor-pointer";

export default function TextWorkspace({ onTextChange }: TextWorkspaceProps) {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ai" | "format">("format");
  const [simCarrier, setSimCarrier] = useState<string>("SK");
  const [simPlanId, setSimPlanId] = useState<string>(getSimPlans("SK")[0]?.id ?? "");

  const simPlans = getSimPlans(simCarrier);
  const selectedSimPlan =
    simPlans.find((p) => p.id === simPlanId) ?? simPlans[0];

  const changeSimCarrier = (carrier: string) => {
    setSimCarrier(carrier);
    setSimPlanId(getSimPlans(carrier)[0]?.id ?? "");
  };

  const autoFormat = useCallback(() => {
    const editor = document.querySelector("[data-rich-editor]");
    if (!editor) return;

    const raw = editor.innerHTML;
    let lines: string[];

    if (raw.includes("<h1") || raw.includes("<h2") || raw.includes("<p")) {
      const tmp = document.createElement("div");
      tmp.innerHTML = raw;
      lines = [];
      for (const child of Array.from(tmp.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const t = child.textContent?.trim();
          if (t) lines.push(t);
        } else if (child instanceof HTMLElement) {
          const t = child.textContent?.trim();
          if (t) lines.push(t);
        }
      }
    } else {
      lines = raw.split(/<br\s*\/?>/i).map((l) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = l;
        return tmp.textContent || "";
      });
    }

    lines = lines.filter((l) => l.trim().length > 0);

    const formatted = lines.map((text, index) => {
      let t = text;

      t = t.replace(
        /(\d{1,3}(?:\.\d{3})*)\s*(KRW|₫|VND|원|₩|W|w| đồng|đ)/gi,
        "<b>$1 $2</b>"
      );
      t = t.replace(
        /(100M|500M|1G|2G|300M|200M)\b/g,
        "<b>$1</b>"
      );
      t = t.replace(
        /(\d{3}[-.]?\d{3,4}[-.]?\d{4})/g,
        "<b>$1</b>"
      );

      if (index === 0) {
        return `<h1 style="font-size:1.6em;font-weight:800;line-height:1.2;margin:0 0 4px 0">${t}</h1>`;
      } else if (index <= 2) {
        return `<h2 style="font-size:1.15em;font-weight:700;line-height:1.3;margin:0">${t}</h2>`;
      } else {
        return `<p style="font-size:0.95em;font-weight:500;line-height:1.4;margin:0">${t}</p>`;
      }
    });

    editor.innerHTML = formatted.join("");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  const typeContent = useCallback(async (html: string) => {
    const editor = document.querySelector("[data-rich-editor]");
    if (!editor) return;

    const lines = html.split(/\n/).filter((l) => l.trim().length > 0);
    editor.innerHTML = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const openTags: string[] = [];

      for (let j = 0; j < line.length; j++) {
        if (line[j] === "<") {
          const closeIdx = line.indexOf(">", j);
          if (closeIdx !== -1) {
            const tag = line.slice(j, closeIdx + 1);
            if (tag.startsWith("</")) {
              openTags.pop();
            } else if (!tag.endsWith("/>")) {
              openTags.push(tag);
            }
            continue;
          }
        }

        let built = line.slice(0, j + 1);
        for (let k = openTags.length - 1; k >= 0; k--) {
          const tagName = openTags[k].match(/<(\w+)/)?.[1] || "span";
          built += `</${tagName}>`;
        }

        const wrapper = i === 0 ? "h1" : i <= 2 ? "h2" : "p";
        const styles =
          i === 0
            ? 'style="font-size:1.6em;font-weight:800;line-height:1.2;margin:0 0 4px 0"'
            : i <= 2
              ? 'style="font-size:1.15em;font-weight:700;line-height:1.3;margin:0"'
              : 'style="font-size:0.95em;font-weight:500;line-height:1.4;margin:0"';

        const prevLines = lines.slice(0, i).map((l) => {
          const w = l === lines[0] ? "h1" : i <= 2 ? "h2" : "p";
          return `<${w}>${l}</${w}>`;
        }).join("");

        editor.innerHTML = prevLines + `<${wrapper} ${styles}>${built}</${wrapper}>`;
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 12));
      }

      await new Promise((r) => setTimeout(r, 25));
    }

    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }, []);

  const runGeneration = useCallback(
    async (loadingKey: string, stageText: string, payload: Record<string, unknown>) => {
      setLoadingPackage(loadingKey);
      setStage("Đang gửi yêu cầu...");
      setError(null);

      try {
        setStage(stageText);
        const response = await fetch("/api/generate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, style: "promotional" }),
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
        autoFormat();
        toast.success("Đã tạo nội dung AI");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setLoadingPackage(null);
        setStage("");
      }
    },
    [typeContent, autoFormat]
  );

  const generateForPackage = useCallback(
    (preset: PackageForm) => {
      const packageData: PackageInfo[] = [
        {
          name: preset.name,
          speed: preset.speed,
          price: preset.price,
          bonus: preset.bonus || undefined,
        },
      ];

      return runGeneration(
        `${preset.contentType}:${preset.name}`,
        "AI đang viết nội dung...",
        { packages: packageData, contentType: preset.contentType }
      );
    },
    [runGeneration]
  );

  const generateForSim = useCallback(
    (plan: SimPlan) => {
      const simData: SimInfo = {
        carrier: plan.carrier,
        plan: plan.name,
        policy: plan.policy,
        data: plan.data,
        calls: plan.calls,
        texts: plan.texts,
        price: formatWon(plan.price),
        bonusNew: plan.bonusNew > 0 ? formatWon(plan.bonusNew) : undefined,
        bonusMnp: plan.bonusMnp > 0 ? formatWon(plan.bonusMnp) : undefined,
      };

      return runGeneration(`sim:${plan.id}`, "AI đang viết nội dung SIM...", {
        contentType: "sim",
        sim: simData,
      });
    },
    [runGeneration]
  );

  const renderPackageChip = (preset: PackageForm) => {
    const loadingKey = `${preset.contentType}:${preset.name}`;
    const isLoading = loadingPackage === loadingKey;
    const isAnyLoading = loadingPackage !== null;
    const isOneYear = preset.contentType === "package1year";

    return (
      <button
        key={loadingKey}
        onClick={() => generateForPackage(preset)}
        disabled={isAnyLoading}
        className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.97] ${
          isLoading
            ? "bg-[#00D9FF] text-[#020B2D] animate-pulse-glow"
            : isOneYear
              ? "bg-violet-600 hover:bg-violet-600/90 dark:bg-violet-500 dark:hover:bg-violet-500/90"
              : "bg-[#1677FF] hover:bg-[#1677FF]/90 dark:bg-[#00D9FF] dark:text-[#020B2D] dark:hover:bg-[#00D9FF]/90"
        }`}
        title={`Tạo nội dung ${isOneYear ? "gói 1 năm" : "gói 3 năm"} ${preset.name} (${preset.speed}) – ${preset.price}₩/tháng, ưu đãi ${preset.bonus}`}
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
        <span className="text-[10px] font-bold opacity-80">{preset.price}₩</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
        <button
          onClick={() => setActiveTab("format")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "format"
              ? "bg-[#1677FF] text-white shadow-md shadow-[#1677FF]/20 dark:bg-[#00D9FF] dark:text-[#020B2D] dark:shadow-[#00D9FF]/20"
              : "text-zinc-500 hover:text-[#1677FF] hover:bg-[#1677FF]/5 dark:text-zinc-400 dark:hover:text-[#00D9FF] dark:hover:bg-[#00D9FF]/5"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Text Format
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "ai"
              ? "bg-[#1677FF] text-white shadow-md shadow-[#1677FF]/20 dark:bg-[#00D9FF] dark:text-[#020B2D] dark:shadow-[#00D9FF]/20"
              : "text-zinc-500 hover:text-[#1677FF] hover:bg-[#1677FF]/5 dark:text-zinc-400 dark:hover:text-[#00D9FF] dark:hover:bg-[#00D9FF]/5"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Content
        </button>
      </div>

      {/* AI Content Tab */}
      {activeTab === "ai" && (
        <div className="flex flex-1 min-h-0">
          {/* Left: 40% – nút tạo content */}
          <div className="w-2/5 min-w-[260px] max-w-[460px] flex flex-col border-r border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/20 overflow-hidden">
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

            <div className="flex-1 overflow-hidden flex flex-col gap-2 px-3 py-3">
              {/* Gói 3 năm */}
              <section className="rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    3 năm
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Hợp đồng 36 tháng</span>
                </header>
                <div className="p-1.5 flex flex-wrap gap-1.5">
                  {PRESET_PACKAGES_3Y.map((preset) => renderPackageChip(preset))}
                </div>
              </section>

              {/* Gói 1 năm */}
              <section className="rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    1 năm
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Giá ưu đãi năm đầu</span>
                </header>
                <div className="p-1.5 flex flex-wrap gap-1.5">
                  {PRESET_PACKAGES_1Y.map((preset) => renderPackageChip(preset))}
                </div>
              </section>

              {/* SIM */}
              <section className="rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                    SIM
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Nhà mạng + gói cước</span>
                </header>
                <div className="p-1.5 flex flex-col gap-1.5">
                  <select
                    value={simCarrier}
                    onChange={(e) => changeSimCarrier(e.target.value)}
                    disabled={loadingPackage !== null}
                    className={SELECT_CLASS}
                    title="Chọn nhà mạng SIM"
                  >
                    {SIM_CARRIERS.map((carrier) => (
                      <option key={carrier} value={carrier}>
                        SIM {carrier}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedSimPlan?.id ?? ""}
                    onChange={(e) => setSimPlanId(e.target.value)}
                    disabled={loadingPackage !== null}
                    className={SELECT_CLASS}
                    title="Chọn gói SIM"
                  >
                    {simPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {simPlanLabel(plan)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => selectedSimPlan && generateForSim(selectedSimPlan)}
                    disabled={!selectedSimPlan || loadingPackage !== null}
                    className={`w-full flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.97] bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 ${
                      loadingPackage?.startsWith("sim:") ? "animate-pulse-glow" : ""
                    }`}
                    title="Tạo nội dung SIM theo gói đã chọn"
                  >
                    {loadingPackage?.startsWith("sim:") ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    Tạo SIM
                  </button>
                </div>
              </section>

              {/* Kiểu nội dung */}
              <section className="rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                <header className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-800/40">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    Kiểu nội dung
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Ngắn gọn / phản hồi</span>
                </header>
                <div className="p-1.5 flex flex-wrap gap-1.5">
                  {CONTENT_TYPE_BUTTONS.map((btn) => {
                    const isLoading = loadingPackage?.startsWith(`${btn.type}:`) ?? false;
                    const isAnyLoading = loadingPackage !== null;
                    return (
                      <button
                        key={btn.type}
                        onClick={() => generateForPackage({ ...PRESET_PACKAGES_3Y[0], contentType: btn.type })}
                        disabled={isAnyLoading}
                        className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.97] bg-gradient-to-r ${btn.color} ${
                          isLoading ? "animate-pulse-glow" : ""
                        }`}
                        title={`Tạo ${btn.label}`}
                      >
                        {isLoading ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : btn.type === "short" ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                        {btn.label}
                      </button>
                    );
                  })}

                  <button
                    onClick={autoFormat}
                    disabled={loadingPackage !== null}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#1677FF]/10 text-[#1677FF] hover:bg-[#1677FF]/20 dark:bg-[#00D9FF]/10 dark:text-[#00D9FF] dark:hover:bg-[#00D9FF]/20 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                    title="Tự động định dạng: bôi đậm giá tiền, nổi bật ưu đãi"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Định dạng
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Right: 60% – trình soạn thảo */}
          <div className="flex-1 min-w-0 flex flex-col">
            <RichTextEditor onTextChange={onTextChange} />
          </div>
        </div>
      )}

      {/* Text Format Tab */}
      {activeTab === "format" && <TextFormatTool />}
    </div>
  );
}
