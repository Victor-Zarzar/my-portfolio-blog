"use client";

import * as Sentry from "@sentry/nextjs";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Edit, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
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

function PostRowActions({ post }: { post: PostRow }) {
  const [isPending, startTransition] = useTransition();

  const t = useTranslations("dashboard.posts-form");

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
                title: post.translations[0]?.title ?? post.slug,
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
          <div>
            <p className="font-medium">{post.translations[0]?.title ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{post.slug}</p>
          </div>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const post = row.original;
        const title = post.translations[0]?.title ?? "";
        const slug = post.slug ?? "";

        return `${title} ${slug}`
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
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
