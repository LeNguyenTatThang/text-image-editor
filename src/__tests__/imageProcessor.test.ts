import { describe, it, expect } from "vitest";
import { formatFileSize } from "@/lib/imageProcessor";

describe("formatFileSize", () => {
  it("should format bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(10240)).toBe("10.0 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(2621440)).toBe("2.5 MB");
    expect(formatFileSize(10485760)).toBe("10.0 MB");
  });

  it("should handle large values", () => {
    expect(formatFileSize(1073741824)).toBe("1024.0 MB");
  });
});
