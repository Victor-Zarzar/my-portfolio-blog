"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/app/shared/ui/button";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/shared/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { createPost, updatePost } from "./post-actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const LOCALES = ["pt", "en", "es"] as const;
type Locale = (typeof LOCALES)[number];

const translationSchema = z.object({
  locale: z.enum(LOCALES),
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
});

const formSchema = z.object({
  slug: z
    .string()
    .min(1)
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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

  function getTranslationIndex(locale: Locale) {
    return LOCALES.indexOf(locale);
  }

  function onSubmit(values: FormValues) {
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
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-4xl mx-auto py-8"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">{t("form.slug")}</Label>
          <Input
            id="slug"
            placeholder={t("form.slugPlaceholder")}
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">{t("form.year")}</Label>
          <Input
            id="year"
            type="number"
            placeholder={String(new Date().getFullYear())}
            {...register("year", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="photo">{t("form.photo")}</Label>
          <Input
            id="photo"
            placeholder={t("form.photoPlaceholder")}
            {...register("photo")}
          />
          {errors.photo && (
            <p className="text-sm text-destructive">{errors.photo.message}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="pt">
        <TabsList>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="uppercase">
              {locale}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((locale) => {
          const i = getTranslationIndex(locale);
          return (
            <TabsContent key={locale} value={locale} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>{t("form.title")}</Label>
                <Input
                  placeholder={`Title in ${locale}`}
                  {...register(`translations.${i}.title`)}
                />
                {errors.translations?.[i]?.title && (
                  <p className="text-sm text-destructive">
                    {errors.translations[i].title?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("form.description")}</Label>
                <Input
                  placeholder={`Short description in ${locale}`}
                  {...register(`translations.${i}.description`)}
                />
                {errors.translations?.[i]?.description && (
                  <p className="text-sm text-destructive">
                    {errors.translations[i].description?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("form.content")}</Label>
                <MDEditor
                  value={watch(`translations.${i}.content`)}
                  onChange={(val) =>
                    setValue(`translations.${i}.content`, val ?? "", {
                      shouldValidate: true,
                    })
                  }
                  height={400}
                  data-color-mode="dark"
                />
                {errors.translations?.[i]?.content && (
                  <p className="text-sm text-destructive">
                    {errors.translations[i].content?.message}
                  </p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="space-y-2">
        <Label>{t("form.tags")}</Label>
        <div className="flex flex-wrap gap-2 mt-3">
          {availableTags?.map((tag) => {
            const selected = watch("tagIds") ?? [];
            const isChecked = selected.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const current = watch("tagIds") ?? [];
                  setValue(
                    "tagIds",
                    isChecked
                      ? current.filter((id) => id !== tag.id)
                      : [...current, tag.id],
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
      </div>

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
