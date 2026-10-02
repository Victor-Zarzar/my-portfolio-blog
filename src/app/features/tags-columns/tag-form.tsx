"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/app/shared/ui/button";
import { Card, CardContent } from "@/app/shared/ui/card";
import { Input } from "@/app/shared/ui/input";
import { Label } from "@/app/shared/ui/label";
import { useRouter } from "@/i18n/navigation";
import { createTag } from "./tag-actions";

export function TagForm() {
  const router = useRouter();
  const t = useTranslations("dashboard.tags.form");
  const [isPending, startTransition] = useTransition();

  type FormValues = z.infer<typeof formSchema>;

  const formSchema = z.object({
    name: z.string().min(1, t("namerequired")),
    slug: z
      .string()
      .min(1, t("slugrequired"))
      .regex(/^[a-z0-9-]+$/, t("sluginvalid")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  function onSubmit(values: FormValues) {
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">{t("slug")}</Label>
            <Input
              id="slug"
              type="text"
              placeholder={t("slugPlaceholder")}
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>
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
