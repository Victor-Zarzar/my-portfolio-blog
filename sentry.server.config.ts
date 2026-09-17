import * as Sentry from "@sentry/nextjs";
import env from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.NODE_ENV,
  tracesSampleRate: 1.0,
  enableLogs: true,
  sendDefaultPii: true,
  integrations: [
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
    Sentry.consoleLoggingIntegration({ levels: ["info", "warn", "error"] }),
  ],
});
