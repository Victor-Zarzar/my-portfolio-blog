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

const andSpy = mock((...args: unknown[]) => ({ type: "and", args }));
const eqSpy = mock((a: unknown, b: unknown) => ({ type: "eq", a, b }));

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

const whereSlugsSpy = mock(async () => [
  { locale: "pt", slug: "arquitetura-limpa" },
  { locale: "en", slug: "clean-architecture" },
  { locale: "es", slug: "arquitectura-limpia" },
]);

const fromSlugsSpy = mock(() => ({
  where: whereSlugsSpy,
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

  if ("id" in shape) {
    return { from: fromPostSpy };
  }

  return { from: fromSlugsSpy };
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
  and: andSpy,
  asc: mock((field: unknown) => ({ type: "asc", field })),
  desc: mock((field: unknown) => ({ type: "desc", field })),
  eq: eqSpy,
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
    slug: "postTranslations.slug",
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
    andSpy.mockClear();
    eqSpy.mockClear();
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
    fromSlugsSpy.mockClear();
    whereSlugsSpy.mockClear();
  });

  it("should return cached post payload with metadata, tags and slugs of every locale", async () => {
    const { getPostBySlug } = await import("@/lib/db/queries/blog");

    const result = await getPostBySlug("en", "clean-architecture");

    expect(cacheWithRedisSpy).toHaveBeenCalledTimes(1);
    expect(cacheWithRedisSpy).toHaveBeenCalledWith({
      key: "post:en:clean-architecture",
      ttl: 60 * 60 * 12,
      fetcher: expect.any(Function),
    });

    expect(selectPostSpy).toHaveBeenCalledTimes(3);
    expect(limitSpy).toHaveBeenCalledWith(1);
    expect(orderByTagsSpy).toHaveBeenCalledTimes(1);
    expect(fromSlugsSpy).toHaveBeenCalledTimes(1);
    expect(whereSlugsSpy).toHaveBeenCalledTimes(1);

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
      slugs: {
        pt: "arquitetura-limpa",
        en: "clean-architecture",
        es: "arquitectura-limpia",
      },
    });
  });

  it("should look the post up by the translation slug and locale, not by posts.slug", async () => {
    const { getPostBySlug } = await import("@/lib/db/queries/blog");
    await getPostBySlug("en", "clean-architecture");
    expect(eqSpy).toHaveBeenCalledWith(
      "postTranslations.slug",
      "clean-architecture",
    );
    expect(eqSpy).toHaveBeenCalledWith("postTranslations.locale", "en");
    expect(eqSpy).toHaveBeenCalledWith("posts.isPublished", true);
    expect(eqSpy).not.toHaveBeenCalledWith("posts.slug", "clean-architecture");
  });
});
