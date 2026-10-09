import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { DbPostMetadata } from "@/app/shared/types/post/post";
import { db } from "@/lib/db";
import {
  posts,
  postTags,
  postTranslations,
  tags,
} from "@/lib/db/schemas/schema";
import { cacheWithRedis } from "@/lib/redis/cache";
import { cacheKeys } from "@/lib/redis/keys";

export async function getAllPostsForSitemap() {
  return cacheWithRedis({
    key: cacheKeys.sitemap(),
    ttl: 60 * 60 * 6,
    fetcher: async () => {
      return db
        .select({
          slug: posts.slug,
          locale: postTranslations.locale,
          publishedAt: posts.publishedAt,
          updatedAt: posts.updatedAt,
        })
        .from(posts)
        .innerJoin(postTranslations, eq(postTranslations.postId, posts.id))
        .where(eq(posts.isPublished, true))
        .orderBy(desc(posts.publishedAt));
    },
  });
}

export async function getAllPosts(locale: string): Promise<DbPostMetadata[]> {
  return cacheWithRedis({
    key: cacheKeys.posts(locale),
    ttl: 60 * 60 * 1,
    fetcher: async () => {
      const rows = await db
        .select({
          id: posts.id,
          slug: posts.slug,
          year: posts.year,
          photo: posts.photo,
          publishedAt: posts.publishedAt,
          updatedAt: posts.updatedAt,
          isPublished: posts.isPublished,
          title: postTranslations.title,
          description: postTranslations.description,
          content: postTranslations.content,
        })
        .from(posts)
        .innerJoin(postTranslations, eq(postTranslations.postId, posts.id))
        .where(
          and(eq(posts.isPublished, true), eq(postTranslations.locale, locale)),
        )
        .orderBy(desc(posts.publishedAt), desc(posts.createdAt));

      if (!rows.length) {
        return [];
      }

      const postIds = rows.map((row) => row.id);

      const tagsRows = await db
        .select({
          postId: postTags.postId,
          tagName: tags.name,
        })
        .from(postTags)
        .innerJoin(tags, eq(tags.id, postTags.tagId))
        .where(inArray(postTags.postId, postIds))
        .orderBy(asc(tags.name));

      const tagsByPostId = new Map<number, string[]>();

      for (const row of tagsRows) {
        const current = tagsByPostId.get(row.postId) ?? [];
        current.push(row.tagName);
        tagsByPostId.set(row.postId, current);
      }

      return rows.map((row) => ({
        slug: row.slug,
        title: row.title,
        description: row.description,
        content: row.content,
        year: row.year,
        photo: row.photo,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
        isPublished: row.isPublished,
        tags: tagsByPostId.get(row.id) ?? [],
      }));
    },
  });
}

export async function getPostBySlug(locale: string, slug: string) {
  return cacheWithRedis({
    key: cacheKeys.post(locale, slug),
    ttl: 60 * 60 * 12,
    fetcher: async () => {
      const rows = await db
        .select({
          id: posts.id,
          slug: posts.slug,
          year: posts.year,
          photo: posts.photo,
          publishedAt: posts.publishedAt,
          updatedAt: posts.updatedAt,
          isPublished: posts.isPublished,
          title: postTranslations.title,
          description: postTranslations.description,
          content: postTranslations.content,
        })
        .from(posts)
        .innerJoin(postTranslations, eq(postTranslations.postId, posts.id))
        .where(
          and(
            eq(posts.slug, slug),
            eq(posts.isPublished, true),
            eq(postTranslations.locale, locale),
          ),
        )
        .limit(1);

      const post = rows[0];

      if (!post) {
        return null;
      }

      const tagsRows = await db
        .select({
          tagName: tags.name,
        })
        .from(postTags)
        .innerJoin(tags, eq(tags.id, postTags.tagId))
        .where(eq(postTags.postId, post.id))
        .orderBy(asc(tags.name));

      return {
        metadata: {
          slug: post.slug,
          title: post.title,
          description: post.description,
          year: post.year,
          photo: post.photo ?? "",
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          tags: tagsRows.map((row) => row.tagName),
        },
        content: post.content,
      };
    },
  });
}
