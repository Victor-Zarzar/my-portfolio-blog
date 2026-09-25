"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
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
import { Field, FieldGroup, FieldLabel } from "@/app/shared/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/shared/ui/form";
import { Input } from "@/app/shared/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("SignUp");
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const formSchema = z
    .object({
      name: z.string().trim().min(2, t("nameMin")).max(100, t("nameMax")),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, t("emailRequired"))
        .email(t("invalidEmail")),
      password: z.string().min(6, t("passwordMin")).max(100, t("passwordMax")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(values: FormValues) {
    if (!executeRecaptcha) {
      toast.error(t("captcha-not-ready"));
      Sentry.captureMessage(t("captcha-not-ready"), "warning");
      return;
    }
    try {
      const captchaToken = await executeRecaptcha("sign_up");
      if (!captchaToken) {
        toast.error(t("captcha-failed"));
        Sentry.captureMessage(t("captcha-failed"), "error");
        return;
      }
      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
        },
      });
      if (res.error) {
        const status = res.error.status;
        const description =
          status === 403
            ? t("error403")
            : status === 429
              ? t("error429")
              : res.error.message;

        toast.error(t("signupFailed"), {
          description,
        });
        Sentry.captureException(res.error);
        return;
      }
      toast.success(t("verificationEmailSent"));
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(values.email)}`,
      );
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("signupFailed"), {
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
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("title-card")}</CardTitle>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel htmlFor="name">{t("nameLabel")}</FieldLabel>

                      <FormControl>
                        <Input
                          id="name"
                          type="text"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                    </Field>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>

                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                    </Field>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel htmlFor="password">
                        {t("passwordLabel")}
                      </FieldLabel>

                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                    </Field>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        {t("confirmPasswordLabel")}
                      </FieldLabel>

                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                    </Field>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm text-red-500 text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </FieldGroup>

            <CardFooter className="px-0 pt-2 flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("creatingAccount")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {t("signIn")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
