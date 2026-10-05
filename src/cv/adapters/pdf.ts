import type { DocumentAdapter } from "../documents.js";

export interface PdfTextExtractor { (buffer: Buffer): Promise<string>; }

export function createPdfAdapter(extract: PdfTextExtractor): DocumentAdapter {
  return { supports: (extension) => extension === ".pdf", extract };
}
