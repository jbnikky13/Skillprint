import { parseCVText, type ParsedCV } from "./parse.js";
import { extractCVProfile } from "./extract.js";
import type { CVProfile } from "./types.js";

export function ingestCVText(text: string, fileName = "cv.txt"): { parsed: ParsedCV; profile: CVProfile } {
  const parsed = parseCVText(text, fileName);
  return { parsed, profile: extractCVProfile(parsed) };
}
