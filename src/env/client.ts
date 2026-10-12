import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z
      .string()
      .default("http://localhost:3000")
      .transform((url) => {
        if (url.startsWith("http://localhost:3000")) {
          return url;
        }
        return url.startsWith("http") ? url : `https://${url}`;
      }),

    NEXT_PUBLIC_DISABLE_DEVTOOLS: z
      .union([z.string(), z.boolean()])
      .transform((value) => {
        if (typeof value === "boolean") {
          return value;
        }
        return value === "true";
      }),

    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY,
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    NEXT_PUBLIC_DISABLE_DEVTOOLS: process.env.NEXT_PUBLIC_DISABLE_DEVTOOLS,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  emptyStringAsUndefined: true,
});
