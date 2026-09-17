import { hash, verify } from "argon2";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  captcha,
  customSession,
  lastLoginMethod,
  oAuthProxy,
  twoFactor,
} from "better-auth/plugins";
import env from "@/env";
import { db } from "@/lib/db";
import * as authSchema from "@/lib/db/auth-schema";
import { redis } from "@/lib/redis/client";

const authOptions = {
  appName: "Victor Zarzar",
  baseURL: env.NEXT_PUBLIC_WEBSITE_URL,
  telemetry: { enabled: false },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    usePlural: false,
  }),
  trustedOrigins: [env.BETTER_AUTH_URL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      hash: async (password) => await hash(password),
      verify: async ({ hash, password }) => await verify(hash, password),
    },
  },
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ?? null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { EX: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
    getAndDelete: async (key) => {
      const value = await redis.getDel(key);
      return value ?? null;
    },
    increment: async (key) => {
      return await redis.incr(key);
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "secondary-storage",
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 6,
  },
  plugins: [
    oAuthProxy(),
    lastLoginMethod(),
    twoFactor({
      issuer: "Victor Zarzar",
    }),
    captcha({
      provider: "google-recaptcha",
      secretKey: env.GOOGLE_RECAPTCHA_SECRET_KEY,
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...authOptions,

  plugins: [
    ...(authOptions.plugins ?? []),
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          isAdmin: user.email === env.ADMIN_EMAIL,
        },
        session,
      };
    }, authOptions),
  ],
});
