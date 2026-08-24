"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface SourceTextareaProps {
  onPushToEditor: (html: string) => void;
  editorKey: number;
}

export default function SourceTextarea({ onPushToEditor, editorKey }: SourceTextareaProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevKeyRef = useRef(editorKey);
  const isPastingRef = useRef(false);

  // Clear text when editorKey changes (new push happened)
  useEffect(() => {
    if (editorKey !== prevKeyRef.current) {
      prevKeyRef.current = editorKey;
      setText("");
    }
  }, [editorKey]);

  const pushToEditor = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      const html = content
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => `<p>${l}</p>`)
        .join("");
      onPushToEditor(html);
    },
    [onPushToEditor]
  );

  const handleCopy = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = start !== end ? text.substring(start, end) : text;
    navigator.clipboard.writeText(selected);
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
    textareaRef.current?.focus();
  }, []);

  // Handle native Ctrl+V paste on textarea
  const handleNativePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // Set flag to prevent handlePaste (button) from also firing
      isPastingRef.current = true;
      setTimeout(() => { isPastingRef.current = false; }, 100);

      const pasted = e.clipboardData.getData("text");
      if (pasted) {
        // Auto-push to editor after paste
        setTimeout(() => pushToEditor(pasted), 0);
      }
    },
    [pushToEditor]
  );

  // Handle Paste button click
  const handlePasteButton = useCallback(async () => {
    if (isPastingRef.current) return; // Prevent duplicate if Ctrl+V just fired
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
      pushToEditor(clipText);
    } catch {
      textareaRef.current?.focus();
    }
  }, [pushToEditor]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
          Text Gốc
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePasteButton}
            className="px-2.5 py-1 text-[11px] rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
          >
            Dán
          </button>
          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-2.5 py-1 text-[11px] rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sao chép
          </button>
          <button
            onClick={handleClear}
            disabled={!text}
            className="px-2.5 py-1 text-[11px] rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 min-h-0">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handleNativePaste}
          placeholder="Dán text vào đây → tự động đưa sang Editor..."
          className="w-full h-full text-sm text-zinc-200 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-zinc-600 resize-none leading-relaxed transition-all duration-200"
        />
      </div>
    </div>
  );
}
