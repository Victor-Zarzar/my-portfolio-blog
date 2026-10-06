"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/app/shared/ui/button";
import { Card, CardContent } from "@/app/shared/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/shared/ui/field";
import { Input } from "@/app/shared/ui/input";
import { useRouter } from "@/i18n/navigation";
import { createTag } from "./tag-actions";

export function TagForm() {
  const router = useRouter();
  const t = useTranslations("dashboard.tags.form");
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    name: z.string().min(1, t("namerequired")),
    slug: z
      .string()
      .min(1, t("slugrequired"))
      .regex(/^[a-z0-9-]+$/, t("sluginvalid")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createTag(values);
      if (!result.success) {
        toast.error(t("error"));
        Sentry.captureException(result.error);
        return;
      }
      toast.success(t("created"));
      router.push("/admin/tags");
    });
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="pt-6">
        <form
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
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
                    placeholder={t("namePlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("slug")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder={t("slugPlaceholder")}
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
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
              variant="secondary"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("create")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
