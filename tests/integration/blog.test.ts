import { beforeEach, describe, expect, it, mock } from "bun:test";

const cacheWithRedisMock = mock(
  async ({ fetcher }: { fetcher: () => Promise<unknown> }) => fetcher(),
);

const firstQueryRows = [
  {
    id: 1,
    slug: "first-post",
    year: 2026,
    photo: "/first.png",
    publishedAt: new Date("2026-01-10T00:00:00.000Z"),
    updatedAt: new Date("2026-01-11T00:00:00.000Z"),
    isPublished: true,
    title: "First Post",
    description: "First Description",
    content: "First Content",
  },
  {
    id: 2,
    slug: "second-post",
    year: 2025,
    photo: "/second.png",
    publishedAt: new Date("2025-12-10T00:00:00.000Z"),
    updatedAt: new Date("2025-12-11T00:00:00.000Z"),
    isPublished: true,
    title: "Second Post",
    description: "Second Description",
    content: "Second Content",
  },
];

const secondQueryRows = [
  { postId: 1, tagName: "nextjs" },
  { postId: 1, tagName: "typescript" },
  { postId: 2, tagName: "portfolio" },
];

const selectMock = mock(() => ({
  from: mock(() => ({
    innerJoin: mock(() => ({
      where: mock(() => ({
        orderBy: mock(async () => firstQueryRows),
      })),
    })),
  })),
}));

const selectTagsMock = mock(() => ({
  from: mock(() => ({
    innerJoin: mock(() => ({
      where: mock(() => ({
        orderBy: mock(async () => secondQueryRows),
      })),
    })),
  })),
}));

beforeEach(() => {
  mock.restore();

  let selectCall = 0;

  mock.module("@/lib/redis/cache", () => ({
    cacheWithRedis: cacheWithRedisMock,
  }));

  mock.module("@/lib/redis/keys", () => ({
    cacheKeys: {
      posts: (locale: string) => `posts:${locale}`,
      post: (locale: string, slug: string) => `post:${locale}:${slug}`,
      sitemap: () => "sitemap",
    },
  }));

  mock.module("@/lib/db", () => ({
    db: {
      select: () => {
        selectCall += 1;
        return selectCall === 1 ? selectMock() : selectTagsMock();
      },
    },
  }));

  mock.module("@/lib/db/schemas/schema", () => ({
    posts: {
      id: "posts.id",
      slug: "posts.slug",
      year: "posts.year",
      photo: "posts.photo",
      publishedAt: "posts.published_at",
      updatedAt: "posts.updated_at",
      isPublished: "posts.is_published",
      createdAt: "posts.created_at",
    },
    postTranslations: {
      postId: "post_translations.post_id",
      locale: "post_translations.locale",
      title: "post_translations.title",
      description: "post_translations.description",
      content: "post_translations.content",
    },
    postTags: {
      postId: "post_tags.post_id",
      tagId: "post_tags.tag_id",
    },
    tags: {
      id: "tags.id",
      name: "tags.name",
    },
  }));
});

describe("blog integration", () => {
  it("returns published posts by locale with grouped tags", async () => {
    const { getAllPosts } = await import("@/lib/db/queries/blog");

    const result = await getAllPosts("en");

    expect(cacheWithRedisMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        slug: "first-post",
        title: "First Post",
        description: "First Description",
        content: "First Content",
        year: 2026,
        photo: "/first.png",
        publishedAt: new Date("2026-01-10T00:00:00.000Z"),
        updatedAt: new Date("2026-01-11T00:00:00.000Z"),
        isPublished: true,
        tags: ["nextjs", "typescript"],
      },
      {
        slug: "second-post",
        title: "Second Post",
        description: "Second Description",
        content: "Second Content",
        year: 2025,
        photo: "/second.png",
        publishedAt: new Date("2025-12-10T00:00:00.000Z"),
        updatedAt: new Date("2025-12-11T00:00:00.000Z"),
        isPublished: true,
        tags: ["portfolio"],
      },
    ]);
  });
});
