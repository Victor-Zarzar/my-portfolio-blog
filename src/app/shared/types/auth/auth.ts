type AuthTestUser = {
  email: string;
  name: string;
};

type AuthEmailPayload = {
  user: AuthTestUser;
  url: string;
};

type RateLimitRule = {
  window: number;
  max: number;
};

export type AuthConfigUnderTest = {
  appName: string;
  baseURL: string;
  trustedOrigins: string[];

  telemetry: {
    enabled: boolean;
  };

  emailVerification: {
    sendOnSignUp: boolean;
    sendOnSignIn: boolean;
    expiresIn: number;
    sendVerificationEmail: (data: AuthEmailPayload) => Promise<void>;
  };

  emailAndPassword: {
    enabled: boolean;
    disableSignUp: boolean;
    requireEmailVerification: boolean;
    resetPasswordTokenExpiresIn: number;
    revokeSessionsOnPasswordReset: boolean;

    sendResetPassword: (data: AuthEmailPayload) => Promise<void>;

    password: {
      hash: (password: string) => Promise<string>;
      verify: (data: { hash: string; password: string }) => Promise<boolean>;
    };
  };

  secondaryStorage: {
    get: (key: string) => Promise<string | null>;

    set: (key: string, value: string, ttl?: number) => Promise<void>;

    delete: (key: string) => Promise<void>;

    getAndDelete: (key: string) => Promise<string | null>;

    increment: (key: string, ttl: number) => Promise<number>;
  };

  rateLimit: {
    enabled: boolean;
    window: number;
    max: number;
    storage: string;
    customRules: Record<string, RateLimitRule>;
  };

  session: {
    expiresIn: number;
    updateAge: number;
  };

  plugins: unknown[];
};

export type SetupStep =
  | "status"
  | "password"
  | "authenticator"
  | "recovery"
  | "completed";

export type VerificationMode = "totp" | "recovery";
