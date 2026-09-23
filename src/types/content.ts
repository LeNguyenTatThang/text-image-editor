export interface PackageInfo {
  name: string;
  speed: string;
  price: string;
  bonus?: string;
}

export type ContentType = "package" | "short" | "feedback";

export interface ContentRequest {
  packages: PackageInfo[];
  contentType?: ContentType;
  style?: "casual" | "formal" | "promotional";
  language?: "vi" | "en";
}

export interface ContentResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
