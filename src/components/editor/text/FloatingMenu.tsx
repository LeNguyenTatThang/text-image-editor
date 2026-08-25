"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface FloatingMenuProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onRewrite: (selectedText: string) => void;
}

export default function FloatingMenu({ editorRef, onRewrite }: FloatingMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current) {
      setVisible(false);
      return;
    }

    const text = sel.toString().trim();
    if (!text || text.length < 2) {
      setVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      setVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom - editorRect.top + 8,
      left: rect.left - editorRect.left + rect.width / 2,
    });
    setSelectedText(text);
    setVisible(true);
  }, [editorRef]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(checkSelection, 10);
    };
    const handleKeyDown = () => {
      setTimeout(checkSelection, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyDown);
    };
  }, [checkSelection]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRewrite = useCallback(() => {
    onRewrite(selectedText);
    setVisible(false);
  }, [selectedText, onRewrite]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
    >
      <div className="flex items-center gap-1 bg-zinc-900 dark:bg-zinc-100 rounded-lg shadow-xl border border-zinc-700 dark:border-zinc-300 px-1.5 py-1">
        <button
          onClick={handleRewrite}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-md transition-colors"
          title="Viết lại bằng AI"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          Viết lại
        </button>
      </div>
    </div>
  );
}
