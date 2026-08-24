"use client";

import { useState, useCallback } from "react";
import { generateRvFilename } from "@/lib/filename";
import { formatFileSize } from "@/lib/imageProcessor";
import RenameImageDialog from "./RenameImageDialog";

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
  onRename: (newName: string) => void;
}

export default function ImageCard({ image, onRemove, onRename }: ImageCardProps) {
  const [showRename, setShowRename] = useState(false);

  const isLoading = image.status === "loading" || image.status === "processing";
  const isError = image.status === "error";
  const isDone = image.status === "done";

  const displayName = image.customName || image.filename;
  const downloadName = image.customName
    ? generateRvFilename(image.customName)
    : generateRvFilename(image.filename);

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
    <>
      <div className="flex-shrink-0 w-44 group">
        <div className="relative rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-200 bg-zinc-900">
          {isLoading ? (
            /* Loading skeleton */
            <div className="w-full h-28 bg-zinc-900 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
              <div className="text-[10px] text-zinc-600 text-center px-2">
                {image.processMessage || "Đang xử lý..."}
              </div>
            </div>
          ) : isError ? (
            /* Error state */
            <div className="w-full h-28 bg-zinc-900 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-[10px] text-red-400 text-center px-2">Lỗi xử lý</div>
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={image.filename}
                className="w-full h-28 object-contain bg-zinc-950"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              {/* Icon actions on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={handleDownload}
                  title="Tải xuống"
                  className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white/80 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={onRemove}
                  title="Xóa"
                  className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white/80 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-2 px-1">
          <div className="text-[11px] text-zinc-300 truncate" title={displayName}>
            {isLoading ? (image.processMessage || "Đang tải...") : displayName}
          </div>
          {isDone && image.width && image.height && (
            <div className="text-[9px] text-zinc-600 truncate">
              {image.width}×{image.height} • {formatFileSize(image.processedSize || 0)}
            </div>
          )}
          {isDone && image.originalSize && image.processedSize && image.originalSize !== image.processedSize && (
            <div className="text-[9px] text-green-500/70 truncate">
              ↓ {formatFileSize(image.originalSize - image.processedSize)} đã tiết kiệm
            </div>
          )}
        </div>

        {/* Actions */}
        {isDone && (
          <div className="flex gap-1 mt-1.5 px-1">
            <button
              onClick={onRemove}
              title="Hoàn tác"
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={() => setShowRename(true)}
              title="Đổi tên"
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all duration-200"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDownload}
              title="Tải xuống"
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] rounded-md text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {showRename && (
        <RenameImageDialog
          filename={displayName}
          onSave={(newName) => {
            onRename(newName);
            setShowRename(false);
          }}
          onCancel={() => setShowRename(false)}
        />
      )}
    </>
  );
}
