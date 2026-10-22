import { eq } from "drizzle-orm";
import { FilePenLine } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CoursesForm } from "@/app/features/courses/courses-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schemas";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = Number(id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    notFound();
  }

  const t = await getTranslations("dashboard");

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      translations: true,
    },
  });
  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <FadeWrapper>
        <AdminPageHeader
          icon={FilePenLine}
          title={t("courses.edit")}
          description={t("courses.editDescription")}
        />
      </FadeWrapper>
      <CoursesForm
        courseId={course.id}
        defaultValues={{
          url: course.url,
          sortOrder: course.sortOrder,
          completedAt: course.completedAt
            ? course.completedAt.toISOString().slice(0, 10)
            : undefined,
          isPublished: course.isPublished,
          translations: course.translations.map((t) => ({
            locale: t.locale as "pt" | "en" | "es",
            title: t.title,
          })),
        }}
      />
    </div>
  );
}
