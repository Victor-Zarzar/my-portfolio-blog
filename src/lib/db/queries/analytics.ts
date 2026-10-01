import { and, asc, count, eq, sql } from "drizzle-orm";
import type { AnalyticsData } from "@/app/shared/types/analytics/analytics";
import { db } from "@/lib/db";
import { posts, postTags, postTranslations, tags } from "@/lib/db/schema";
import { cacheWithRedis } from "@/lib/redis/cache";
import { cacheKeys } from "@/lib/redis/keys";

export async function getAnalytics(): Promise<AnalyticsData> {
  return cacheWithRedis({
    key: cacheKeys.analytics(),
    ttl: 60 * 60,
    fetcher: async () => {
      const [
        totalPostsResult,
        publishedPostsResult,
        totalTagsResult,
        postsByMonthResult,
        postsByTagResult,
        translationsByLocaleResult,
      ] = await Promise.all([
        db.select({ count: count() }).from(posts),

        db
          .select({ count: count() })
          .from(posts)
          .where(eq(posts.isPublished, true)),

        db.select({ count: count() }).from(tags),

        db
          .select({
            month: sql<string>`to_char(${posts.publishedAt}, 'YYYY-MM')`,
            posts: count(posts.id),
          })
          .from(posts)
          .where(
            and(
              eq(posts.isPublished, true),
              sql`${posts.publishedAt} is not null`,
            ),
          )
          .groupBy(sql`to_char(${posts.publishedAt}, 'YYYY-MM')`)
          .orderBy(asc(sql`to_char(${posts.publishedAt}, 'YYYY-MM')`)),

        db
          .select({
            tag: tags.name,
            posts: count(posts.id),
          })
          .from(tags)
          .leftJoin(postTags, eq(tags.id, postTags.tagId))
          .leftJoin(
            posts,
            and(eq(postTags.postId, posts.id), eq(posts.isPublished, true)),
          )
          .groupBy(tags.id, tags.name)
          .orderBy(sql`count(${posts.id}) desc`),

        db
          .select({
            locale: postTranslations.locale,
            translations: count(postTranslations.id),
          })
          .from(postTranslations)
          .groupBy(postTranslations.locale)
          .orderBy(asc(postTranslations.locale)),
      ]);

      const totalPosts = Number(totalPostsResult[0]?.count ?? 0);
      const publishedPosts = Number(publishedPostsResult[0]?.count ?? 0);
      const totalTags = Number(totalTagsResult[0]?.count ?? 0);

      return {
        summary: {
          totalPosts,
          publishedPosts,
          draftPosts: totalPosts - publishedPosts,
          totalTags,
        },

        postsByMonth: postsByMonthResult.map((item) => ({
          month: item.month,
          posts: Number(item.posts),
        })),

        postsByTag: postsByTagResult
          .filter((item) => Number(item.posts) > 0)
          .slice(0, 10)
          .map((item) => ({
            tag: item.tag,
            posts: Number(item.posts),
          })),

        translationsByLocale: translationsByLocaleResult.map((item) => ({
          locale: item.locale,
          translations: Number(item.translations),
        })),
      };
    },
  });
}
