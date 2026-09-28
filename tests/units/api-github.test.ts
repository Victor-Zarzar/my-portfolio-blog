import type { Mock } from "bun:test";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

mock.module("@/env", () => ({
  default: {
    GH_API_TOKEN: "test_token",
    GH_USERNAME: "fake-user",
    REDIS_URL: "redis://localhost:6379",
  },
}));

mock.module("@/lib/redis/cache", () => ({
  cacheWithRedis: async <T>({
    fetcher,
  }: {
    key: string;
    ttl?: number;
    fetcher: () => Promise<T>;
  }): Promise<T> => fetcher(),
}));

const { getProjects, getStats } = await import("@/lib/github");

type FetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;
type FetchMock = Mock<FetchFn>;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("shared/api/github.ts", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    const fetchMock = mock<FetchFn>(() => {
      throw new Error("fetch not mocked for this test");
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mock.restore();
  });

  describe("getStats", () => {
    it("returns correctly computed stats (stars, commits, issues, contributions, topLanguages)", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;

      fetchMock.mockImplementation(
        async (_url: RequestInfo | URL, init?: RequestInit) => {
          expect(_url).toBe("https://api.github.com/graphql");
          expect(init?.method).toBe("POST");

          const headers = init?.headers as Record<string, string>;
          expect(headers["Content-Type"]).toBe("application/json");
          expect(headers.Authorization).toBe("Bearer test_token");

          const payload = JSON.parse(String(init?.body ?? "{}"));
          expect(payload.variables.login).toBe("fake-user");

          return jsonResponse({
            data: {
              user: {
                contributionsCollection: {
                  totalCommitContributions: 10,
                  restrictedContributionsCount: 2,
                },
                repositoriesContributedTo: { totalCount: 7 },
                pullRequests: { totalCount: 5 },
                openIssues: { totalCount: 3 },
                closedIssues: { totalCount: 4 },
                repositories: {
                  totalCount: 3,
                  nodes: [
                    {
                      stargazers: { totalCount: 4 },
                      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
                    },
                    {
                      stargazers: { totalCount: 1 },
                      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
                    },
                    {
                      stargazers: { totalCount: 10 },
                      primaryLanguage: { name: "Python", color: "#3572A5" },
                    },
                  ],
                },
              },
            },
          });
        },
      );

      const stats = await getStats();

      expect(stats).not.toBeNull();
      expect(stats).toEqual({
        stars: 15,
        totalCommits: 12,
        prs: 5,
        issues: 7,
        contributions: 7,
        topLanguages: [
          { name: "TypeScript", count: 2, color: "#3178c6" },
          { name: "Python", count: 1, color: "#3572A5" },
        ],
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("returns null when HTTP response is not ok", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;
      fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

      const stats = await getStats();
      expect(stats).toBeNull();
    });

    it("returns null when GraphQL errors are present", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ errors: [{ message: "Bad credentials" }] }, 200),
      );

      const stats = await getStats();
      expect(stats).toBeNull();
    });

    it("returns null when user is empty", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { user: null } }));

      const stats = await getStats();
      expect(stats).toBeNull();
    });
  });

  describe("getProjects", () => {
    it("returns a list of repos when ok", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;

      fetchMock.mockImplementationOnce(
        async (_url: RequestInfo | URL, init?: RequestInit) => {
          const payload = JSON.parse(String(init?.body ?? "{}"));
          expect(payload.variables.login).toBe("fake-user");
          expect(payload.variables.perPage).toBe(30);

          return jsonResponse({
            data: {
              user: {
                repositories: {
                  nodes: [
                    {
                      name: "repo-1",
                      url: "https://github.com/fake-user/repo-1",
                      description: "desc",
                      homepageUrl: "https://example.com",
                      stargazerCount: 2,
                      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
                      repositoryTopics: {
                        nodes: [
                          { topic: { name: "nextjs" } },
                          { topic: { name: "typescript" } },
                          { topic: { name: "portfolio" } },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          });
        },
      );

      const repos = await getProjects(30);

      expect(repos).toEqual([
        {
          name: "repo-1",
          url: "https://github.com/fake-user/repo-1",
          description: "desc",
          homepageUrl: "https://example.com",
          stargazerCount: 2,
          primaryLanguage: { name: "TypeScript", color: "#3178c6" },
          topics: ["nextjs", "typescript", "portfolio"],
        },
      ]);
    });

    it("returns [] when HTTP response is not ok", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;
      fetchMock.mockResolvedValueOnce(jsonResponse({}, 401));

      const repos = await getProjects(20);
      expect(repos).toEqual([]);
    });

    it("returns [] when GraphQL errors are present", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ errors: [{ message: "Nope" }] }, 200),
      );

      const repos = await getProjects(20);
      expect(repos).toEqual([]);
    });

    it("returns [] when fetch throws", async () => {
      const fetchMock = globalThis.fetch as unknown as FetchMock;
      fetchMock.mockRejectedValueOnce(new Error("network"));

      const repos = await getProjects(20);
      expect(repos).toEqual([]);
    });
  });
});
