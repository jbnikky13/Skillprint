import type { DocumentAdapter } from "../documents.js";
import { createPdfAdapter } from "./pdf.js";
import { createDocxAdapter } from "./docx.js";

export function createDefaultDocumentAdapters(): DocumentAdapter[] {
  return [createPdfAdapter(async (buffer) => {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }), createDocxAdapter(async (buffer) => {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  })];
}
