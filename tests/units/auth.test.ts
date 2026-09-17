import { describe, expect, it, mock } from "bun:test";

const betterAuthSpy = mock((config: unknown) => ({
  __type: "better-auth-instance",
  config,
}));

const drizzleAdapterSpy = mock((db: unknown, options: unknown) => ({
  __type: "drizzle-adapter",
  db,
  options,
}));

const captchaSpy = mock((options?: unknown) => ({
  __plugin: "captcha",
  options,
}));

const customSessionSpy = mock((handler: unknown) => ({
  __plugin: "customSession",
  handler,
}));

const lastLoginMethodSpy = mock(() => ({
  __plugin: "lastLoginMethod",
}));

const oAuthProxySpy = mock(() => ({
  __plugin: "oAuthProxy",
}));

const twoFactorSpy = mock((options?: unknown) => ({
  __plugin: "twoFactor",
  options,
}));

const redisGetSpy = mock(async (key: string) => {
  if (key === "existing-key") {
    return "cached-value";
  }
  return null;
});

const redisSetSpy = mock(async () => {
  0;
});
const redisDelSpy = mock(async () => 1);

mock.module("better-auth", () => ({
  betterAuth: betterAuthSpy,
}));

mock.module("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: drizzleAdapterSpy,
}));

mock.module("better-auth/plugins", () => ({
  captcha: captchaSpy,
  customSession: customSessionSpy,
  lastLoginMethod: lastLoginMethodSpy,
  oAuthProxy: oAuthProxySpy,
  twoFactor: twoFactorSpy,
}));

mock.module("@/env", () => ({
  default: {
    NEXT_PUBLIC_WEBSITE_URL: "http://localhost:3000",
    BETTER_AUTH_URL: "http://localhost:3000",
    GOOGLE_RECAPTCHA_SECRET_KEY: "recaptcha-secret",
    ADMIN_EMAIL: "admin@gmail.com",
    REDIS_URL: "redis://localhost:6379",
  },
}));

mock.module("@/lib/db", () => ({
  db: { __db: true },
}));

mock.module("@/lib/db/auth-schema", () => ({
  user: {},
  session: {},
  account: {},
  verification: {},
}));

mock.module("@/lib/redis/client", () => ({
  redis: {
    get: redisGetSpy,
    set: redisSetSpy,
    del: redisDelSpy,
  },
}));

const mod = await import("@/lib/auth/auth");

const authConfig = betterAuthSpy.mock.calls[0]?.[0] as {
  appName: string;
  baseURL: string;
  telemetry: { enabled: boolean };
  trustedOrigins: string[];
  emailAndPassword: {
    enabled: boolean;
    disableSignUp: boolean;
    password: {
      hash: Function;
      verify: Function;
    };
  };
  rateLimit: {
    enabled: boolean;
    window: number;
    max: number;
    storage: string;
  };
  session: {
    expiresIn: number;
    updateAge: number;
  };
  secondaryStorage: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttl?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  plugins: Array<{ __plugin: string }>;
};

describe("auth config", () => {
  it("should build better-auth with expected base config", () => {
    expect(mod.auth).toBeDefined();
    expect(betterAuthSpy).toHaveBeenCalledTimes(1);

    expect(authConfig.appName).toBe("Victor Zarzar");
    expect(authConfig.baseURL).toBe("http://localhost:3000");
    expect(authConfig.telemetry).toEqual({ enabled: false });
    expect(authConfig.trustedOrigins).toEqual(["http://localhost:3000"]);
    expect(authConfig.emailAndPassword).toEqual({
      enabled: true,
      disableSignUp: true,
      password: {
        hash: expect.any(Function),
        verify: expect.any(Function),
      },
    });
    expect(authConfig.rateLimit).toEqual({
      enabled: true,
      window: 60,
      max: 5,
      storage: "secondary-storage",
    });
    expect(authConfig.session).toEqual({
      expiresIn: 60 * 60 * 24,
      updateAge: 60 * 60 * 6,
    });
  });

  it("should configure drizzle adapter correctly", () => {
    expect(drizzleAdapterSpy).toHaveBeenCalledTimes(1);

    const [dbArg, optionsArg] = drizzleAdapterSpy.mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ];

    expect(dbArg).toEqual({ __db: true });
    expect(optionsArg).toEqual({
      provider: "pg",
      schema: expect.any(Object),
      usePlural: false,
    });
  });

  it("should register expected plugins", () => {
    expect(oAuthProxySpy).toHaveBeenCalledTimes(1);
    expect(lastLoginMethodSpy).toHaveBeenCalledTimes(1);
    expect(twoFactorSpy).toHaveBeenCalledWith({
      issuer: "Victor Zarzar",
    });
    expect(captchaSpy).toHaveBeenCalledWith({
      provider: "google-recaptcha",
      secretKey: "recaptcha-secret",
    });
    expect(customSessionSpy).toHaveBeenCalledTimes(1);

    expect(authConfig.plugins).toHaveLength(5);
    expect(authConfig.plugins.map((plugin) => plugin.__plugin)).toEqual([
      "oAuthProxy",
      "lastLoginMethod",
      "twoFactor",
      "captcha",
      "customSession",
    ]);
  });

  it("should expose secondaryStorage.get returning redis value or null", async () => {
    await expect(authConfig.secondaryStorage.get("existing-key")).resolves.toBe(
      "cached-value",
    );
    await expect(
      authConfig.secondaryStorage.get("missing-key"),
    ).resolves.toBeNull();

    expect(redisGetSpy).toHaveBeenCalledWith("existing-key");
    expect(redisGetSpy).toHaveBeenCalledWith("missing-key");
  });

  it("should expose secondaryStorage.set using ttl when provided", async () => {
    await authConfig.secondaryStorage.set("key-1", "value-1", 120);
    expect(redisSetSpy).toHaveBeenCalledWith("key-1", "value-1", { EX: 120 });

    await authConfig.secondaryStorage.set("key-2", "value-2");
    expect(redisSetSpy).toHaveBeenCalledWith("key-2", "value-2");
  });

  it("should expose secondaryStorage.delete delegating to redis.del", async () => {
    await authConfig.secondaryStorage.delete("dead-key");

    expect(redisDelSpy).toHaveBeenCalledTimes(1);
    expect(redisDelSpy).toHaveBeenCalledWith("dead-key");
  });

  it("should mark user as admin in customSession when email matches ADMIN_EMAIL", async () => {
    const handler = customSessionSpy.mock.calls[0]?.[0] as (input: {
      user: { email: string; name: string };
      session: { id: string };
    }) => Promise<unknown>;

    const result = await handler({
      user: {
        email: "admin@gmail.com",
        name: "My Portfolio",
      },
      session: {
        id: "session-1",
      },
    });

    expect(result).toEqual({
      user: {
        email: "admin@gmail.com",
        name: "My Portfolio",
        isAdmin: true,
      },
      session: {
        id: "session-1",
      },
    });
  });

  it("should mark user as non-admin in customSession when email does not match ADMIN_EMAIL", async () => {
    const handler = customSessionSpy.mock.calls[0]?.[0] as (input: {
      user: { email: string; name: string };
      session: { id: string };
    }) => Promise<unknown>;

    const result = await handler({
      user: {
        email: "user@example.com",
        name: "User",
      },
      session: {
        id: "session-2",
      },
    });

    expect(result).toEqual({
      user: {
        email: "user@example.com",
        name: "User",
        isAdmin: false,
      },
      session: {
        id: "session-2",
      },
    });
  });
});
