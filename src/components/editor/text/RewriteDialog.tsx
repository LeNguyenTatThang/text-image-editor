"use client";

import { useState, useCallback } from "react";

interface RewriteDialogProps {
  open: boolean;
  versions: string[];
  loading: boolean;
  onSelect: (text: string) => void;
  onClose: () => void;
  onRetry: () => void;
}

export default function RewriteDialog({ open, versions, loading, onSelect, onClose, onRetry }: RewriteDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback(() => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
    }
  }, [selected, onSelect]);

  const handleClose = useCallback(() => {
    setSelected(null);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 dark:bg-zinc-900 bg-white border border-zinc-700 dark:border-zinc-700 border-zinc-300 rounded-xl p-5 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white dark:text-white text-zinc-900">Viết lại bằng AI</h3>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white dark:hover:text-zinc-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-zinc-400">AI đang viết lại...</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {versions.map((version, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(version)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-150 ${
                    selected === version
                      ? "border-blue-500 bg-blue-500/10 text-white dark:text-zinc-900"
                      : "border-zinc-700 dark:border-zinc-300 bg-zinc-800/50 dark:bg-zinc-100 text-zinc-300 dark:text-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-400"
                  }`}
                >
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">Phiên bản {index + 1}</span>
                  {version}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onRetry}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-zinc-800 dark:bg-zinc-100 text-zinc-300 dark:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Tạo lại
              </button>
              <button
                onClick={handleSelect}
                disabled={!selected}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
