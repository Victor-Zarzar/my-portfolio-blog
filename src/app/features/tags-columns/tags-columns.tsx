"use client";

import * as Sentry from "@sentry/nextjs";
import type { ColumnDef, StockFeatures } from "@tanstack/react-table";
import { ArrowUpDown, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import type { AdminTagRow } from "@/app/shared/types/tags/tags";
import { Button } from "@/app/shared/ui/button";
import { deleteTag } from "./tag-actions";
import type { TagsTableFeatures } from "./tags-table-features";

function DeleteTagButton({ slug }: { slug: string }) {
  const t = useTranslations("dashboard.tags");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTag(slug);

      if (!result.success) {
        toast.error(t("toast.deleteError"));
        Sentry.captureException(result.error);
        return;
      }

      toast.success(t("toast.deleted"));
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={t("actions.delete")}
      title={t("actions.delete")}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 text-destructive" />
      )}
    </Button>
  );
}

export function getTagsColumns(
  t: ReturnType<typeof useTranslations>,
): ColumnDef<TagsTableFeatures, AdminTagRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.slug")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "postsCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.postsCount")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.postsCount}</span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      header: () => <div className="text-right">{t("table.actions")}</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DeleteTagButton slug={row.original.slug} />
        </div>
      ),
    },
  ];
}
