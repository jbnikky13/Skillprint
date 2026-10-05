export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies: string[];
  domains: string[];
  roles: string[];
  outcomes?: string[];
  evidence: { source: string; signals: string[] }[];
}
export interface PortfolioProfile {
  sourceUrl?: string;
  projects: PortfolioProject[];
}
