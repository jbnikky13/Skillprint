import type { DocumentAdapter } from "../documents.js";

export interface DocxTextExtractor { (buffer: Buffer): Promise<string>; }

export function createDocxAdapter(extract: DocxTextExtractor): DocumentAdapter {
  return { supports: (extension) => extension === ".docx", extract };
}
