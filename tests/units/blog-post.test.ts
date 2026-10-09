import { beforeEach, describe, expect, it, mock } from "bun:test";

const cacheWithRedisSpy = mock(
  async <T>({
    fetcher,
  }: {
    key: string;
    ttl: number;
    fetcher: () => Promise<T>;
  }) => fetcher(),
);

const limitSpy = mock(async () => [
  {
    id: 1,
    slug: "clean-architecture",
    year: 2025,
    photo: "/post/cover.png",
    publishedAt: new Date("2025-01-10T00:00:00.000Z"),
    updatedAt: new Date("2025-01-11T00:00:00.000Z"),
    isPublished: true,
    title: "Clean Architecture",
    description: "Post description",
    content: "# markdown content",
  },
]);

const orderByTagsSpy = mock(async () => [
  { tagName: "architecture" },
  { tagName: "flutter" },
]);

const whereTagsSpy = mock(() => ({
  orderBy: orderByTagsSpy,
}));

const innerJoinTagsSpy = mock(() => ({
  where: whereTagsSpy,
}));

const fromTagsSpy = mock(() => ({
  innerJoin: innerJoinTagsSpy,
}));

const wherePostSpy = mock(() => ({
  limit: limitSpy,
}));

const orderByPostSpy = mock(() => ({
  where: wherePostSpy,
}));

const innerJoinPostSpy = mock(() => ({
  where: wherePostSpy,
  orderBy: orderByPostSpy,
}));

const fromPostSpy = mock(() => ({
  innerJoin: innerJoinPostSpy,
}));

const selectPostSpy = mock((shape: Record<string, unknown>) => {
  if ("tagName" in shape) {
    return { from: fromTagsSpy };
  }

  return { from: fromPostSpy };
});

const dbMock = {
  select: selectPostSpy,
};

const cacheKeysMock = {
  posts: (locale: string) => `posts:${locale}`,
  post: (locale: string, slug: string) => `post:${locale}:${slug}`,
  sitemap: () => "posts:sitemap",
  githubStats: () => "github:stats",
  githubProjects: (perPage: number) => `github:projects:${perPage}`,
};

mock.module("@/lib/redis/cache", () => ({
  cacheWithRedis: cacheWithRedisSpy,
}));

mock.module("@/lib/db", () => ({
  db: dbMock,
}));

mock.module("@/lib/redis/keys", () => ({
  cacheKeys: cacheKeysMock,
}));

mock.module("drizzle-orm", () => ({
  and: mock((...args: unknown[]) => ({ type: "and", args })),
  asc: mock((field: unknown) => ({ type: "asc", field })),
  desc: mock((field: unknown) => ({ type: "desc", field })),
  eq: mock((a: unknown, b: unknown) => ({ type: "eq", a, b })),
  inArray: mock((a: unknown, b: unknown) => ({ type: "inArray", a, b })),
}));

mock.module("@/lib/db/schemas/schema", () => ({
  posts: {
    id: "posts.id",
    slug: "posts.slug",
    year: "posts.year",
    photo: "posts.photo",
    publishedAt: "posts.publishedAt",
    updatedAt: "posts.updatedAt",
    isPublished: "posts.isPublished",
  },
  postTags: {
    postId: "postTags.postId",
    tagId: "postTags.tagId",
  },
  postTranslations: {
    postId: "postTranslations.postId",
    locale: "postTranslations.locale",
    title: "postTranslations.title",
    description: "postTranslations.description",
    content: "postTranslations.content",
  },
  tags: {
    id: "tags.id",
    name: "tags.name",
  },
}));

describe("blog queries > getPostBySlug", () => {
  beforeEach(() => {
    cacheWithRedisSpy.mockClear();
    selectPostSpy.mockClear();
    fromPostSpy.mockClear();
    innerJoinPostSpy.mockClear();
    wherePostSpy.mockClear();
    orderByPostSpy.mockClear();
    limitSpy.mockClear();
    fromTagsSpy.mockClear();
    innerJoinTagsSpy.mockClear();
    whereTagsSpy.mockClear();
    orderByTagsSpy.mockClear();
  });

  it("should return cached post payload with metadata and tags", async () => {
    const { getPostBySlug } = await import("@/lib/db/queries/blog");

    const result = await getPostBySlug("en", "clean-architecture");

    expect(cacheWithRedisSpy).toHaveBeenCalledTimes(1);
    expect(cacheWithRedisSpy).toHaveBeenCalledWith({
      key: "post:en:clean-architecture",
      ttl: 60 * 60 * 12,
      fetcher: expect.any(Function),
    });

    expect(selectPostSpy).toHaveBeenCalledTimes(2);
    expect(limitSpy).toHaveBeenCalledWith(1);
    expect(orderByTagsSpy).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      metadata: {
        slug: "clean-architecture",
        title: "Clean Architecture",
        description: "Post description",
        year: 2025,
        photo: "/post/cover.png",
        publishedAt: new Date("2025-01-10T00:00:00.000Z"),
        updatedAt: new Date("2025-01-11T00:00:00.000Z"),
        tags: ["architecture", "flutter"],
      },
      content: "# markdown content",
    });
  });
});
