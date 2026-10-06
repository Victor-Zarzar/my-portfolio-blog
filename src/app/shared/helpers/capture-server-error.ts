import * as Sentry from "@sentry/nextjs";

export function captureServerError(message: string, error: unknown): void {
  console.error(message, error);

  Sentry.captureException(error, {
    extra: {
      context: message,
    },
  });
}
