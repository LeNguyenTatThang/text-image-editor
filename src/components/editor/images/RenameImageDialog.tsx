"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface RenameImageDialogProps {
  filename: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
}

export default function RenameImageDialog({ filename, onSave, onCancel }: RenameImageDialogProps) {
  const [name, setName] = useState(filename.replace(/\.[^.]+$/, ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = useCallback(() => {
    const ext = filename.match(/\.[^.]+$/)?.[0] || "";
    const trimmed = name.trim();
    if (trimmed) {
      onSave(trimmed + ext);
    }
  }, [name, filename, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="bg-zinc-900 dark:bg-zinc-900 bg-white border border-zinc-700 dark:border-zinc-700 border-zinc-300 rounded-xl p-5 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-sm font-semibold text-white dark:text-white text-zinc-900 mb-3">Đổi tên ảnh</h4>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
          className="w-full bg-zinc-800 dark:bg-zinc-800 bg-zinc-100 border border-zinc-700 dark:border-zinc-700 border-zinc-300 text-zinc-200 dark:text-zinc-200 text-zinc-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50"
        />
        <div className="text-[10px] text-zinc-600 dark:text-zinc-600 text-zinc-400 mt-1">
          Extension: {filename.match(/\.[^.]+$/)?.[0] || "(không có)"}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-zinc-800 dark:bg-zinc-800 bg-zinc-100 text-zinc-300 dark:text-zinc-300 text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
