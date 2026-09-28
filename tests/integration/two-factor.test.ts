import { beforeEach, describe, expect, it, mock } from "bun:test";
import type {
  DisableTwoFactorParams,
  EnableTwoFactorParams,
  VerifyTotpParams,
} from "@/app/shared/types/test/form";

const enableTwoFactorMock = mock(async (_params: EnableTwoFactorParams) => ({
  data: {
    method: "totp" as const,
    totpURI:
      "otpauth://totp/Portfolio%20Blog:user@example.com?secret=test-secret",
    backupCodes: ["backup-1", "backup-2"],
  },
  error: null,
}));

const disableTwoFactorMock = mock(async (_params: DisableTwoFactorParams) => ({
  data: null,
  error: null,
}));

const verifyTotpMock = mock(async (_params: VerifyTotpParams) => ({
  data: {
    token: "test-token",
  },
  error: null,
}));

beforeEach(() => {
  enableTwoFactorMock.mockClear();
  disableTwoFactorMock.mockClear();
  verifyTotpMock.mockClear();

  mock.module("@/lib/auth/auth-client", () => ({
    authClient: {
      twoFactor: {
        enable: enableTwoFactorMock,
        disable: disableTwoFactorMock,
        verifyTotp: verifyTotpMock,
      },
    },
  }));
});

describe("two-factor setup integration", () => {
  it("enables TOTP authentication using Portfolio Blog issuer", async () => {
    const result = await enableTwoFactorMock({
      password: "super-secret",
      method: "totp",
      issuer: "Portfolio Blog",
    });

    expect(enableTwoFactorMock).toHaveBeenCalledWith({
      password: "super-secret",
      method: "totp",
      issuer: "Portfolio Blog",
    });

    expect(result.error).toBeNull();

    expect(result.data).toEqual({
      method: "totp",
      totpURI:
        "otpauth://totp/Portfolio%20Blog:user@example.com?secret=test-secret",
      backupCodes: ["backup-1", "backup-2"],
    });
  });

  it("verifies the authenticator TOTP code", async () => {
    const result = await verifyTotpMock({
      code: "123456",
      trustDevice: false,
    });

    expect(verifyTotpMock).toHaveBeenCalledWith({
      code: "123456",
      trustDevice: false,
    });

    expect(result.error).toBeNull();
  });

  it("disables two-factor authentication using the current password", async () => {
    const result = await disableTwoFactorMock({
      password: "super-secret",
    });

    expect(disableTwoFactorMock).toHaveBeenCalledWith({
      password: "super-secret",
    });

    expect(result.error).toBeNull();
  });

  it("replaces an existing authenticator by disabling and enabling TOTP again", async () => {
    await disableTwoFactorMock({
      password: "super-secret",
    });

    await enableTwoFactorMock({
      password: "super-secret",
      method: "totp",
      issuer: "Portfolio Blog",
    });

    expect(disableTwoFactorMock).toHaveBeenCalledTimes(1);

    expect(disableTwoFactorMock).toHaveBeenCalledWith({
      password: "super-secret",
    });

    expect(enableTwoFactorMock).toHaveBeenCalledTimes(1);

    expect(enableTwoFactorMock).toHaveBeenCalledWith({
      password: "super-secret",
      method: "totp",
      issuer: "Portfolio Blog",
    });
  });
});
