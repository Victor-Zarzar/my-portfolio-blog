"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/shared/ui/form";
import { Input } from "@/app/shared/ui/input";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";

export default function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const formSchema = z.object({
    email: z.email(t("invalidEmail")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!executeRecaptcha) {
      toast.error(t("captcha-not-ready"));
      Sentry.captureMessage(t("captcha-not-ready"), "warning");
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("forgot_password");

      if (!captchaToken) {
        toast.error(t("captcha-failed"));
        Sentry.captureMessage(t("captcha-failed"), "error");
        return;
      }

      const result = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/auth/reset-password",
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
        },
      });

      if (result.error) {
        if (result.error.status === 429) {
          toast.error(t("error429"));
          return;
        }

        Sentry.captureException(result.error);

        toast.error(t("requestFailed"), {
          description: t("unexpectedError"),
        });

        return;
      }

      toast.success(t("requestSuccess"));

      form.reset();
    } catch (error) {
      Sentry.captureException(error);

      toast.error(t("requestFailed"), {
        description: t("unexpectedError"),
      });
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
          <Mail className="size-6" />
        </div>

        <CardTitle className="text-2xl">{t("title-card")}</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              {t("description")}
            </p>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      autoComplete="email"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("submit")
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={form.formState.isSubmitting}
              onClick={() => router.push("/auth/signin")}
            >
              {t("backToSignIn")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
