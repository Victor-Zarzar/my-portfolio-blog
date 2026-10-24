"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { todayISO } from "@/app/shared/helpers/format-date";
import { Button } from "@/app/shared/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/app/shared/ui/field";
import { Input } from "@/app/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { createCourse, updateCourse } from "./courses-actions";

const LOCALES = ["pt", "en", "es"] as const;

const translationSchema = z.object({
  locale: z.enum(LOCALES),
  title: z.string().trim().min(1, "Required"),
});

const formSchema = z.object({
  url: z.url("Invalid URL"),
  sortOrder: z.number().int().min(0),
  completedAt: z.string().refine((value) => !value || value <= todayISO(), {
    message: "Date cannot be in the future",
  }),
  isPublished: z.boolean(),
  translations: z.array(translationSchema).length(3),
});

type FormValues = z.infer<typeof formSchema>;

export type CourseFormProps = {
  courseId?: number;
  defaultValues?: Partial<FormValues>;
};

const defaultFormValues: FormValues = {
  url: "",
  sortOrder: 0,
  completedAt: "",
  isPublished: false,
  translations: LOCALES.map((locale) => ({
    locale,
    title: "",
  })),
};

export function CoursesForm({ courseId, defaultValues }: CourseFormProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.courses-form");
  const [isPending, startTransition] = useTransition();
  const isEditing = courseId !== undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultFormValues,
      ...defaultValues,
      translations:
        defaultValues?.translations ?? defaultFormValues.translations,
    },
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          completedAt: values.completedAt
            ? new Date(`${values.completedAt}T00:00:00.000Z`)
            : null,
        };
        const result = isEditing
          ? await updateCourse(courseId, payload)
          : await createCourse(payload);
        if (!result.success) {
          toast.error(t("toast.error"));
          Sentry.captureException(new Error(result.error));
          return;
        }
        toast.success(isEditing ? t("toast.updated") : t("toast.created"));
        router.push("/admin/courses");
        router.refresh();
      } catch (error) {
        Sentry.captureException(error);
        toast.error(t("toast.error"));
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mx-auto max-w-4xl space-y-8 py-8"
    >
      <FieldGroup>
        <Controller
          name="url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("form.url")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                placeholder="https://..."
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            name="sortOrder"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("form.sortOrder")}
                </FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  min={0}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(event) => {
                    const { value } = event.target;
                    field.onChange(value === "" ? Number.NaN : Number(value));
                  }}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="completedAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("form.completedAt")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="isPublished"
          control={form.control}
          render={({ field }) => (
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                name={field.name}
                className="size-4 accent-primary"
              />
              {t("form.isPublished")}
            </label>
          )}
        />
      </FieldGroup>

      <Tabs defaultValue="pt">
        <TabsList>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="uppercase">
              {locale}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((locale, index) => (
          <TabsContent key={locale} value={locale} className="pt-4">
            <Controller
              name={`translations.${index}.title`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("form.title")} ({locale.toUpperCase()})
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder={`${t("form.title")} (${locale})`}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </TabsContent>
        ))}
      </Tabs>

      {form.formState.errors.root && (
        <FieldError errors={[form.formState.errors.root]} />
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => router.back()}
        >
          {t("form.cancel")}
        </Button>

        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? t("form.save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
