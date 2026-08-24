"use client";

import { useCallback } from "react";
import { generateRvFilename } from "@/lib/filename";
import { formatFileSize } from "@/lib/imageProcessor";

export interface ImageCardData {
  dataUrl: string;
  filename: string;
  customName?: string;
  status: "loading" | "processing" | "done" | "error";
  processMessage?: string;
  processedDataUrl?: string;
  width?: number;
  height?: number;
  originalSize?: number;
  processedSize?: number;
}

interface ImageCardProps {
  image: ImageCardData;
  onRemove: () => void;
}

export default function ImageCard({ image, onRemove }: ImageCardProps) {
  const isLoading = image.status === "loading" || image.status === "processing";
  const isError = image.status === "error";
  const isDone = image.status === "done";

  const displayName = image.customName || image.filename;
  const downloadName = image.customName ? generateRvFilename(image.customName) : generateRvFilename(image.filename);
  const thumbnailUrl = image.processedDataUrl || image.dataUrl;

  const handleDownload = useCallback(() => {
    const url = image.processedDataUrl || image.dataUrl;
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [image.dataUrl, image.processedDataUrl, downloadName]);

  return (
    <div className="group">
      <div className="relative rounded-xl overflow-hidden border border-zinc-300 hover:border-zinc-400 transition-all duration-200 bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:bg-zinc-900">
        {isLoading ? (
          <div className="w-full h-28 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin dark:border-zinc-700" />
            <div className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center px-2">{image.processMessage || "Đang xử lý..."}</div>
          </div>
        ) : isError ? (
          <div className="w-full h-28 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <div className="text-[10px] text-red-400 text-center px-2">Lỗi xử lý</div>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt={image.filename} className="w-full h-28 object-contain bg-white dark:bg-zinc-950" />
            {/* Hover overlay - icons centered */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
              <button onClick={handleDownload} title="Tải xuống" className="w-10 h-10 rounded-full bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              <button onClick={onRemove} title="Xóa" className="w-8 h-8 rounded-full bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-2 px-1">
        <div className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate" title={displayName}>{isLoading ? (image.processMessage || "Đang tải...") : displayName}</div>
        {isDone && image.width && image.height && <div className="text-[9px] text-zinc-400 dark:text-zinc-600 truncate">{image.width}×{image.height} • {formatFileSize(image.processedSize || 0)}</div>}
        {isDone && image.originalSize && image.processedSize && image.originalSize !== image.processedSize && <div className="text-[9px] text-green-500/70 truncate">↓ {formatFileSize(image.originalSize - image.processedSize)} đã tiết kiệm</div>}
      </div>
    </div>
  );
}
