export interface CVProfile {
  id: string;
  name: string;
  label: string;
  targetRoles: string[];
  priorityDomains: string[];
  skills: string[];
  tools: string[];
  evidence: { source: string; signals: string[] }[];
  fileName?: string;
}

export interface CVSelection {
  cvId: string;
  score: number;
  reasons: string[];
  filePath?: string;
}
