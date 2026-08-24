"use client";

import { useState, useCallback } from "react";
import SourceTextarea from "./SourceTextarea";
import RichTextEditor from "./RichTextEditor";

export default function TextWorkspace() {
  const [editorHtml, setEditorHtml] = useState<string | undefined>(undefined);
  const [editorKey, setEditorKey] = useState(0);

  const handlePushToEditor = useCallback((html: string) => {
    setEditorHtml(html);
    setEditorKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="grid grid-cols-[2fr_3fr] h-full min-h-0">
        <div className="border-r border-zinc-800/80 min-h-0">
          <SourceTextarea onPushToEditor={handlePushToEditor} editorKey={editorKey} />
        </div>
        <div className="min-h-0">
          <RichTextEditor
            key={editorKey}
            initialHtml={editorHtml}
          />
        </div>
      </div>
    </div>
  );
}
