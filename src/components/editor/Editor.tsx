"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import TextWorkspace from "./text/TextWorkspace";
import ImageWorkspace from "./images/ImageWorkspace";

export default function Editor() {
  const [textInfo, setTextInfo] = useState({ charCount: 0, lineCount: 0 });
  const [splitRatio, setSplitRatio] = useState(70);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleTextChange = useCallback((info: { charCount: number; lineCount: number }) => {
    setTextInfo(info);
  }, []);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onDragMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = (y / rect.height) * 100;
      setSplitRatio(Math.min(Math.max(pct, 20), 80));
    };
    const onDragEnd = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <EditorHeader />
      <div ref={containerRef} className="flex-1 flex flex-col min-h-0">
        <div style={{ height: `${splitRatio}%` }} className="min-h-0 overflow-hidden">
          <TextWorkspace onTextChange={handleTextChange} />
        </div>
        <div
          onMouseDown={onDragStart}
          className="h-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-row-resize shrink-0 transition-colors duration-150 flex items-center justify-center group"
        >
          <div className="w-8 h-0.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-white transition-colors" />
        </div>
        <div style={{ height: `${100 - splitRatio}%` }} className="min-h-0 overflow-hidden">
          <ImageWorkspace />
        </div>
      </div>
      <EditorFooter charCount={textInfo.charCount} lineCount={textInfo.lineCount} />
    </div>
  );
}
