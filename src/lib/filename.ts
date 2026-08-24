export function generateRvFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return filename + "-rv";

  const name = filename.substring(0, lastDot);
  const ext = filename.substring(lastDot);

  if (name.endsWith("-rv")) return filename;

  return name + "-rv" + ext;
}
