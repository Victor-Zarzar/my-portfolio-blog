"use client";

import * as Sentry from "@sentry/nextjs";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatDateUTC } from "@/app/shared/helpers/format-date";
import type { CourseTableProps } from "@/app/shared/types/courses/courses";
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
import { deleteCourse, toggleCoursePublish } from "./courses-actions";
import type { CoursesTableFeatures } from "./courses-table-features";

type CourseRow = CourseTableProps["data"][number];

function getCourseTitle(course: CourseRow) {
  return course.translations[0]?.title ?? "—";
}

function SortableHeader({
  column,
  label,
}: {
  column: Column<CoursesTableFeatures, CourseRow>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function CourseRowActions({ course }: { course: CourseRow }) {
  const [isPending, startTransition] = useTransition();

  const t = useTranslations("dashboard.courses-form");

  function handleTogglePublish() {
    startTransition(async () => {
      const result = await toggleCoursePublish(course.id, !course.isPublished);
      if (!result.success) {
        toast.error(t("toast.errorUpdatePublish"));
        Sentry.captureException(result.error);
        return;
      }
      toast.success(
        course.isPublished ? t("toast.unpublished") : t("toast.published"),
      );
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCourse(course.id);
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
        ) : course.isPublished ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>

      <Button variant="ghost" size="icon" asChild disabled={isPending}>
        <Link href={`/admin/courses/${course.id}`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.description", { title: getCourseTitle(course) })}
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

export function getCoursesColumns(
  t: ReturnType<typeof useTranslations>,
): ColumnDef<CoursesTableFeatures, CourseRow>[] {
  return [
    {
      id: "title",
      accessorFn: (course) => getCourseTitle(course),
      header: ({ column }) => (
        <SortableHeader column={column} label={t("table.title")} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{getCourseTitle(row.original)}</span>
      ),
      filterFn: (row, _columnId, filterValue) => {
        const query = String(filterValue).trim().toLocaleLowerCase();

        if (!query) {
          return true;
        }
        return row.original.translations.some((translation) =>
          translation.title.toLocaleLowerCase().includes(query),
        );
      },
    },
    {
      id: "order",
      accessorFn: (course) => course.sortOrder,
      header: ({ column }) => (
        <SortableHeader column={column} label={t("table.order")} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.sortOrder}</span>
      ),
    },
    {
      id: "completedAt",
      accessorFn: (course) =>
        course.completedAt ? new Date(course.completedAt).getTime() : 0,
      header: ({ column }) => (
        <SortableHeader column={column} label={t("table.completedAt")} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateUTC(row.original.completedAt)}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (course) => (course.isPublished ? 1 : 0),
      header: ({ column }) => (
        <SortableHeader column={column} label={t("table.status")} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "outline"}>
          {row.original.isPublished ? t("status.published") : t("status.draft")}
        </Badge>
      ),
    },
    {
      id: "certificate",
      header: () => t("table.certificate"),
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {t("table.openCertificate")}
        </a>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("table.actions")}</div>,
      cell: ({ row }) => <CourseRowActions course={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
