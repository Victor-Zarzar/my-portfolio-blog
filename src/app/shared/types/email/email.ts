export type SendVerificationEmailOptions = {
  email: string;
  name: string;
  url: string;
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export type VerifyEmailFormProps = {
  email: string;
};

export type SendResetPasswordEmailOptions = {
  email: string;
  name: string;
  url: string;
};

export type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

export type ResetPasswordFormProps = {
  token: string;
  invalidToken?: boolean;
};
