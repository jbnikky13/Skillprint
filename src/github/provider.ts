import type { GitHubProvider, GitHubRepository } from "./types.js";
export function createGitHubProvider(token?: string): GitHubProvider {
  return {
    async listRepositories(username: string) {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
        headers: { accept: "application/vnd.github+json", ...(token ? { authorization: `Bearer ${token}` } : {}) }
      });
      if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);
      const data = await response.json() as Array<Record<string, unknown>>;
      return data.map((repo) => ({
        name: String(repo.name), fullName: String(repo.full_name), url: String(repo.html_url),
        description: repo.description ? String(repo.description) : undefined,
        language: repo.language ? String(repo.language) : undefined,
        topics: Array.isArray(repo.topics) ? repo.topics.map(String) : [],
        stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : undefined,
        forks: typeof repo.forks_count === "number" ? repo.forks_count : undefined,
        updatedAt: repo.updated_at ? String(repo.updated_at) : undefined
      }));
    }
  };
}
