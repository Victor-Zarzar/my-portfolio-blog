import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    SMTP_EMAIL: z.email(),
    SMTP_PASSWORD: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SLACK_WEBHOOK_URL: z.string().optional(),
    GH_API_TOKEN: z.string(),
    GH_USERNAME: z.string(),
    REDIS_URL: z.string(),
    GOOGLE_RECAPTCHA_SECRET_KEY: z.string(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_RELEASE: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    POSTGRES_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    ADMIN_EMAIL: z.string(),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    VERCEL_TOKEN: z.string(),
    VERCEL_PROJECT_ID: z.string(),
    VERCEL_TEAM_ID: z.string().optional(),
    AUTH_DISABLE_SIGNUP: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  emptyStringAsUndefined: true,
});
