export type AuthConfigUnderTest = {
  appName: string;
  baseURL: string;
  telemetry: {
    enabled: boolean;
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
  plugins: unknown[];
  emailAndPassword: {
    password: {
      hash: (password: string) => Promise<string>;
      verify: (data: { hash: string; password: string }) => Promise<boolean>;
    };
  };
  secondaryStorage: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttl?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
};

export type SetupStep =
  | "status"
  | "password"
  | "authenticator"
  | "recovery"
  | "completed";

export type VerificationMode = "totp" | "recovery";
