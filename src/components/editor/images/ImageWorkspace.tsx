"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import ImageCard from "./ImageCard";
import type { ImageCardData } from "./ImageCard";
import { processImage } from "@/lib/imageProcessor";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024;

export default function ImageWorkspace() {
  const [images, setImages] = useState<ImageCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (index: number, dataUrl: string, mimeType: string) => {
    try {
      setImages((prev) => prev.map((img, i) => i === index ? { ...img, status: "processing" as const, processMessage: "Đang phân tích..." } : img));
      const result = await processImage(dataUrl, mimeType, (stage) => {
        setImages((prev) => prev.map((img, i) => i === index ? { ...img, processMessage: stage } : img));
      });
      setImages((prev) => prev.map((img, i) => i === index ? { ...img, status: "done" as const, processMessage: undefined, processedDataUrl: result.dataUrl, width: result.width, height: result.height, originalSize: result.originalSize, processedSize: result.processedSize } : img));
    } catch {
      setImages((prev) => prev.map((img, i) => i === index ? { ...img, status: "error" as const, processMessage: "Lỗi xử lý ảnh" } : img));
    }
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (!ACCEPTED.includes(f.type)) { setError("Định dạng không hỗ trợ. Chỉ chấp nhận PNG, JPG, WEBP."); return false; }
      if (f.size > MAX_SIZE) { setError("Kích thước tối đa: 20MB"); return false; }
      return true;
    });
    if (valid.length === 0) return;
    setError(null);
    const startIndex = images.length;
    const placeholders: ImageCardData[] = valid.map((f) => ({ dataUrl: "", filename: f.name, status: "loading" as const, processMessage: "Đang đọc file..." }));
    setImages((prev) => [...prev, ...placeholders]);
    valid.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImages((prev) => prev.map((img, idx) => idx === startIndex + i ? { ...img, dataUrl } : img));
        processFile(startIndex + i, dataUrl, file.type);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length, processFile]);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files); }, [handleFiles]);
  const removeImage = useCallback((index: number) => { setImages((prev) => prev.filter((_, i) => i !== index)); }, []);

  const handleDownloadAll = useCallback(async () => {
    const zip = new JSZip();
    const doneImages = images.filter((img) => img.status === "done" && (img.processedDataUrl || img.dataUrl));
    doneImages.forEach((img, i) => {
      const dataUrl = img.processedDataUrl || img.dataUrl;
      const base64 = dataUrl.split(",")[1];
      const ext = dataUrl.includes("image/png") ? ".png" : dataUrl.includes("image/webp") ? ".webp" : ".jpg";
      const name = img.customName ? img.customName.replace(/\.[^.]+$/, ext) : `image-${i + 1}${ext}`;
      zip.file(name, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [images]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        handleFiles(imageFiles);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Ảnh</span>
          {images.length > 0 && <span className="text-[10px] text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{images.length}</span>}
        </div>
        <button onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-all duration-200 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white dark:border-zinc-700/50">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Thêm hình ảnh
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files); e.target.value = ""; }} className="hidden" />

      <div className="flex-1 min-h-0 overflow-hidden">
        {images.length === 0 ? (
          <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
            className={`h-full flex flex-col items-center justify-center mx-4 my-3 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragging ? "border-blue-500 bg-blue-500/10" : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/30"}`}
            onClick={() => inputRef.current?.click()}>
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800/60 flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">Chưa có hình ảnh</div>
            <div className="text-zinc-400 dark:text-zinc-600 text-[11px] mt-1">Thêm hình ảnh để bắt đầu chỉnh sửa</div>
            <div className="text-zinc-300 dark:text-zinc-700 text-[10px] mt-2 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800/40">Drag & drop, click hoặc Ctrl+V để dán ảnh</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 max-[449px]:grid-cols-2 gap-3 px-5 py-3 h-full items-center overflow-y-auto">
            {images.map((img, index) => (<ImageCard key={`${img.filename}-${index}`} image={img} onRemove={() => removeImage(index)} />))}
          </div>
        )}
      </div>

      {error && <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">{error}</div>}
    </div>
  );
}
