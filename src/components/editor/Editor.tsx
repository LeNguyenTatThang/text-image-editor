"use client";

import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import TextWorkspace from "./text/TextWorkspace";
import ImageWorkspace from "./images/ImageWorkspace";

export default function Editor() {
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white">
      <EditorHeader />
      <div className="flex-1 grid grid-rows-[minmax(0,7fr)_minmax(0,3fr)] min-h-0">
        <TextWorkspace />
        <ImageWorkspace />
      </div>
      <EditorFooter />
    </div>
  );
}
