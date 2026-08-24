"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editor.store";
import { generateRvFilename } from "@/lib/filename";

type ExportFormat = "png" | "jpeg" | "webp";
type ExportScale = "1x" | "2x" | "3x";

export default function ExportDialog() {
  const image = useEditorStore((s) => s.present.image);
  const originalFilename = useEditorStore((s) => s.present.originalFilename);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(100);
  const [scale, setScale] = useState<ExportScale>("1x");
  const [exporting, setExporting] = useState(false);

  const exportFilename = originalFilename
    ? generateRvFilename(originalFilename.replace(/\.[^.]+$/, `.${format}`))
    : `image-rv.${format}`;

  const handleExport = useCallback(async () => {
    if (!image) return;
    setExporting(true);

    try {
      const canvasEl = document.querySelector("canvas");
      if (!canvasEl) throw new Error("Canvas not found");

      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) throw new Error("Cannot create context");

      const scaleNum = scale === "1x" ? 1 : scale === "2x" ? 2 : 3;

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = image;
      });

      tempCanvas.width = canvasEl.width * scaleNum;
      tempCanvas.height = canvasEl.height * scaleNum;

      ctx.scale(scaleNum, scaleNum);
      ctx.drawImage(canvasEl, 0, 0);

      const mimeType =
        format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      const qualityNum = quality / 100;

      tempCanvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = exportFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExporting(false);
          setOpen(false);
        },
        mimeType,
        format === "png" ? undefined : qualityNum
      );
    } catch {
      setExporting(false);
    }
  }, [image, format, quality, scale, exportFilename]);

  return (
    <>
      <button
        id="export-dialog-trigger"
        onClick={() => setOpen(true)}
        className="hidden"
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 dark:bg-zinc-900 bg-white border border-zinc-700 dark:border-zinc-700 border-zinc-300 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white dark:text-white text-zinc-900 mb-4">Xuất ảnh</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 dark:text-zinc-400 text-zinc-600 block mb-1">Tên file</label>
                <input
                  type="text"
                  value={exportFilename}
                  readOnly
                  className="w-full bg-zinc-800 dark:bg-zinc-800 bg-zinc-100 border border-zinc-700 dark:border-zinc-700 border-zinc-300 text-zinc-200 dark:text-zinc-200 text-zinc-800 text-sm rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 dark:text-zinc-400 text-zinc-600 block mb-1">Định dạng</label>
                <div className="flex gap-2">
                  {(["png", "jpeg", "webp"] as ExportFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFormat(f);
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded transition-colors uppercase ${
                        format === f
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 dark:bg-zinc-800 bg-zinc-100 text-zinc-300 dark:text-zinc-300 text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {format !== "png" && (
                <div>
                  <label className="text-xs text-zinc-400 dark:text-zinc-400 text-zinc-600 block mb-1">
                    Chất lượng: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400 dark:text-zinc-400 text-zinc-600 block mb-1">Tỷ lệ</label>
                <div className="flex gap-2">
                  {(["1x", "2x", "3x"] as ExportScale[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                        scale === s
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 dark:bg-zinc-800 bg-zinc-100 text-zinc-300 dark:text-zinc-300 text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 text-sm rounded bg-zinc-800 dark:bg-zinc-800 bg-zinc-100 text-zinc-300 dark:text-zinc-300 text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {exporting ? "Đang xuất..." : "Xuất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
