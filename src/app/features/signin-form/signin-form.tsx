"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Controller, useForm } from "react-hook-form";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/shared/ui/field";
import { Input } from "@/app/shared/ui/input";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("SignIn");
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const formSchema = z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, t("emailrequired"))
      .email(t("invalidemail")),
    password: z.string().min(6, t("passwordmin")).max(100, t("passwordmax")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(values: FormValues) {
    try {
      if (!executeRecaptcha) {
        toast.error(t("captcha-not-ready"));
        Sentry.captureMessage(t("captcha-not-ready"), "warning");
        return;
      }
      const captchaToken = await executeRecaptcha("sign_in");
      if (!captchaToken) {
        toast.error(t("captcha-failed"));
        Sentry.captureMessage(t("captcha-failed"), "error");
        return;
      }
      const res = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
          async onSuccess(context) {
            if (context.data.twoFactorRedirect) {
              router.push("/auth/two-factor");
              return;
            }
            router.push("/admin");
          },
        },
      });
      if (res.error) {
        const status = res.error.status;
        const description =
          status === 401
            ? t("error401")
            : status === 403
              ? t("error403")
              : res.error.message;
        toast.error(t("signinFailed"), { description });
        Sentry.captureException(res.error);
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("signinFailed"));
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
        <form
          noValidate
          className={cn("flex flex-col gap-6", className)}
          onSubmit={form.handleSubmit(handleSubmit)}
          {...props}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("emailLabel")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between gap-4">
                    <FieldLabel htmlFor={field.name}>
                      {t("passwordLabel")}
                    </FieldLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs font-normal"
                      onClick={() => router.push("/auth/forgot-password")}
                    >
                      {t("forgotPassword")}
                    </Button>
                  </div>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
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
          <CardFooter className="px-0 pt-2 flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("loading")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={form.formState.isSubmitting}
              onClick={() => router.push("/auth/signup")}
            >
              {t("signup")}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
