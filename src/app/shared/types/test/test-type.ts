export type TestSession = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type TestGuardSession = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    twoFactorEnabled: boolean | null;
    isAdmin: boolean;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  };
};
