"use client";

import RichTextEditor from "./RichTextEditor";

interface TextWorkspaceProps {
  onTextChange?: (info: { charCount: number; lineCount: number }) => void;
}

export default function TextWorkspace({ onTextChange }: TextWorkspaceProps) {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <RichTextEditor onTextChange={onTextChange} />
    </div>
  );
}
