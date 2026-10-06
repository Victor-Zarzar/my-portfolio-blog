export const cacheKeys = {
  posts: (locale: string) => `posts:${locale}`,
  post: (locale: string, slug: string) => `post:${locale}:${slug}`,
  sitemap: () => `posts:sitemap`,
  analytics: () => "analytics:overview",
  githubStats: () => "github:stats",
  githubProjects: (perPage: number) => `github:projects:${perPage}`,
  vercelTraffic: (days: number) => `vercel:analytics:traffic:${days}d`,
  vercelFirewall: (days: number) => `vercel:analytics:firewall:${days}d`,
};
