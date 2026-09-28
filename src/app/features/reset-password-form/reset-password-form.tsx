"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { KeyRound, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/shared/ui/form";
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      autoComplete="new-password"
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
      </Form>
    </Card>
  );
}
