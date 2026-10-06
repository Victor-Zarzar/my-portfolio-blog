export type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  loading?: string;
};

export type SlackContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip?: string;
  userAgent?: string;
  source?: string;
};

export type TwoFactorSetupFormProps = {
  twoFactorEnabled: boolean;
};
