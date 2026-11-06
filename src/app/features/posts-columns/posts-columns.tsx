"use client";

import * as Sentry from "@sentry/nextjs";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Edit, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { DEFAULT_LOCALE, LOCALES } from "@/app/shared/config/app-config";
import type { Locale } from "@/app/shared/types/locale/locale";
import type { PostRow } from "@/app/shared/types/post/post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/shared/ui/alert-dialog";
import { Badge } from "@/app/shared/ui/badge";
import { Button } from "@/app/shared/ui/button";
import { Link } from "@/i18n/navigation";
import { deletePost, togglePublish } from "../post-form/post-actions";
import type { PostsTableFeatures } from "./posts-table-features";

function sortedTranslations(post: PostRow) {
  return [...post.translations].sort(
    (a, b) =>
      LOCALES.indexOf(a.locale as Locale) - LOCALES.indexOf(b.locale as Locale),
  );
}

function titleFor(post: PostRow, locale: string) {
  const translation =
    post.translations.find((tr) => tr.locale === locale) ??
    post.translations.find((tr) => tr.locale === DEFAULT_LOCALE) ??
    post.translations[0];

  return translation?.title ?? post.slug;
}

function PostRowActions({ post }: { post: PostRow }) {
  const [isPending, startTransition] = useTransition();

  const t = useTranslations("dashboard.posts-form");
  const locale = useLocale();

  function handleTogglePublish() {
    startTransition(async () => {
      const result = await togglePublish(post.id, !post.isPublished);
      if (!result.success) {
        toast.error(t("toast.errorUpdatePublish"));
        Sentry.captureException(result.error);
        return;
      }
      toast.success(
        post.isPublished ? t("toast.unpublished") : t("toast.published"),
      );
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (!result.success) {
        toast.error(t("toast.errorDelete"));
        Sentry.captureException(result.error);
        return;
      }
      toast.success(t("toast.deleted"));
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleTogglePublish}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : post.isPublished ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>

      <Button variant="ghost" size="icon" asChild>
        <Link href={`/admin/posts/${post.id}`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.description", {
                title: titleFor(post, locale),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function getPostsColumns(
  t: ReturnType<typeof useTranslations>,
  locale: string,
): ColumnDef<PostsTableFeatures, PostRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.title")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const post = row.original;

        return (
          <div className="space-y-1">
            <p className="font-medium">{titleFor(post, locale)}</p>
            <ul className="space-y-0.5">
              {sortedTranslations(post).map((tr) => (
                <li
                  key={tr.locale}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span className="w-5 font-medium uppercase">{tr.locale}</span>
                  <span className="truncate">{tr.slug}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const post = row.original;
        const text = [
          post.slug,
          ...post.translations.map((tr) => `${tr.title} ${tr.slug}`),
        ].join(" ");

        return text.toLowerCase().includes(String(filterValue).toLowerCase());
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.tags")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const post = row.original;

        if (post.postTags.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {post.postTags.map(({ tag }) => (
              <Badge key={tag.name} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.year")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.year ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "created",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.created")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(row.original.createdAt, "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "published",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.status")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "outline"}>
          {row.original.isPublished ? t("status.published") : t("status.draft")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("table.actions")}</div>,
      cell: ({ row }) => <PostRowActions post={row.original} />,
      enableSorting: false,
    },
  ];
}
