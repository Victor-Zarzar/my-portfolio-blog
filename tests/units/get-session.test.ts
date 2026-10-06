import { describe, expect, it, mock } from "bun:test";

const requestHeaders = new Headers({
  cookie: "better-auth.session_token=test-session",
});

const headersSpy = mock(async () => requestHeaders);

const testSession = {
  user: {
    id: "user-123",
    name: "Test Admin",
    email: "admin@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    twoFactorEnabled: true,
    isAdmin: true,
  },
  session: {
    id: "session-123",
    userId: "user-123",
    token: "test-session-token",
    expiresAt: new Date("2027-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ipAddress: null,
    userAgent: null,
  },
};

const getSessionSpy = mock(async () => testSession);

mock.module("next/headers", () => ({
  headers: headersSpy,
}));

mock.module("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: getSessionSpy,
    },
  },
}));

mock.module("react", () => ({
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

const { getCurrentSession } = await import("@/lib/auth/get-session");

describe("getCurrentSession", () => {
  it("should retrieve the current session using request headers", async () => {
    const result = await getCurrentSession();

    expect(headersSpy).toHaveBeenCalledTimes(1);

    expect(getSessionSpy).toHaveBeenCalledWith({
      headers: requestHeaders,
    });

    expect(result).toEqual(testSession);
  });
});
