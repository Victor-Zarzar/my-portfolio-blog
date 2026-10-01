"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/shared/ui/field";
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
    try {
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
    } catch (error) {
      Sentry.captureException(error);
      form.setError("root", {
        message: mode === "totp" ? t("invalidCode") : t("invalidRecoveryCode"),
      });
    }
  }

  function changeMode(nextMode: VerificationMode) {
    setMode(nextMode);
    form.reset({
      code: "",
    });
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
        <form
          noValidate
          className={cn("flex flex-col gap-6", className)}
          onSubmit={form.handleSubmit(handleSubmit)}
          {...props}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="justify-center text-center"
                  >
                    {mode === "totp" ? t("codeLabel") : t("recoveryCodeLabel")}
                  </FieldLabel>
                  {mode === "totp" ? (
                    <InputOTP
                      {...field}
                      id={field.name}
                      maxLength={6}
                      autoComplete="one-time-code"
                      aria-invalid={fieldState.invalid}
                      containerClassName="justify-center"
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
                      id={field.name}
                      type="text"
                      autoComplete="one-time-code"
                      autoFocus
                      spellCheck={false}
                      aria-invalid={fieldState.invalid}
                      className="font-mono text-center"
                    />
                  )}
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-center"
                    />
                  )}
                </Field>
              )}
            />
            {form.formState.errors.root && (
              <FieldError
                errors={[form.formState.errors.root]}
                className="text-center"
              />
            )}
          </FieldGroup>
          <CardFooter className="px-0 pt-2 flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("verifying")}
                </>
              ) : mode === "totp" ? (
                t("verify")
              ) : (
                t("verifyRecovery")
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-muted-foreground"
              disabled={form.formState.isSubmitting}
              onClick={() => changeMode(mode === "totp" ? "recovery" : "totp")}
            >
              {mode === "totp" ? t("useRecoveryCode") : t("useAuthenticator")}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
