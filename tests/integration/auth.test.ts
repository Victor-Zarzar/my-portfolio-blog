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
const captchaMock = mock((options?: unknown) => ({
  id: "captcha",
  options,
}));
const customSessionMock = mock((handler: unknown) => ({
  id: "custom-session",
  handler,
}));

const sendVerificationEmailMock = mock(async () => undefined);
const sendResetPasswordEmailMock = mock(async () => undefined);

const redisGetMock = mock(async (key: string) =>
  key === "existing-key" ? "stored-value" : null,
);

const redisSetMock = mock(async () => undefined);
const redisDelMock = mock(async () => undefined);

const redisGetDelMock = mock(async (key: string) =>
  key === "existing-key" ? "stored-value" : null,
);

const redisIncrMock = mock(() => redisMultiMock);
const redisExpireMock = mock(() => redisMultiMock);

const redisExecTypedMock = mock(async () => [1, 1]);

const redisMultiMock = {
  incr: redisIncrMock,
  expire: redisExpireMock,
  execTyped: redisExecTypedMock,
};

const redisMultiFactoryMock = mock(() => redisMultiMock);

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
      AUTH_DISABLE_SIGNUP: true,
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
      getDel: redisGetDelMock,
      multi: redisMultiFactoryMock,
    },
  }));

  mock.module("@/lib/db/schemas/auth", () => ({
    user: {},
    session: {},
    account: {},
    verification: {},
  }));

  mock.module("@/lib/email/send-verification", () => ({
    sendVerificationEmail: sendVerificationEmailMock,
  }));

  mock.module("@/lib/email/send-reset-password", () => ({
    sendResetPasswordEmail: sendResetPasswordEmailMock,
  }));
});

describe("auth integration", () => {
  it("configures better-auth with database, session, rate limit and plugins", async () => {
    const { auth } = await import("@/lib/auth/auth");

    expect(auth).toBeDefined();

    expect(betterAuthMock).toHaveBeenCalledTimes(1);
    expect(drizzleAdapterMock).toHaveBeenCalledTimes(1);

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(config.appName).toBe("Victor Zarzar");
    expect(config.baseURL).toBe("http://localhost:3000");
    expect(config.telemetry).toEqual({ enabled: false });

    expect(config.trustedOrigins).toEqual(["http://localhost:3000"]);

    expect(drizzleAdapterMock).toHaveBeenCalledWith(
      { name: "test-db" },
      {
        provider: "pg",
        schema: {
          user: {},
          session: {},
          account: {},
          verification: {},
        },
        usePlural: false,
      },
    );

    expect(config.rateLimit).toEqual({
      enabled: true,
      window: 60,
      max: 100,
      storage: "secondary-storage",
      customRules: {
        "/sign-in/email": {
          window: 60,
          max: 5,
        },
        "/request-password-reset": {
          window: 60,
          max: 3,
        },
        "/reset-password": {
          window: 60,
          max: 5,
        },
        "/two-factor/*": {
          window: 60,
          max: 5,
        },
      },
    });

    expect(config.session).toEqual({
      expiresIn: 60 * 60 * 24,
      updateAge: 60 * 60 * 6,
    });

    expect(config.plugins).toHaveLength(5);

    expect(oAuthProxyMock).toHaveBeenCalledTimes(1);
    expect(lastLoginMethodMock).toHaveBeenCalledTimes(1);

    expect(captchaMock).toHaveBeenCalledWith({
      provider: "google-recaptcha",
      secretKey: "recaptcha-secret",
    });

    expect(customSessionMock).toHaveBeenCalledTimes(1);
  });

  it("configures two-factor authentication with Portfolio Blog issuer", async () => {
    await import("@/lib/auth/auth");

    expect(twoFactorMock).toHaveBeenCalledTimes(1);

    expect(twoFactorMock).toHaveBeenCalledWith({
      issuer: "Portfolio Blog",
    });
  });

  it("registers two-factor authentication plugin in better-auth", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(config.plugins).toEqual(
      expect.arrayContaining([
        {
          id: "two-factor",
          options: {
            issuer: "Portfolio Blog",
          },
        },
      ]),
    );
  });

  it("configures rate limiting for two-factor authentication routes", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(config.rateLimit.customRules["/two-factor/*"]).toEqual({
      window: 60,
      max: 5,
    });
  });

  it("configures email verification", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(config.emailVerification).toBeDefined();

    expect(config.emailVerification).toMatchObject({
      sendOnSignUp: true,
      sendOnSignIn: true,
      expiresIn: 60 * 15,
    });

    await config.emailVerification.sendVerificationEmail({
      user: {
        email: "user@example.com",
        name: "Victor",
      },
      url: "http://localhost:3000/verify-email?token=test",
    });

    expect(sendVerificationEmailMock).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Victor",
      url: "http://localhost:3000/verify-email?token=test",
    });
  });

  it("configures email/password authentication and password reset", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(config.emailAndPassword).toMatchObject({
      enabled: true,
      disableSignUp: true,
      requireEmailVerification: true,
      resetPasswordTokenExpiresIn: 60 * 15,
      revokeSessionsOnPasswordReset: true,
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

    await config.emailAndPassword.sendResetPassword({
      user: {
        email: "user@example.com",
        name: "Victor",
      },
      url: "http://localhost:3000/reset-password?token=test",
    });

    expect(sendResetPasswordEmailMock).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Victor",
      url: "http://localhost:3000/reset-password?token=test",
    });
  });

  it("uses Redis as secondary storage", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    const stored = await config.secondaryStorage.get("existing-key");

    expect(stored).toBe("stored-value");

    expect(redisGetMock).toHaveBeenCalledWith("existing-key");

    const missing = await config.secondaryStorage.get("missing-key");

    expect(missing).toBeNull();
  });

  it("stores Redis values with TTL", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    await config.secondaryStorage.set("rate-limit-key", "1", 120);

    expect(redisSetMock).toHaveBeenCalledWith("rate-limit-key", "1", {
      EX: 120,
    });
  });

  it("stores Redis values without TTL", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    await config.secondaryStorage.set("session-key", "value");

    expect(redisSetMock).toHaveBeenCalledWith("session-key", "value");
  });

  it("deletes values from Redis", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    await config.secondaryStorage.delete("rate-limit-key");

    expect(redisDelMock).toHaveBeenCalledWith("rate-limit-key");
  });

  it("gets and deletes a Redis value atomically", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    const value = await config.secondaryStorage.getAndDelete("existing-key");

    expect(value).toBe("stored-value");

    expect(redisGetDelMock).toHaveBeenCalledWith("existing-key");
  });

  it("returns null when getAndDelete does not find a value", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    const value = await config.secondaryStorage.getAndDelete("missing-key");

    expect(value).toBeNull();
  });

  it("increments Redis rate-limit counters and applies TTL", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    const value = await config.secondaryStorage.increment("rate-limit-key", 60);

    expect(value).toBe(1);

    expect(redisMultiFactoryMock).toHaveBeenCalledTimes(1);

    expect(redisIncrMock).toHaveBeenCalledWith("rate-limit-key");

    expect(redisExpireMock).toHaveBeenCalledWith("rate-limit-key", 60, "NX");

    expect(redisExecTypedMock).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid Redis increment TTL", async () => {
    await import("@/lib/auth/auth");

    const config = betterAuthMock.mock.calls[0]?.[0] as AuthConfigUnderTest;

    expect(
      config.secondaryStorage.increment("rate-limit-key", 0),
    ).rejects.toThrow("Redis increment TTL must be a positive integer");

    expect(
      config.secondaryStorage.increment("rate-limit-key", -1),
    ).rejects.toThrow("Redis increment TTL must be a positive integer");

    expect(
      config.secondaryStorage.increment("rate-limit-key", 1.5),
    ).rejects.toThrow("Redis increment TTL must be a positive integer");
  });
});
