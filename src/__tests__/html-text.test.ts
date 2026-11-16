import { describe, it, expect } from "vitest";
import { htmlToLines, htmlToPlainText } from "@/lib/html-text";

describe("html-text", () => {
  it("keeps line breaks from block elements", () => {
    const html =
      "<div>⚡ Dòng một</div><div>🎁 Dòng hai</div><div>🚀 Dòng ba</div>";

    expect(htmlToLines(html)).toEqual(["⚡ Dòng một", "🎁 Dòng hai", "🚀 Dòng ba"]);
  });

  it("keeps line breaks from <br> and plain newlines", () => {
    const html = "Dòng một<br>Dòng hai\nDòng ba";

    expect(htmlToPlainText(html)).toBe("Dòng một\nDòng hai\nDòng ba");
  });

  it("handles nested block elements without duplicating empty lines", () => {
    const html = "<p>Dòng một</p><div><p>Dòng hai</p></div>";

    expect(htmlToLines(html)).toEqual(["Dòng một", "Dòng hai"]);
  });

  it("turns images with alt text into text instead of dropping them", () => {
    const html = '<div><img alt="⚡" src="emoji.png"> Cần mạng mạnh</div>';

    expect(htmlToLines(html)).toEqual(["⚡ Cần mạng mạnh"]);
  });
});
