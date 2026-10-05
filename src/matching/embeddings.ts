export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface HttpEmbeddingProviderOptions {
  endpoint: string;
  apiKey?: string;
  model?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  extract?: (payload: unknown) => number[];
}

export function createHttpEmbeddingProvider(options: HttpEmbeddingProviderOptions): EmbeddingProvider {
  return {
    async embed(text: string) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
      try {
        const response = await fetch(options.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
            ...(options.headers ?? {})
          },
          body: JSON.stringify({ input: text, ...(options.model ? { model: options.model } : {}) }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Embedding provider returned HTTP ${response.status}`);
        const payload = await response.json() as unknown;
        if (options.extract) return options.extract(payload);
        const data = (payload as { data?: Array<{ embedding?: number[] }> }).data;
        const vector = data?.[0]?.embedding;
        if (!vector?.length) throw new Error("Embedding provider response did not contain data[0].embedding.");
        return vector;
      } finally {
        clearTimeout(timer);
      }
    }
  };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i];
  }
  if (!aa || !bb) return 0;
  return Math.max(0, Math.min(1, dot / (Math.sqrt(aa) * Math.sqrt(bb))));
}

export function fingerprintText(fingerprint: { title?: string; skills: { name: string }[]; tools: { name: string }[]; domains: { name: string }[]; roles: { name: string }[]; seniority?: string }): string {
  return [
    fingerprint.title,
    ...fingerprint.skills.map((x) => `skill:${x.name}`),
    ...fingerprint.tools.map((x) => `tool:${x.name}`),
    ...fingerprint.domains.map((x) => `domain:${x.name}`),
    ...fingerprint.roles.map((x) => `role:${x.name}`),
    fingerprint.seniority ? `seniority:${fingerprint.seniority}` : undefined
  ].filter(Boolean).join(" | ");
}

export async function embeddingSimilarity(provider: EmbeddingProvider, candidate: Parameters<typeof fingerprintText>[0], job: Parameters<typeof fingerprintText>[0]): Promise<number> {
  const [a, b] = await Promise.all([
    provider.embed(fingerprintText(candidate)),
    provider.embed(fingerprintText(job))
  ]);
  return Math.round(cosineSimilarity(a, b) * 1000) / 1000;
}
