const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DD",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "TR",
  "UL",
]);

/**
 * Clone `html` into a detached element and turn visual breaks (block elements,
 * <br>, images with alt text) into real "\n" characters so that textContent
 * keeps the same line structure the user sees in the editor.
 */
export function normalizeHtmlForText(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;

  root.querySelectorAll("img").forEach((img) => {
    img.replaceWith(document.createTextNode(img.getAttribute("alt") ?? ""));
  });

  root.querySelectorAll("br").forEach((br) => {
    br.replaceWith(document.createTextNode("\n"));
  });

  root.querySelectorAll("*").forEach((el) => {
    if (BLOCK_TAGS.has(el.tagName)) {
      el.append(document.createTextNode("\n"));
    }
  });

  return root;
}

export function htmlToLines(html: string): string[] {
  const text = (normalizeHtmlForText(html).textContent ?? "").replace(
    /\u00a0/g,
    " "
  );

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function htmlToPlainText(html: string): string {
  return htmlToLines(html).join("\n");
}
