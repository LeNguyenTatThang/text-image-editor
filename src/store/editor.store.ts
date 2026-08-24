import { create } from "zustand";
import type { TextItem, EditorState } from "@/types/editor";
import { DEFAULT_TEXT_STYLE } from "@/types/editor";
import { generateRvFilename } from "@/lib/filename";

interface HistoryEntry {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

interface EditorStore extends HistoryEntry {
  setImage: (dataUrl: string, filename: string) => void;
  addText: (initialText?: string) => void;
  updateText: (id: string, updates: Partial<TextItem>) => void;
  updateTextStyle: (id: string, style: Partial<TextItem["style"]>) => void;
  deleteText: (id: string) => void;
  selectText: (id: string | null) => void;
  resetEditor: () => void;
  revertImage: () => void;
  undo: () => void;
  redo: () => void;
}

function cloneState(state: EditorState): EditorState {
  return JSON.parse(JSON.stringify(state));
}

const initialState: EditorState = {
  image: null,
  originalFilename: null,
  exportFilename: null,
  textItems: [],
  selectedTextId: null,
};

let idCounter = 0;
function nextId(): string {
  return `text-${++idCounter}-${Date.now()}`;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  past: [],
  present: cloneState(initialState),
  future: [],

  setImage: (dataUrl, filename) => {
    const state = get();
    const newPresent: EditorState = {
      ...cloneState(state.present),
      image: dataUrl,
      originalFilename: filename,
      exportFilename: generateRvFilename(filename),
      textItems: [],
      selectedTextId: null,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  addText: (initialText?: string) => {
    const state = get();
    const newItem: TextItem = {
      id: nextId(),
      oldText: "",
      newText: initialText || "New Text",
      x: 100 + state.present.textItems.length * 20,
      y: 100 + state.present.textItems.length * 20,
      rotation: 0,
      style: { ...DEFAULT_TEXT_STYLE },
    };
    const newPresent: EditorState = {
      ...cloneState(state.present),
      textItems: [...state.present.textItems, newItem],
      selectedTextId: newItem.id,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  updateText: (id, updates) => {
    const state = get();
    const newItems = state.present.textItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    const newPresent: EditorState = {
      ...cloneState(state.present),
      textItems: newItems,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  updateTextStyle: (id, style) => {
    const state = get();
    const newItems = state.present.textItems.map((item) =>
      item.id === id ? { ...item, style: { ...item.style, ...style } } : item
    );
    const newPresent: EditorState = {
      ...cloneState(state.present),
      textItems: newItems,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  deleteText: (id) => {
    const state = get();
    const newItems = state.present.textItems.filter((item) => item.id !== id);
    const newPresent: EditorState = {
      ...cloneState(state.present),
      textItems: newItems,
      selectedTextId: state.present.selectedTextId === id ? null : state.present.selectedTextId,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  selectText: (id) => {
    const state = get();
    const newPresent: EditorState = {
      ...cloneState(state.present),
      selectedTextId: id,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  resetEditor: () => {
    set({
      past: [],
      present: cloneState(initialState),
      future: [],
    });
  },

  revertImage: () => {
    const state = get();
    const newPresent: EditorState = {
      image: state.present.image,
      originalFilename: state.present.originalFilename,
      exportFilename: state.present.exportFilename,
      textItems: [],
      selectedTextId: null,
    };
    set({
      past: [...state.past, cloneState(state.present)],
      present: newPresent,
      future: [],
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    set({
      past: newPast,
      present: previous,
      future: [cloneState(state.present), ...state.future],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    set({
      past: [...state.past, cloneState(state.present)],
      present: next,
      future: newFuture,
    });
  },
}));

export const useImage = () => useEditorStore((s) => s.present.image);
export const useOriginalFilename = () => useEditorStore((s) => s.present.originalFilename);
export const useExportFilename = () => useEditorStore((s) => s.present.exportFilename);
export const useTextItems = () => useEditorStore((s) => s.present.textItems);
export const useSelectedTextId = () => useEditorStore((s) => s.present.selectedTextId);
