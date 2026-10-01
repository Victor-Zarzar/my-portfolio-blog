"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Controller, useForm } from "react-hook-form";
import {
  AiOutlineGithub,
  AiOutlineInstagram,
  AiOutlineLinkedin,
} from "react-icons/ai";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/app/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/app/shared/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/shared/ui/field";
import { Input } from "@/app/shared/ui/input";
import { Textarea } from "@/app/shared/ui/textarea";
import { contactService } from "@/lib/contact";
import { cn } from "@/lib/utils";

export default function ContactForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("Contact");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const formSchema = z.object({
    name: z.string().trim().min(1, t("namerequired")),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, t("emailrequired"))
      .email(t("invalidemail")),
    subject: z.string().trim().min(1, t("subjectrequired")),
    message: z.string().trim().min(1, t("messagerequired")),
    company: z.string().optional(),
  });

  type ContactFormValues = z.infer<typeof formSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      company: "",
    },
  });

  async function handleSubmit(values: ContactFormValues) {
    try {
      if (!executeRecaptcha) {
        toast.error(t("captcha-not-ready"));
        Sentry.captureMessage(t("captcha-not-ready"), "warning");
        return;
      }
      const captchaToken = await executeRecaptcha("contact_form");
      if (!captchaToken) {
        toast.error(t("captcha-failed"));
        Sentry.captureMessage(t("captcha-failed"), "error");
        return;
      }
      const success = await contactService.sendContactForm(
        values,
        {
          loading: t("loading"),
          success: t("emailsucess"),
          error: t("emailerror"),
        },
        captchaToken,
      );
      if (success) {
        form.reset();
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error(t("emailerror"));
    }
  }

  return (
    <Card
      className="w-full mx-auto transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg
        dark:hover:shadow-stone-600 border-black dark:border-gray-400"
    >
      <CardHeader className="pb-4">
        <CardDescription className="text-sm md:text-base">
          {t("cardSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-xs md:text-sm text-muted-foreground">
            {t("socialText")}
          </span>

          <div className="flex gap-3">
            <Link
              href="https://github.com/Victor-Zarzar"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-md border border-black dark:border-gray-200 hover:bg-accent/10 transition-colors"
            >
              <AiOutlineGithub className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/victorzarzar"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-md border border-black dark:border-gray-200 hover:bg-accent/10 transition-colors"
            >
              <AiOutlineLinkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://www.instagram.com/victorzarzar7/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-md border border-black dark:border-gray-200 hover:bg-accent/10 transition-colors"
            >
              <AiOutlineInstagram className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <form
          noValidate
          className={cn("flex flex-col gap-4", className)}
          onSubmit={form.handleSubmit(handleSubmit)}
          {...props}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    autoComplete="name"
                    placeholder={t("name")}
                    aria-invalid={fieldState.invalid}
                    className="dark:bg-stone-950 dark:border-b dark:border-stone-600"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <input
              type="text"
              {...form.register("company")}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t("email")}
                    aria-invalid={fieldState.invalid}
                    className="dark:bg-stone-950 dark:border-b dark:border-stone-600"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="subject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("subject")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    placeholder={t("subject")}
                    aria-invalid={fieldState.invalid}
                    className="dark:bg-stone-950 dark:border-b dark:border-stone-600"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("message")}</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    autoComplete="off"
                    placeholder={t("message")}
                    aria-invalid={fieldState.invalid}
                    className="min-h-32 dark:bg-stone-950 dark:border-b dark:border-stone-600"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <CardFooter className="px-0 pt-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full font-medium border border-black dark:border-gray-400
                transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg
                dark:hover:shadow-stone-600 hover:text-accent-foreground"
              variant="outline"
            >
              {form.formState.isSubmitting ? t("loading") : t("submit")}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
