"use client";

import RichTextEditor from "./RichTextEditor";

export default function TextWorkspace() {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <RichTextEditor />
    </div>
  );
}
