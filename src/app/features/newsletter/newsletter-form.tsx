"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/app/shared/ui/button";
import { Card, CardContent } from "@/app/shared/ui/card";
import { Field, FieldError, FieldGroup } from "@/app/shared/ui/field";
import { Input } from "@/app/shared/ui/input";
import { newsletterService } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

export default function NewsletterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("Newsletter");
  const locale = useLocale();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const formSchema = z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, t("emailrequired"))
      .email(t("invalidemail")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function handleSubmit({ email }: FormValues) {
    if (!executeRecaptcha) {
      toast.error(t("captcha-not-ready"));
      Sentry.captureMessage(t("captcha-not-ready"), "warning");
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("newsletter_subscribe");
      if (!captchaToken) {
        toast.error(t("captcha-failed"));
        Sentry.captureMessage(t("captcha-failed"), "error");
        return;
      }
      const ok = await newsletterService.subscribe(
        { email, locale },
        { loading: t("loading"), success: t("success"), error: t("error") },
        captchaToken,
      );
      if (ok) {
        form.reset();
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("error"));
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-8 text-center md:p-12">
        <p className="mx-auto mb-8 max-w-md text-neutral-600 dark:text-neutral-400">
          {t("p")}
        </p>

        <form
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
          className={cn("mx-auto w-full max-w-md", className)}
          {...props}
        >
          <FieldGroup>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t("placeholder")}
                      aria-label={t("placeholder")}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="submit"
                variant="secondary"
                disabled={form.formState.isSubmitting}
                className="border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("submit")}
              </Button>
            </div>
          </FieldGroup>

          <p className="mt-3 text-center text-xs text-neutral-600 dark:text-neutral-400">
            {t("consent")}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
