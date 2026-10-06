export type EnableTwoFactorParams = {
  password: string;
  method: "totp";
  issuer?: string;
};

export type DisableTwoFactorParams = {
  password: string;
};

export type VerifyTotpParams = {
  code: string;
  trustDevice?: boolean;
};
