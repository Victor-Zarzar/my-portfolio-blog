"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { KeyRound, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import type { ResetPasswordFormProps } from "@/app/shared/types/email/email";
import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/shared/ui/field";
import { Input } from "@/app/shared/ui/input";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";

export default function ResetPasswordForm({
  token,
  invalidToken = false,
}: ResetPasswordFormProps) {
  const t = useTranslations("ResetPassword");
  const router = useRouter();

  const formSchema = z
    .object({
      password: z.string().min(8, t("passwordMin")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!token || invalidToken) {
      toast.error(t("invalidToken"));
      return;
    }
    try {
      const result = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (result.error) {
        Sentry.captureException(result.error);
        toast.error(t("resetFailed"), {
          description: t("invalidOrExpiredToken"),
        });
        return;
      }
      toast.success(t("resetSuccess"));
      router.push("/auth/signin");
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("resetFailed"), {
        description: t("unexpectedError"),
      });
    }
  }

  if (invalidToken) {
    return (
      <Card
        className="w-full max-w-md mx-auto transition-transform duration-300
          hover:scale-[1.02] hover:shadow-lg
          dark:hover:shadow-stone-600 border-black dark:border-gray-400"
      >
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <KeyRound className="size-6" />
          </div>

          <CardTitle className="text-2xl">{t("invalidTokenTitle")}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            {t("invalidTokenDescription")}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => router.push("/auth/forgot-password")}
          >
            {t("requestNewLink")}
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

  return (
    <Card
      className="w-full max-w-md mx-auto transition-transform duration-300
        hover:scale-[1.02] hover:shadow-lg
        dark:hover:shadow-stone-600 border-black dark:border-gray-400"
    >
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-2xl">{t("title-card")}</CardTitle>
      </CardHeader>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("passwordPlaceholder")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={form.formState.isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("confirmPasswordPlaceholder")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={form.formState.isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {form.formState.errors.root && (
              <FieldError errors={[form.formState.errors.root]} />
            )}
          </FieldGroup>
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
                {t("resetting")}
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
    </Card>
  );
}
