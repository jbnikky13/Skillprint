declare module "pdf-parse" {
  interface PDFData { text: string; }
  type PdfParse = (buffer: Buffer) => Promise<PDFData>;
  const pdfParse: PdfParse;
  export default pdfParse;
}
