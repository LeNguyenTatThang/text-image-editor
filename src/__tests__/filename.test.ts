import { describe, it, expect } from "vitest";
import { generateRvFilename } from "@/lib/filename";

describe("generateRvFilename", () => {
  it("should add -rv before extension", () => {
    expect(generateRvFilename("photo.jpg")).toBe("photo-rv.jpg");
    expect(generateRvFilename("image.png")).toBe("image-rv.png");
    expect(generateRvFilename("banner.webp")).toBe("banner-rv.webp");
  });

  it("should handle filenames with multiple dots", () => {
    expect(generateRvFilename("my.photo.jpg")).toBe("my.photo-rv.jpg");
    expect(generateRvFilename("image.2024.png")).toBe("image.2024-rv.png");
  });

  it("should not add -rv if already present", () => {
    expect(generateRvFilename("photo-rv.jpg")).toBe("photo-rv.jpg");
    expect(generateRvFilename("image-rv.png")).toBe("image-rv.png");
  });

  it("should handle filename without extension", () => {
    expect(generateRvFilename("photo")).toBe("photo-rv");
    expect(generateRvFilename("image")).toBe("image-rv");
  });

  it("should handle empty string", () => {
    expect(generateRvFilename("")).toBe("-rv");
  });

  it("should handle JPEG extension", () => {
    expect(generateRvFilename("photo.jpeg")).toBe("photo-rv.jpeg");
  });

  it("should handle uppercase extensions", () => {
    expect(generateRvFilename("photo.JPG")).toBe("photo-rv.JPG");
    expect(generateRvFilename("image.PNG")).toBe("image-rv.PNG");
  });
});
