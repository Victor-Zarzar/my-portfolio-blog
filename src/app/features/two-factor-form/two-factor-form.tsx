"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import type { VerificationMode } from "@/app/shared/types/auth/auth";
import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import { Field, FieldGroup } from "@/app/shared/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/shared/ui/form";
import { Input } from "@/app/shared/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/app/shared/ui/input-otp";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export function TwoFactorForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("twoFactor");
  const router = useRouter();

  const [mode, setMode] = useState<VerificationMode>("totp");

  const totpSchema = z.object({
    code: z
      .string()
      .length(6, t("codeLength"))
      .regex(/^\d+$/, t("onlyNumbers")),
  });

  const recoverySchema = z.object({
    code: z.string().trim().min(1, t("recoveryCodeRequired")),
  });

  const schema = mode === "totp" ? totpSchema : recoverySchema;

  const form = useForm<{ code: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
    },
  });

  async function handleSubmit(values: { code: string }) {
    form.clearErrors();

    if (mode === "totp") {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: values.code,
        trustDevice: true,
      });

      if (error) {
        form.setError("root", {
          message: t("invalidCode"),
        });

        toast.error(t("invalidCode"));
        Sentry.captureException(error);
        return;
      }
    } else {
      const { error } = await authClient.twoFactor.verifyBackupCode({
        code: values.code.trim(),
        trustDevice: true,
      });

      if (error) {
        form.setError("root", {
          message: t("invalidRecoveryCode"),
        });

        toast.error(t("invalidRecoveryCode"));
        Sentry.captureException(error);
        return;
      }
    }

    toast.success(t("successVerified"));
    router.push("/admin");
  }

  function changeMode(nextMode: VerificationMode) {
    setMode(nextMode);

    form.reset({
      code: "",
    });

    form.clearErrors();
  }

  return (
    <Card
      className="w-full max-w-md mx-auto transition-transform duration-300
      hover:scale-[1.02] hover:shadow-lg
      dark:hover:shadow-stone-600 border-black dark:border-gray-400"
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {mode === "totp" ? t("title") : t("recoveryTitle")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            className={cn("flex flex-col gap-6", className)}
            onSubmit={form.handleSubmit(handleSubmit)}
            {...props}
          >
            <FieldGroup>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel className="text-center w-full">
                        {mode === "totp"
                          ? t("codeLabel")
                          : t("recoveryCodeLabel")}
                      </FormLabel>

                      <FormControl>
                        {mode === "totp" ? (
                          <InputOTP
                            maxLength={6}
                            containerClassName="justify-center"
                            {...field}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>

                            <InputOTPSeparator />

                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        ) : (
                          <Input
                            {...field}
                            type="text"
                            autoComplete="one-time-code"
                            autoFocus
                            spellCheck={false}
                            className="font-mono text-center"
                          />
                        )}
                      </FormControl>
                    </Field>

                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm text-red-500 text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </FieldGroup>

            <CardFooter className="px-0 pt-2 flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t("verifying")
                  : mode === "totp"
                    ? t("verify")
                    : t("verifyRecovery")}
              </Button>

              <Button
                type="button"
                variant="link"
                className="text-muted-foreground"
                onClick={() =>
                  changeMode(mode === "totp" ? "recovery" : "totp")
                }
              >
                {mode === "totp" ? t("useRecoveryCode") : t("useAuthenticator")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
