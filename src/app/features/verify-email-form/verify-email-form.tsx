"use client";

import * as Sentry from "@sentry/nextjs";
import { Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import type { VerifyEmailFormProps } from "@/app/shared/types/email/email";
import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";

export default function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const t = useTranslations("VerifyEmail");
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    if (!email) {
      toast.error(t("missingEmail"));
      return;
    }
    if (!executeRecaptcha) {
      toast.error(t("captcha-not-ready"));
      Sentry.captureMessage(t("captcha-not-ready"), "warning");
      return;
    }
    setIsResending(true);
    try {
      const captchaToken = await executeRecaptcha("resend_verification_email");
      if (!captchaToken) {
        toast.error(t("captcha-failed"));
        Sentry.captureMessage(t("captcha-failed"), "error");
        return;
      }
      const res = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/auth/signin",
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
        },
      });
      if (res.error) {
        const description =
          res.error.status === 429 ? t("error429") : res.error.message;
        toast.error(t("resendFailed"), {
          description,
        });
        Sentry.captureException(res.error);
        return;
      }
      toast.success(t("resendSuccess"));
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("resendFailed"), {
        description: t("unexpectedError"),
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card
      className="w-full max-w-md mx-auto transition-transform duration-300
      hover:scale-[1.02] hover:shadow-lg
      dark:hover:shadow-stone-600 border-black dark:border-gray-400"
    >
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <MailCheck className="size-6" />
        </div>

        <CardTitle className="text-2xl">{t("title-card")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{t("description")}</p>

        {email && <p className="text-sm font-medium break-all">{email}</p>}

        <p className="text-xs text-muted-foreground">{t("checkSpam")}</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="button"
          className="w-full"
          disabled={isResending || !email}
          onClick={handleResend}
        >
          {isResending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("resending")}
            </>
          ) : (
            t("resend")
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/auth/signin")}
        >
          {t("backToSignIn")}
        </Button>
      </CardFooter>
    </Card>
  );
}
