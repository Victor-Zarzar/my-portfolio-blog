"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { createPost, updatePost } from "./post-actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const LOCALES = ["pt", "en", "es"] as const;

const translationSchema = z.object({
  locale: z.enum(LOCALES),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
});

const formSchema = z.object({
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase, numbers and hyphens only"),
  year: z.number().int().positive().optional(),
  photo: z.union([z.string().url(), z.literal("")]).optional(),
  translations: z.array(translationSchema).length(3),
  tagIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type PostFormProps = {
  authorId: string;
  postId?: number;
  defaultValues?: Partial<FormValues>;
  availableTags?: { id: number; name: string }[];
};

export function PostForm({
  authorId,
  postId,
  defaultValues,
  availableTags,
}: PostFormProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.posts-form");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!postId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      slug: "",
      year: new Date().getFullYear(),
      photo: "",
      translations: LOCALES.map((locale) => ({
        locale,
        title: "",
        description: "",
        content: "",
      })),
      tagIds: [],
    },
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updatePost(postId, values)
        : await createPost({ ...values, authorId });

      if (!result.success) {
        toast.error(t("toast.error"));
        Sentry.captureException(result.error);
        return;
      }

      toast.success(isEditing ? t("toast.updated") : t("toast.created"));
      router.push("/admin/posts");
    });
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-8 max-w-4xl mx-auto py-8"
    >
      <FieldGroup>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("form.slug")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder={t("form.slugPlaceholder")}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="year"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("form.year")}</FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  placeholder={String(new Date().getFullYear())}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? undefined
                        : event.target.valueAsNumber,
                    )
                  }
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="photo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="sm:col-span-2"
              >
                <FieldLabel htmlFor={field.name}>{t("form.photo")}</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id={field.name}
                  placeholder={t("form.photoPlaceholder")}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
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
          <TabsContent key={locale} value={locale} className="space-y-6 pt-4">
            <FieldGroup>
              <Controller
                name={`translations.${index}.title`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t("form.title")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={`Title in ${locale}`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name={`translations.${index}.description`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t("form.description")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={`Short description in ${locale}`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name={`translations.${index}.content`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("form.content")}</FieldLabel>
                    <MDEditor
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      height={400}
                      data-color-mode="dark"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </TabsContent>
        ))}
      </Tabs>
      <Controller
        name="tagIds"
        control={form.control}
        render={({ field, fieldState }) => {
          const selected = field.value ?? [];
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("form.tags")}</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-3">
                {availableTags?.map((tag) => {
                  const isChecked = selected.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        field.onChange(
                          isChecked
                            ? selected.filter((id) => id !== tag.id)
                            : [...selected, tag.id],
                        );
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isChecked
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />
      {form.formState.errors.root && (
        <FieldError errors={[form.formState.errors.root]} />
      )}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
          variant="secondary"
        >
          {t("form.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
          variant="secondary"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t("form.save") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
