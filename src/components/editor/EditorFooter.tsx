"use client";

import { useEditorStore } from "@/store/editor.store";

export default function EditorFooter() {
  const resetEditor = useEditorStore((s) => s.resetEditor);

  return (
    <footer className="h-11 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm flex items-center px-5 justify-end">
      <button
        onClick={resetEditor}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Đặt lại
      </button>
    </footer>
  );
}
