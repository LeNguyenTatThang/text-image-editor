"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface RichTextEditorProps {
  initialHtml?: string;
  onPushToEditor?: (html: string) => void;
  onTextChange?: (info: { charCount: number; lineCount: number }) => void;
}

function execAlignCommand(command: string) {
  document.execCommand(command, false);
}

const TB = "p-1.5 rounded-md transition-all duration-150 ";
const TB_OFF = "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800";
const TB_ON = "bg-zinc-300 text-zinc-900 dark:bg-zinc-700 dark:text-white";
const SEL = "text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-md px-2 py-1 focus:outline-none focus:border-zinc-600 cursor-pointer dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/50";
const SEP = "w-px h-5 bg-zinc-300 mx-1 dark:bg-zinc-800";

export default function RichTextEditor({ initialHtml, onTextChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFont, setCurrentFont] = useState("Times New Roman");
  const [activeCmds, setActiveCmds] = useState<Set<string>>(new Set());
  const [isEmpty, setIsEmpty] = useState(true);

  const emitTextChange = useCallback(() => {
    if (!editorRef.current || !onTextChange) return;
    const text = editorRef.current.textContent || "";
    const html = editorRef.current.innerHTML || "";
    const charCount = text.length;
    const lineCount = html.split(/<br\s*\/?>/i).length || 1;
    onTextChange({ charCount, lineCount });
  }, [onTextChange]);

  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml;
      setIsEmpty(false);
      emitTextChange();
    }
  }, [initialHtml, emitTextChange]);

  const updateActiveCommands = useCallback(() => {
    const cmds = new Set<string>();
    if (document.queryCommandState("bold")) cmds.add("bold");
    if (document.queryCommandState("italic")) cmds.add("italic");
    if (document.queryCommandState("underline")) cmds.add("underline");
    if (document.queryCommandState("justifyLeft")) cmds.add("justifyLeft");
    if (document.queryCommandState("justifyCenter")) cmds.add("justifyCenter");
    if (document.queryCommandState("justifyRight")) cmds.add("justifyRight");
    if (document.queryCommandState("justifyFull")) cmds.add("justifyFull");
    setActiveCmds(cmds);
    if (editorRef.current) {
      const text = editorRef.current.textContent || "";
      setIsEmpty(text.trim().length === 0);
    }
    emitTextChange();
  }, [emitTextChange]);

  const execCmd = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveCommands();
  }, [updateActiveCommands]);

  const handleAlign = useCallback((align: string) => {
    const cmdMap: Record<string, string> = { left: "justifyLeft", center: "justifyCenter", right: "justifyRight", justify: "justifyFull" };
    execAlignCommand(cmdMap[align]);
  }, []);

  const handleHighlight = useCallback((color: string) => { execCmd("hiliteColor", color); }, [execCmd]);
  const clearHighlight = useCallback(() => { execCmd("hiliteColor", "transparent"); }, [execCmd]);
  const clearFormatting = useCallback(() => { execCmd("removeFormat"); }, [execCmd]);

  const handleInput = useCallback(() => { updateActiveCommands(); }, [updateActiveCommands]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); execCmd("bold"); }
      if (e.key === "i") { e.preventDefault(); execCmd("italic"); }
      if (e.key === "u") { e.preventDefault(); execCmd("underline"); }
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); execCmd("undo"); }
      if (e.key === "z" && e.shiftKey) { e.preventDefault(); execCmd("redo"); }
      if (e.key === "y") { e.preventDefault(); execCmd("redo"); }
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
      await navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })]);
    } catch {
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
          Trình soạn thảo
        </span>
        <button onClick={handleCopy} disabled={isEmpty}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98]"
          title="Sao chép đã format">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          Sao chép
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/60 overflow-x-auto">
        <button onClick={() => execCmd("bold")} title="Đậm (Ctrl+B)" className={TB + (activeCmds.has("bold") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
        </button>
        <button onClick={() => execCmd("italic")} title="Nghiêng (Ctrl+I)" className={TB + (activeCmds.has("italic") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 4h-9 M14 20H5 M15 4L9 20" /></svg>
        </button>
        <button onClick={() => execCmd("underline")} title="Gạch chân (Ctrl+U)" className={TB + (activeCmds.has("underline") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3 M4 21h16" /></svg>
        </button>
        <div className={SEP} />
        <select value={currentFont} onChange={(e) => { setCurrentFont(e.target.value); execCmd("fontName", e.target.value); }} className={SEL}>
          {["Times New Roman", "Inter", "Roboto", "Montserrat", "Poppins", "Courier New"].map((f) => (<option key={f} value={f}>{f}</option>))}
        </select>
        <div className={SEP} />
        <button onClick={() => handleAlign("left")} title="Căn trái" className={TB + (activeCmds.has("justifyLeft") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h16" /></svg>
        </button>
        <button onClick={() => handleAlign("center")} title="Căn giữa" className={TB + (activeCmds.has("justifyCenter") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12M4 18h16" /></svg>
        </button>
        <button onClick={() => handleAlign("right")} title="Căn phải" className={TB + (activeCmds.has("justifyRight") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 12h12M3 18h18" /></svg>
        </button>
        <button onClick={() => handleAlign("justify")} title="Căn đều" className={TB + (activeCmds.has("justifyFull") ? TB_ON : TB_OFF)}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <div className={SEP} />
        <input type="color" defaultValue="#ffffff" onChange={(e) => execCmd("foreColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="Màu chữ" />
        <input type="color" defaultValue="#ffff00" onChange={(e) => handleHighlight(e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" title="Màu nổi bật" />
        <button onClick={clearHighlight} title="Xóa nổi bật" className={TB + TB_OFF}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className={SEP} />
        <button onClick={clearFormatting} title="Xóa định dạng" className={TB + TB_OFF}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 3H7l5 5M7 3v4M17 3v4M5 21h14M9 7l-4 14M19 7l-4 14" /></svg>
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 p-3 min-h-0 relative">
        {isEmpty && (
          <div className="absolute top-6 left-7 text-zinc-400 dark:text-zinc-600 text-sm pointer-events-none select-none">
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
          className="w-full h-full text-sm text-zinc-800 bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 overflow-y-auto leading-relaxed transition-all duration-200 min-h-[120px] dark:text-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
