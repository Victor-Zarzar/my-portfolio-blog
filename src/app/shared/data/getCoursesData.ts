import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, courseTranslations } from "@/lib/db/schemas/courses";

export async function getCourses(locale: string) {
  return db
    .select({
      id: courses.id,
      title: courseTranslations.title,
      url: courses.url,
      completedAt: courses.completedAt,
    })
    .from(courses)
    .innerJoin(courseTranslations, eq(courseTranslations.courseId, courses.id))
    .where(
      and(eq(courses.isPublished, true), eq(courseTranslations.locale, locale)),
    )
    .orderBy(
      asc(courses.sortOrder),
      desc(courses.completedAt),
      asc(courses.id),
    );
}
