import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { TestGuardSession } from "@/app/shared/types/test/test-type";

const testSession: TestGuardSession = {
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

const getCurrentSessionSpy = mock(
  async (): Promise<TestGuardSession | null> => testSession,
);

const redirectSpy = mock((_path: string): never => {
  throw new Error("NEXT_REDIRECT");
});

mock.module("@/lib/auth/get-session", () => ({
  getCurrentSession: getCurrentSessionSpy,
}));

mock.module("next/navigation", () => ({
  redirect: redirectSpy,
}));

const { requireAdmin, requireSession } = await import("@/lib/auth/guard");

describe("auth guard", () => {
  beforeEach(() => {
    getCurrentSessionSpy.mockClear();
    redirectSpy.mockClear();
  });

  describe("requireSession", () => {
    it("should return the current session when authenticated", async () => {
      const result = await requireSession();

      expect(result).toEqual(testSession);
      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it("should redirect to sign in when unauthenticated", async () => {
      getCurrentSessionSpy.mockResolvedValueOnce(null);

      await expect(requireSession()).rejects.toThrow("NEXT_REDIRECT");

      expect(redirectSpy).toHaveBeenCalledWith("/auth/signin");
    });
  });

  describe("requireAdmin", () => {
    it("should return the session when user is an admin", async () => {
      const result = await requireAdmin();

      expect(result).toEqual(testSession);
      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it("should redirect when user is not an admin", async () => {
      getCurrentSessionSpy.mockResolvedValueOnce({
        ...testSession,
        user: {
          ...testSession.user,
          isAdmin: false,
        },
      });

      await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");

      expect(redirectSpy).toHaveBeenCalledWith("/auth/signin");
    });
  });
});
