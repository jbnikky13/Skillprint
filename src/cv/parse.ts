export interface ParsedCV {
  fileName: string;
  text: string;
  sections: Record<string, string>;
}

const SECTION_NAMES = ["summary", "profile", "experience", "work experience", "education", "skills", "projects", "certifications", "languages"];

export function parseCVText(text: string, fileName = "cv.txt"): ParsedCV {
  const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  const lines = clean.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections: Record<string, string> = {};
  let current = "document";

  for (const line of lines) {
    const key = line.toLowerCase().replace(/:$/, "");
    if (SECTION_NAMES.includes(key)) {
      current = key;
      sections[current] = "";
    } else {
      sections[current] = (sections[current] ? sections[current] + "\n" : "") + line;
    }
  }

  return { fileName, text: clean, sections };
}
