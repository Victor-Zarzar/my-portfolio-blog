import * as Sentry from "@sentry/nextjs";
import { redis } from "@/lib/redis/client";

export async function rateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  try {
    const [count] = await redis
      .multi()
      .incr(key)
      .expire(key, windowSeconds, "NX")
      .execTyped();

    return { success: count <= limit };
  } catch (error) {
    // Redis fora do ar não deve derrubar a inscrição; o captcha continua valendo
    Sentry.captureException(error);
    return { success: true };
  }
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
