"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";
import type { SetupStep } from "@/app/shared/types/auth/auth";
import type { TwoFactorSetupFormProps } from "@/app/shared/types/form/form";
import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/app/shared/ui/field";
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
import { authClient } from "@/lib/auth/auth-client";

export function TwoFactorSetupForm({
  twoFactorEnabled,
}: TwoFactorSetupFormProps) {
  const t = useTranslations("twoFactorSetup");
  const [step, setStep] = useState<SetupStep>("status");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [_password, setPassword] = useState("");

  const passwordSchema = z.object({
    password: z
      .string()
      .min(6, t("passwordMinLength"))
      .max(100, t("passwordMaxLength")),
  });

  const totpSchema = z.object({
    code: z
      .string()
      .length(6, t("codeLength"))
      .regex(/^\d+$/, t("onlyNumbers")),
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const totpForm = useForm<z.infer<typeof totpSchema>>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  });

  async function startSetup(values: z.infer<typeof passwordSchema>) {
    try {
      setPassword(values.password);
      if (twoFactorEnabled) {
        const { error: disableError } = await authClient.twoFactor.disable({
          password: values.password,
        });
        if (disableError) {
          passwordForm.setError("root", {
            message: disableError.message ?? t("errors.replaceAuthenticator"),
          });
          toast.error(t("errors.replaceAuthenticator"));
          Sentry.captureException(disableError);
          return;
        }
      }
      const { data, error } = await authClient.twoFactor.enable({
        password: values.password,
        method: "totp",
        issuer: "Portfolio Blog",
      });
      if (error) {
        passwordForm.setError("root", {
          message: error.message ?? t("errors.startSetup"),
        });
        toast.error(t("errors.configure"));
        Sentry.captureException(error);
        return;
      }
      if (!data || data.method !== "totp") {
        passwordForm.setError("root", {
          message: t("errors.createTotp"),
        });
        return;
      }
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes);
      setStep("authenticator");
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("errors.unexpectedSetup"));
    }
  }

  async function verifyAuthenticator(values: z.infer<typeof totpSchema>) {
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: values.code,
        trustDevice: false,
      });
      if (error) {
        totpForm.setError("root", {
          message: error.message ?? t("errors.invalidAuthenticatorCode"),
        });
        toast.error(t("errors.invalidAuthenticatorCode"));
        Sentry.captureException(error);
        return;
      }
      setStep("recovery");
      toast.success(t("success.authenticatorConfigured"));
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("errors.unexpectedVerification"));
    }
  }

  async function copyBackupCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success(t("success.recoveryCodesCopied"));
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("errors.copyRecoveryCodes"));
    }
  }

  function finishSetup() {
    setTotpURI(null);
    setBackupCodes([]);
    setPassword("");
    passwordForm.reset();
    totpForm.reset();
    setStep("completed");
  }

  if (step === "status") {
    return (
      <Card className="border-black dark:border-gray-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            {t("status.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                twoFactorEnabled ? "bg-green-500" : "bg-yellow-500"
              }`}
            />

            <span className="font-medium">
              {twoFactorEnabled ? t("status.enabled") : t("status.disabled")}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {twoFactorEnabled
              ? t("status.enabledDescription")
              : t("status.disabledDescription")}
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={() => setStep("password")}>
            {twoFactorEnabled
              ? t("status.replaceAuthenticator")
              : t("status.enable")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "password") {
    return (
      <Card className="w-full max-w-md border-black dark:border-gray-400">
        <CardHeader>
          <CardTitle>{t("password.title")}</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...passwordForm}>
            <form
              id="two-factor-password-form"
              onSubmit={passwordForm.handleSubmit(startSetup)}
              className="space-y-6"
            >
              <FieldGroup>
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel htmlFor="password">
                          {t("password.label")}
                        </FieldLabel>

                        <FormControl>
                          <Input
                            {...field}
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            autoFocus
                          />
                        </FormControl>
                      </Field>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {passwordForm.formState.errors.root && (
                  <p className="text-sm text-red-500">
                    {passwordForm.formState.errors.root.message}
                  </p>
                )}
              </FieldGroup>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("status")}
          >
            {t("actions.cancel")}
          </Button>

          <Button
            type="submit"
            form="two-factor-password-form"
            disabled={passwordForm.formState.isSubmitting}
          >
            {passwordForm.formState.isSubmitting
              ? t("actions.preparing")
              : t("actions.continue")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "authenticator" && totpURI) {
    return (
      <Card className="w-full max-w-md border-black dark:border-gray-400">
        <CardHeader className="text-center">
          <CardTitle>{t("authenticator.title")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              {t("authenticator.scanDescription")}
            </p>

            <div className="flex justify-center">
              <div className="rounded-xl bg-white p-4">
                <QRCode value={totpURI} size={200} level="M" />
              </div>
            </div>
          </div>

          <Form {...totpForm}>
            <form
              id="two-factor-totp-form"
              onSubmit={totpForm.handleSubmit(verifyAuthenticator)}
              className="space-y-6"
            >
              <FormField
                control={totpForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-center">
                      {t("authenticator.codeLabel")}
                    </FormLabel>

                    <FormControl>
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
                    </FormControl>

                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {totpForm.formState.errors.root && (
                <p className="text-sm text-red-500 text-center">
                  {totpForm.formState.errors.root.message}
                </p>
              )}
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            form="two-factor-totp-form"
            className="w-full"
            disabled={totpForm.formState.isSubmitting}
          >
            {totpForm.formState.isSubmitting
              ? t("actions.verifying")
              : t("actions.verifyAuthenticator")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "recovery") {
    return (
      <Card className="w-full max-w-md border-black dark:border-gray-400">
        <CardHeader>
          <CardTitle>{t("recovery.title")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {t("recovery.description")}
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
            {backupCodes.map((code) => (
              <code key={code} className="text-center text-sm">
                {code}
              </code>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={copyBackupCodes}
          >
            <Copy className="mr-2 size-4" />
            {t("recovery.copy")}
          </Button>
        </CardContent>
        <CardFooter>
          <Button type="button" className="w-full" onClick={finishSetup}>
            {t("recovery.saved")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-black dark:border-gray-400">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <Check className="size-10" />

        <div>
          <h2 className="text-xl font-semibold">{t("completed.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("completed.description")}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          {t("actions.done")}
        </Button>
      </CardFooter>
    </Card>
  );
}
