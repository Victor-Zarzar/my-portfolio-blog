import { asc, desc } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CourseTable } from "@/app/features/courses/courses-table";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schemas";

export default async function AdminCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations("dashboard");

  const allCourses = await db.query.courses.findMany({
    orderBy: [asc(courses.sortOrder), desc(courses.createdAt)],
    with: {
      translations: {
        where: (translation, { eq }) => eq(translation.locale, locale),
        columns: {
          title: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <AdminPageHeader
            icon={GraduationCap}
            title={t("courses.title")}
            description={t("courses.description")}
          />
        </FadeWrapper>
      </div>
      <CourseTable data={allCourses} />
    </div>
  );
}
