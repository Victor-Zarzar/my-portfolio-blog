import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";

export const newsletterService = {
  async subscribe(
    data: { email: string; locale: string },
    messages: { loading: string; success: string; error: string },
    captchaToken: string,
  ): Promise<boolean> {
    const toastId = toast.loading(messages.loading);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-captcha-response": captchaToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        toast.error(messages.error, { id: toastId });
        return false;
      }

      toast.success(messages.success, { id: toastId });
      return true;
    } catch (error) {
      toast.error(messages.error, { id: toastId });
      Sentry.captureException(error);
      return false;
    }
  },
};
