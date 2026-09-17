import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { AuthConfigUnderTest } from "@/app/shared/types/auth/auth";

const betterAuthMock = mock((config: unknown) => config);
const drizzleAdapterMock = mock(() => "drizzle-adapter");
const oAuthProxyMock = mock(() => ({ id: "oauth-proxy" }));
const lastLoginMethodMock = mock(() => ({ id: "last-login-method" }));
const twoFactorMock = mock((options?: unknown) => ({
  id: "two-factor",
  options,
}));
const captchaMock = mock((options?: unknown) => ({ id: "captcha", options }));
const customSessionMock = mock((handler: unknown) => ({
  id: "custom-session",
  handler,
}));

const redisGetMock = mock(async (key: string) =>
  key === "existing-key" ? "stored-value" : null,
);
const redisSetMock = mock(async () => {
  undefined;
});
const redisDelMock = mock(async () => {
  undefined;
});

beforeEach(() => {
  mock.restore();

  mock.module("better-auth", () => ({
    betterAuth: betterAuthMock,
  }));

  mock.module("better-auth/adapters/drizzle", () => ({
    drizzleAdapter: drizzleAdapterMock,
  }));

  mock.module("better-auth/plugins", () => ({
    captcha: captchaMock,
    customSession: customSessionMock,
    lastLoginMethod: lastLoginMethodMock,
    oAuthProxy: oAuthProxyMock,
    twoFactor: twoFactorMock,
  }));

  mock.module("@/env", () => ({
    default: {
      NEXT_PUBLIC_WEBSITE_URL: "http://localhost:3000",
      BETTER_AUTH_URL: "http://localhost:3000",
      GOOGLE_RECAPTCHA_SECRET_KEY: "recaptcha-secret",
      ADMIN_EMAIL: "admin@example.com",
    },
  }));

  mock.module("@/lib/db", () => ({
    db: { name: "test-db" },
  }));

  mock.module("@/lib/redis/client", () => ({
    redis: {
      get: redisGetMock,
      set: redisSetMock,
      del: redisDelMock,
    },
  }));

  mock.module("@/lib/db/auth-schema", () => ({
    user: {},
    session: {},
    account: {},
    verification: {},
  }));
});

describe("auth integration", () => {
  it("wires better-auth with argon2, redis secondary storage, rate limit and plugins", async () => {
    const { auth } = await import("@/lib/auth/auth");

    expect(auth).toBeDefined();
    expect(betterAuthMock).toHaveBeenCalledTimes(1);
    expect(drizzleAdapterMock).toHaveBeenCalledTimes(1);

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(config.appName).toBe("Victor Zarzar");
    expect(config.baseURL).toBe("http://localhost:3000");
    expect(config.telemetry).toEqual({ enabled: false });

    expect(config.rateLimit).toEqual({
      enabled: true,
      window: 60,
      max: 5,
      storage: "secondary-storage",
    });

    expect(config.session).toEqual({
      expiresIn: 60 * 60 * 24 * 1,
      updateAge: 60 * 60 * 6,
    });

    expect(config.plugins).toHaveLength(5);
    expect(oAuthProxyMock).toHaveBeenCalledTimes(1);
    expect(lastLoginMethodMock).toHaveBeenCalledTimes(1);
    expect(twoFactorMock).toHaveBeenCalledWith({ issuer: "Victor Zarzar" });
    expect(captchaMock).toHaveBeenCalledWith({
      provider: "google-recaptcha",
      secretKey: "recaptcha-secret",
    });

    const password = "super-secret";
    const hashed = await config.emailAndPassword.password.hash(password);

    expect(hashed).toBeString();
    expect(hashed).not.toBe(password);

    const isValid = await config.emailAndPassword.password.verify({
      hash: hashed,
      password,
    });

    expect(isValid).toBe(true);

    const stored = await config.secondaryStorage.get("existing-key");
    expect(stored).toBe("stored-value");
    expect(redisGetMock).toHaveBeenCalledWith("existing-key");

    await config.secondaryStorage.set("rate-limit-key", "1", 120);
    expect(redisSetMock).toHaveBeenCalledWith("rate-limit-key", "1", {
      EX: 120,
    });

    await config.secondaryStorage.delete("rate-limit-key");
    expect(redisDelMock).toHaveBeenCalledWith("rate-limit-key");
  });
});
