export interface PackageInfo {
  name: string;
  speed: string;
  price: string;
  bonus?: string;
}

export type ContentType = "package" | "package1year" | "short" | "feedback" | "sim";

export interface SimInfo {
  carrier: string;
  plan: string;
  policy: string;
  data: string;
  calls: string;
  texts: string;
  price: string;
  bonusNew?: string;
  bonusMnp?: string;
}

export interface ContentRequest {
  packages?: PackageInfo[];
  contentType?: ContentType;
  sim?: SimInfo;
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
