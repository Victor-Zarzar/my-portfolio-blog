import * as Sentry from "@sentry/nextjs";
import { env as clientEnv } from "@/env/client";
import { env as serverEnv } from "@/env/server";

if (serverEnv.NODE_ENV !== "test") {
  Sentry.init({
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
    environment: serverEnv.NODE_ENV,
    debug: false,
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.consoleLoggingIntegration({
        levels: ["info", "warn", "error"],
      }),
    ],
  });
}
