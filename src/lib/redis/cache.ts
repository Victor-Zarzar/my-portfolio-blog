import type { CacheOptions } from "@/app/shared/types/redis/cache";
import { redis } from "./client";
import { cacheKeys } from "./keys";

export async function cacheWithRedis<T>({
  key,
  ttl = 3600,
  fetcher,
}: CacheOptions<T>): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached) as T;
  }

  const fresh = await fetcher();

  await redis.set(key, JSON.stringify(fresh), {
    EX: ttl,
  });

  return fresh;
}

export async function invalidateAnalyticsCache() {
  await redis.del(cacheKeys.analytics());
}

export async function invalidatePostCache(params?: {
  slug?: string;
  locales?: string[];
}) {
  const keys: string[] = [cacheKeys.sitemap()];

  const locales = params?.locales ?? ["pt", "en", "es"];

  for (const locale of locales) {
    keys.push(cacheKeys.posts(locale));

    if (params?.slug) {
      keys.push(cacheKeys.post(locale, params.slug));
    }
  }

  await redis.del(keys);
}
