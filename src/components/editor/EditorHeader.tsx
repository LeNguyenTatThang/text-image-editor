"use client";

import { useEditorStore } from "@/store/editor.store";
import ExportDialog from "./ExportDialog";

export default function EditorHeader() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm flex items-center px-5 gap-4">
      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          title="Hoà tác"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          title="Làm lại"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-200">RV Image Editor</span>
          <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">v1.0</span>
        </div>
      </div>

      {/* Export */}
      <div className="flex items-center">
        <button
          onClick={() => document.getElementById("export-dialog-trigger")?.click()}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất
        </button>
      </div>
      <ExportDialog />
    </header>
  );
}
