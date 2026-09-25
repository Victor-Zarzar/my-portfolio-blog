"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";
import type { SetupStep } from "@/app/shared/types/auth/auth";
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

interface TwoFactorSetupFormProps {
  twoFactorEnabled: boolean;
}

export function TwoFactorSetupForm({
  twoFactorEnabled,
}: TwoFactorSetupFormProps) {
  const [step, setStep] = useState<SetupStep>("status");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [_password, setPassword] = useState("");

  const passwordSchema = z.object({
    password: z
      .string()
      .min(6, "Password must contain at least 6 characters.")
      .max(100, "Password is too long."),
  });

  const totpSchema = z.object({
    code: z
      .string()
      .length(6, "The code must contain 6 digits.")
      .regex(/^\d+$/, "The code must contain only numbers."),
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
            message:
              disableError.message ??
              "Unable to replace the current authenticator.",
          });
          toast.error("Unable to replace authenticator.");
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
          message:
            error.message ?? "Unable to start two-factor authentication setup.",
        });
        toast.error("Unable to configure two-factor authentication.");
        Sentry.captureException(error);
        return;
      }
      if (!data || data.method !== "totp") {
        passwordForm.setError("root", {
          message: "Unable to create TOTP authenticator.",
        });
        return;
      }
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes);
      setStep("authenticator");
    } catch (error) {
      Sentry.captureException(error);
      toast.error(
        "An unexpected error occurred while configuring two-factor authentication.",
      );
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
          message: error.message ?? "The authenticator code is invalid.",
        });

        toast.error("Invalid authenticator code.");
        Sentry.captureException(error);
        return;
      }
      setStep("recovery");
      toast.success("Authenticator successfully configured.");
    } catch (error) {
      Sentry.captureException(error);
      toast.error(
        "An unexpected error occurred while verifying the authenticator.",
      );
    }
  }

  async function copyBackupCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Recovery codes copied.");
    } catch (error) {
      Sentry.captureException(error);
      toast.error("Unable to copy recovery codes.");
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
            Two-factor authentication
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
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {twoFactorEnabled
              ? "Your account is protected with an authenticator app."
              : "Protect your administrator account with an authenticator app."}
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={() => setStep("password")}>
            {twoFactorEnabled
              ? "Replace authenticator"
              : "Enable two-factor authentication"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "password") {
    return (
      <Card className="w-full max-w-md border-black dark:border-gray-400">
        <CardHeader>
          <CardTitle>Confirm your password</CardTitle>
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
                        <FieldLabel htmlFor="password">Password</FieldLabel>

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
            Cancel
          </Button>

          <Button
            type="submit"
            form="two-factor-password-form"
            disabled={passwordForm.formState.isSubmitting}
          >
            {passwordForm.formState.isSubmitting ? "Preparing..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "authenticator" && totpURI) {
    return (
      <Card className="w-full max-w-md border-black dark:border-gray-400">
        <CardHeader className="text-center">
          <CardTitle>Set up authenticator</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app.
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
                      Authenticator code
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
              ? "Verifying..."
              : "Verify authenticator"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "recovery") {
    return (
      <Card className="w-full max-w-md border-black dark:border-gray-400">
        <CardHeader>
          <CardTitle>Save your recovery codes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Store these codes somewhere safe. Each recovery code can only be
            used once.
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
            Copy recovery codes
          </Button>
        </CardContent>

        <CardFooter>
          <Button type="button" className="w-full" onClick={finishSetup}>
            I saved my recovery codes
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
          <h2 className="text-xl font-semibold">
            Two-factor authentication configured
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your authenticator is ready to protect your administrator account.
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Done
        </Button>
      </CardFooter>
    </Card>
  );
}
