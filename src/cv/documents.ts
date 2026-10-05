import { readFile } from "node:fs/promises";
import path from "node:path";
import { ingestCVText } from "./ingest.js";

export interface DocumentAdapter { supports(extension: string): boolean; extract(buffer: Buffer): Promise<string>; }

export async function ingestCVFile(filePath: string, adapters: DocumentAdapter[]) {
  const extension = path.extname(filePath).toLowerCase();
  const adapter = adapters.find((item) => item.supports(extension));
  if (!adapter) throw new Error(`No document adapter registered for ${extension || "unknown"}`);
  const text = await adapter.extract(await readFile(filePath));
  return ingestCVText(text, path.basename(filePath));
}
