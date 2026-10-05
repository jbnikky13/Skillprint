export interface GitHubRepository {
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
  topics: string[];
  stars?: number;
  forks?: number;
  updatedAt?: string;
}
export interface GitHubProfile {
  username: string;
  repositories: GitHubRepository[];
}
export interface GitHubProvider { listRepositories(username: string): Promise<GitHubRepository[]>; }
