"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface RichTextEditorProps {
  initialHtml?: string;
  onPushToEditor?: (html: string) => void;
}

const TOOLBAR_BUTTONS = [
  { cmd: "undo", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", title: "Hoàn tác" },
  { cmd: "redo", icon: "M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6", title: "Làm lại" },
  { cmd: "bold", icon: "M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z", title: "Đậm" },
  { cmd: "italic", icon: "M19 4h-9 M14 20H5 M15 4L9 20", title: "Nghiêng" },
  { cmd: "underline", icon: "M6 3v7a6 6 0 006 6 6 6 0 006-6V3 M4 21h16", title: "Gạch chân" },
] as const;

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

function applyFontSize(size: number) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);

  // Check if selection is inside our editor
  const editor = document.querySelector("[data-rich-editor]");
  if (!editor || !editor.contains(range.commonAncestorContainer)) return;

  // Wrap selection in span with font-size
  const span = document.createElement("span");
  span.style.fontSize = `${size}px`;

  try {
    range.surroundContents(span);
  } catch {
    // If surroundContents fails (partial selection across elements), use extractContents
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }

  sel.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  sel.addRange(newRange);
}

export default function RichTextEditor({ initialHtml }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState("16");
  const [activeCmds, setActiveCmds] = useState<Set<string>>(new Set());
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml;
      setIsEmpty(false);
    }
  }, [initialHtml]);

  const updateActiveCommands = useCallback(() => {
    const cmds = new Set<string>();
    if (document.queryCommandState("bold")) cmds.add("bold");
    if (document.queryCommandState("italic")) cmds.add("italic");
    if (document.queryCommandState("underline")) cmds.add("underline");
    setActiveCmds(cmds);

    // Check if editor is empty
    if (editorRef.current) {
      const text = editorRef.current.textContent || "";
      setIsEmpty(text.trim().length === 0);
    }
  }, []);

  const execCmd = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveCommands();
  }, [updateActiveCommands]);

  const handleFontSize = useCallback((size: number) => {
    setCurrentSize(String(size));
    applyFontSize(size);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    updateActiveCommands();
  }, [updateActiveCommands]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); execCmd("bold"); }
      if (e.key === "i") { e.preventDefault(); execCmd("italic"); }
      if (e.key === "u") { e.preventDefault(); execCmd("underline"); }
    }
  }, [execCmd]);

  const handleCopy = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const html = editor.innerHTML;
    const text = editor.textContent || "";

    try {
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([text], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      });
      await navigator.clipboard.write([item]);
    } catch {
      // Fallback: select all and execCommand copy
      const range = document.createRange();
      range.selectNodeContents(editor);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("copy");
      sel?.removeAllRanges();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
          Trình soạn thảo
        </span>
        <button
          onClick={handleCopy}
          disabled={isEmpty}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Sao chép đã format"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Sao chép
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-zinc-800/60 flex-wrap">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.cmd}
            onClick={() => execCmd(btn.cmd)}
            title={btn.title}
            className={`p-1.5 rounded-md transition-all duration-150 ${
              activeCmds.has(btn.cmd)
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d={btn.icon} />
            </svg>
          </button>
        ))}

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        <select
          value={currentFont}
          onChange={(e) => {
            setCurrentFont(e.target.value);
            execCmd("fontName", e.target.value);
          }}
          className="text-[11px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded-md px-2 py-1 focus:outline-none focus:border-zinc-600 cursor-pointer"
        >
          {["Arial", "Inter", "Roboto", "Montserrat", "Poppins", "Times New Roman", "Courier New"].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={currentSize}
          onChange={(e) => handleFontSize(Number(e.target.value))}
          className="text-[11px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded-md px-2 py-1 ml-1 focus:outline-none focus:border-zinc-600 cursor-pointer w-14"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        <input
          type="color"
          defaultValue="#ffffff"
          onChange={(e) => execCmd("foreColor", e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
          title="Màu chữ"
        />
      </div>

      {/* Editor area */}
      <div className="flex-1 p-3 min-h-0 relative">
        {isEmpty && (
          <div className="absolute top-6 left-7 text-zinc-600 text-sm pointer-events-none select-none">
            Nhập và định dạng text tại đây...
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveCommands}
          data-rich-editor
          className="w-full h-full text-sm text-zinc-200 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 overflow-y-auto leading-relaxed transition-all duration-200 min-h-[120px]"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
