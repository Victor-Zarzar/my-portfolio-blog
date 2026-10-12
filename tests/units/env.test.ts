import { afterEach, beforeEach, describe, expect, test } from "bun:test";

const runtimeKeys = ["window", "document", "navigator"] as const;

const originalDescriptors = Object.fromEntries(
  runtimeKeys.map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]),
);

function forceServerRuntime(): void {
  for (const key of runtimeKeys) {
    Reflect.deleteProperty(globalThis, key);
  }
}

function restoreRuntime(): void {
  for (const key of runtimeKeys) {
    const descriptor = originalDescriptors[key];

    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, key);
    }
  }
}

describe("env loading .env", () => {
  beforeEach(() => {
    forceServerRuntime();
  });

  afterEach(() => {
    restoreRuntime();
  });

  test("reads server environment variables", async () => {
    const { env } = await import("@/env/server");

    const requiredKeys = [
      "SMTP_EMAIL",
      "SMTP_PASSWORD",
      "SMTP_HOST",
      "GH_API_TOKEN",
      "GH_USERNAME",
      "REDIS_URL",
      "GOOGLE_RECAPTCHA_SECRET_KEY",
      "POSTGRES_URL",
      "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL",
      "ADMIN_EMAIL",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "VERCEL_TOKEN",
      "VERCEL_PROJECT_ID",
    ] as const;

    for (const key of requiredKeys) {
      const value = process.env[key];

      expect(value).toBeDefined();

      if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
      }

      expect(env[key]).toBe(value);
    }

    expect(["development", "test", "production"]).toContain(env.NODE_ENV);

    expect(env.SMTP_PORT).toBe(Number(process.env.SMTP_PORT));
    expect(typeof env.AUTH_DISABLE_SIGNUP).toBe("boolean");
  });

  test("reads client environment variables", async () => {
    const { env } = await import("@/env/client");

    const recaptchaKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY;

    if (recaptchaKey === undefined) {
      throw new Error("Missing NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY");
    }

    expect(env.NEXT_PUBLIC_WEBSITE_URL).toBeTruthy();
    expect(env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_PUBLIC_KEY).toBe(recaptchaKey);
    expect(typeof env.NEXT_PUBLIC_DISABLE_DEVTOOLS).toBe("boolean");
  });

  test("handles optional environment variables", async () => {
    const { env: serverEnv } = await import("@/env/server");
    const { env: clientEnv } = await import("@/env/client");

    const optionalServerKeys = [
      "SLACK_WEBHOOK_URL",
      "SENTRY_AUTH_TOKEN",
      "SENTRY_RELEASE",
      "SENTRY_ORG",
      "SENTRY_PROJECT",
      "VERCEL_TEAM_ID",
    ] as const;

    for (const key of optionalServerKeys) {
      expect(serverEnv[key]).toBe(process.env[key] || undefined);
    }

    expect(clientEnv.NEXT_PUBLIC_SENTRY_DSN).toBe(
      process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
    );
  });
});
