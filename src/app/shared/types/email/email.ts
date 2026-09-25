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
