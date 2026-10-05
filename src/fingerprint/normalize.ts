const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  "node.js": "nodejs",
  "node js": "nodejs",
  "next.js": "nextjs",
  "next js": "nextjs",
  "machine learning": "machine-learning",
  "data annotation": "data-annotation",
  "llm evaluation": "llm-evaluation",
  "ai evaluation": "ai-evaluation",
  "artificial intelligence": "ai"
};

export function normalizeSignal(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ");

  return ALIASES[normalized] ?? normalized.replace(/\s+/g, "-");
}

export function normalizeSignals(values: string[]): string[] {
  return [...new Set(values.map(normalizeSignal).filter(Boolean))];
}
