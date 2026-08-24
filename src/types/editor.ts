export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  opacity: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke?: {
    color: string;
    width: number;
  };
}

export interface TextItem {
  id: string;
  oldText: string;
  newText: string;
  source?: "manual" | "ocr";
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  style: TextStyle;
}

export interface EditorState {
  image: string | null;
  originalFilename: string | null;
  exportFilename: string | null;
  textItems: TextItem[];
  selectedTextId: string | null;
}

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: "Inter",
  fontSize: 32,
  fontWeight: 400,
  fontStyle: "normal",
  color: "#FFFFFF",
  textAlign: "center",
  letterSpacing: 0,
  lineHeight: 1.2,
  opacity: 1,
  shadow: undefined,
  stroke: undefined,
};

export const FONT_OPTIONS = [
  "Inter",
  "Be Vietnam Pro",
  "Roboto",
  "Montserrat",
  "Poppins",
  "Noto Sans",
  "Arial",
  "Times New Roman",
];

export const FONT_WEIGHT_OPTIONS: { label: string; value: number }[] = [
  { label: "400", value: 400 },
  { label: "500", value: 500 },
  { label: "600", value: 600 },
  { label: "700", value: 700 },
  { label: "800", value: 800 },
];
