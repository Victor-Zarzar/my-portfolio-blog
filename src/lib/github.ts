import type {
  GithubProject,
  GithubStats,
  RepoResponse,
  StatsResponse,
} from "@/app/shared/types/github/github";
import { env } from "@/env/server";
import { cacheWithRedis } from "./redis/cache";
import { cacheKeys } from "./redis/keys";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export async function getStats(): Promise<GithubStats | null> {
  return cacheWithRedis({
    key: cacheKeys.githubStats(),
    ttl: 60 * 60 * 6,
    fetcher: async () => {
      try {
        const res = await fetch(GITHUB_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GH_API_TOKEN}`,
          },
          body: JSON.stringify({
            query: `
              query userInfo($login: String!) {
                user(login: $login) {
                  contributionsCollection {
                    totalCommitContributions
                    restrictedContributionsCount
                  }
                  repositoriesContributedTo(contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
                    totalCount
                  }
                  pullRequests {
                    totalCount
                  }
                  openIssues: issues(states: OPEN) {
                    totalCount
                  }
                  closedIssues: issues(states: CLOSED) {
                    totalCount
                  }
                  repositories(ownerAffiliations: OWNER, first: 100) {
                    totalCount
                    nodes {
                      stargazers {
                        totalCount
                      }
                      primaryLanguage {
                        name
                        color
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              login: env.GH_USERNAME,
            },
          }),
        });

        if (!res.ok) {
          return null;
        }

        const json = (await res.json()) as StatsResponse;
        if (json.errors?.length) {
          return null;
        }

        const user = json.data?.user;
        if (!user) {
          return null;
        }

        const repos = user.repositories?.nodes ?? [];
        let stars = 0;
        for (const repo of repos) {
          stars += repo.stargazers?.totalCount ?? 0;
        }

        const totalCommitContributions =
          user.contributionsCollection?.totalCommitContributions ?? 0;
        const restrictedContributionsCount =
          user.contributionsCollection?.restrictedContributionsCount ?? 0;

        const totalCommits =
          totalCommitContributions + restrictedContributionsCount;

        const languageCounts: Record<
          string,
          { count: number; color: string | null }
        > = {};

        for (const repo of repos) {
          const lang = repo.primaryLanguage?.name;
          const color = repo.primaryLanguage?.color ?? null;
          if (!lang) {
            continue;
          }

          if (!languageCounts[lang]) {
            languageCounts[lang] = { count: 0, color };
          }
          languageCounts[lang].count += 1;
          if (!languageCounts[lang].color && color) {
            languageCounts[lang].color = color;
          }
        }

        const topLanguages = Object.entries(languageCounts)
          .map(([name, v]) => ({ name, count: v.count, color: v.color }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const prs = user.pullRequests?.totalCount ?? 0;
        const openIssues = user.openIssues?.totalCount ?? 0;
        const closedIssues = user.closedIssues?.totalCount ?? 0;
        const issues = openIssues + closedIssues;

        const contributions = user.repositoriesContributedTo?.totalCount ?? 0;

        return {
          stars,
          totalCommits,
          prs,
          issues,
          contributions,
          topLanguages,
        };
      } catch {
        return null;
      }
    },
  });
}

export async function getProjects(perPage = 20): Promise<GithubProject[]> {
  return cacheWithRedis({
    key: cacheKeys.githubProjects(perPage),
    ttl: 60 * 60 * 3,
    fetcher: async () => {
      try {
        const res = await fetch(GITHUB_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GH_API_TOKEN}`,
          },
          body: JSON.stringify({
            query: `
              query projectsInfo($login: String!, $perPage: Int!) {
                user(login: $login) {
                  repositories(
                    first: $perPage,
                    orderBy: { field: PUSHED_AT, direction: DESC },
                    privacy: PUBLIC,
                    isFork: false
                  ) {
                    nodes {
                      name
                      url
                      description
                      homepageUrl
                      stargazerCount
                      primaryLanguage { name color }
                      repositoryTopics(first: 5) {
                        nodes {
                          topic {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              login: env.GH_USERNAME,
              perPage,
            },
          }),
        });

        if (!res.ok) {
          return [];
        }

        const json = (await res.json()) as RepoResponse;
        if (json.errors?.length) {
          return [];
        }

        const repos = json.data?.user?.repositories?.nodes ?? [];

        return repos.map((repo) => ({
          name: repo.name,
          url: repo.url,
          description: repo.description,
          homepageUrl: repo.homepageUrl,
          stargazerCount: repo.stargazerCount,
          primaryLanguage: repo.primaryLanguage,
          topics:
            repo.repositoryTopics?.nodes
              ?.map((node) => node.topic?.name)
              .filter((topic): topic is string => Boolean(topic)) ?? [],
        }));
      } catch {
        return [];
      }
    },
  });
}

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GithubContributions = {
  days: ContributionDay[];
  total: number;
};

const CONTRIBUTION_LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

const GITHUB_CONTRIBUTIONS_CACHE_KEY = "github:contributions:v2";
const CONTRIBUTION_YEARS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

type ContributionCalendar = {
  totalContributions: number;
  weeks: {
    contributionDays: {
      date: string;
      contributionCount: number;
      contributionLevel: keyof typeof CONTRIBUTION_LEVELS;
    }[];
  }[];
};

type YearCollection = { contributionCalendar?: ContributionCalendar };

type ContributionsResponse = {
  errors?: unknown[];
  data?: {
    user?: {
      y0?: YearCollection;
      y1?: YearCollection;
      y2?: YearCollection;
    };
  };
};

const CONTRIBUTIONS_QUERY = `
  query contributionsInfo(
    $login: String!
    $from0: DateTime!, $to0: DateTime!
    $from1: DateTime!, $to1: DateTime!
    $from2: DateTime!, $to2: DateTime!
  ) {
    user(login: $login) {
      y0: contributionsCollection(from: $from0, to: $to0) { ...CalendarFields }
      y1: contributionsCollection(from: $from1, to: $to1) { ...CalendarFields }
      y2: contributionsCollection(from: $from2, to: $to2) { ...CalendarFields }
    }
  }

  fragment CalendarFields on ContributionsCollection {
    contributionCalendar {
      totalContributions
      weeks {
        contributionDays {
          date
          contributionCount
          contributionLevel
        }
      }
    }
  }
`;

export async function getContributions(): Promise<GithubContributions | null> {
  return cacheWithRedis({
    key: GITHUB_CONTRIBUTIONS_CACHE_KEY,
    ttl: 60 * 60 * 24,
    fetcher: async () => {
      try {
        const now = Date.now();
        const variables: Record<string, string> = { login: env.GH_USERNAME };

        for (let i = 0; i < CONTRIBUTION_YEARS; i++) {
          const end = now - i * 366 * DAY_MS;
          const start = end - 365 * DAY_MS;
          variables[`from${i}`] = new Date(start).toISOString();
          variables[`to${i}`] = new Date(end).toISOString();
        }

        const res = await fetch(GITHUB_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.GH_API_TOKEN}`,
          },
          body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables }),
        });

        if (!res.ok) {
          return null;
        }

        const json = (await res.json()) as ContributionsResponse;
        if (json.errors?.length) {
          return null;
        }

        const user = json.data?.user;
        const calendars = [user?.y0, user?.y1, user?.y2].map(
          (year) => year?.contributionCalendar,
        );

        const current = calendars[0];
        if (!current) {
          return null;
        }

        const byDate = new Map<string, ContributionDay>();
        for (const calendar of calendars) {
          if (!calendar) {
            continue;
          }
          for (const week of calendar.weeks) {
            for (const day of week.contributionDays) {
              byDate.set(day.date, {
                date: day.date,
                count: day.contributionCount,
                level: CONTRIBUTION_LEVELS[day.contributionLevel],
              });
            }
          }
        }

        const days = [...byDate.values()].sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        return { days, total: current.totalContributions };
      } catch {
        return null;
      }
    },
  });
}
