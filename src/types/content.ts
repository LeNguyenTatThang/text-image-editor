export interface PackageInfo {
  name: string;
  speed: string;
  price: string;
  bonus?: string;
}

export interface ContentRequest {
  packages: PackageInfo[];
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
