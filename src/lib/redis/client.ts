import { createClient } from "redis";
import env from "@/env";

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient>;
};

export const redis =
  globalForRedis.redis ??
  createClient({ url: env.REDIS_URL ?? "redis://localhost:6379" });

if (!globalForRedis.redis) {
  await redis.connect();
  globalForRedis.redis = redis;
}
