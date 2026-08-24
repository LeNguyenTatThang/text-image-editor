const MAX_PIXELS = 40_000_000;
const JPEG_QUALITY = 0.95;
const WEBP_QUALITY = 0.95;

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
  originalSize: number;
  processedSize: number;
}

function shouldResize(width: number, height: number): { scale: number; newW: number; newH: number } | null {
  const totalPixels = width * height;
  if (totalPixels <= MAX_PIXELS) return null;

  const scale = Math.sqrt(MAX_PIXELS / totalPixels);
  return {
    scale,
    newW: Math.round(width * scale),
    newH: Math.round(height * scale),
  };
}

function detectFormat(mimeType: string): "jpeg" | "png" | "webp" {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpeg";
}

function getMimeType(format: string): string {
  switch (format) {
    case "png": return "image/png";
    case "webp": return "image/webp";
    default: return "image/jpeg";
  }
}

export function processImage(
  dataUrl: string,
  mimeType: string,
  onProgress?: (stage: string) => void
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        onProgress?.("Đang phân tích...");

        const originalSize = Math.round((dataUrl.length * 3) / 4);
        const format = detectFormat(mimeType);

        let { width, height } = img;

        // Check if resize needed
        const resize = shouldResize(width, height);
        if (resize) {
          onProgress?.("Đang giảm kích thước...");
          width = resize.newW;
          height = resize.newH;
        }

        // Create canvas and draw
        onProgress?.("Đang xử lý...");
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot create canvas context"));
          return;
        }

        // Fill white background for JPEG (no alpha)
        if (format === "jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        // Canvas handles EXIF orientation automatically in most browsers
        ctx.drawImage(img, 0, 0, width, height);

        onProgress?.("Đang mã hóa...");

        // Re-encode (strips metadata, normalizes color)
        const mimeTypeOut = getMimeType(format);
        const quality = format === "png" ? undefined : (format === "webp" ? WEBP_QUALITY : JPEG_QUALITY);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to encode image"));
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              const processedDataUrl = reader.result as string;
              const processedSize = Math.round(blob.size);

              // Cleanup
              canvas.width = 0;
              canvas.height = 0;

              resolve({
                dataUrl: processedDataUrl,
                width,
                height,
                format,
                originalSize,
                processedSize,
              });
            };
            reader.onerror = () => reject(new Error("Failed to read processed blob"));
            reader.readAsDataURL(blob);
          },
          mimeTypeOut,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
