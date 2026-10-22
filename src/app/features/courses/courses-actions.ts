"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { courses, courseTranslations } from "@/lib/db/schemas";

const translationSchema = z.object({
  locale: z.enum(["pt", "en", "es"]),
  title: z.string().trim().min(1, "Title is required"),
});

const courseSchema = z.object({
  url: z.url("Enter a valid URL."),
  sortOrder: z.number().int().min(0),
  completedAt: z.date().nullable(),
  isPublished: z.boolean(),
  translations: z.array(translationSchema).length(3),
});

type CourseInput = z.infer<typeof courseSchema>;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await getCurrentSession();
  return session?.user?.isAdmin === true;
}

function revalidateCourses() {
  revalidatePath("/[locale]/(admin)/courses", "page");
  revalidatePath("/[locale]/(pages)/about", "page");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "The provided data is invalid.";
  }
  return "The operation could not be completed.";
}

export async function createCourse(
  input: CourseInput,
): Promise<ActionResult<{ id: number }>> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }
    const parsed = courseSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: getErrorMessage(parsed.error) };
    }
    const { translations, ...courseData } = parsed.data;
    const [createdCourse] = await db
      .insert(courses)
      .values({
        url: courseData.url,
        sortOrder: courseData.sortOrder,
        completedAt: courseData.completedAt,
        isPublished: courseData.isPublished,
      })
      .returning({ id: courses.id });
    if (!createdCourse) {
      throw new Error("It was not possible to create the course.");
    }
    try {
      await db.insert(courseTranslations).values(
        translations.map((translation) => ({
          courseId: createdCourse.id,
          locale: translation.locale,
          title: translation.title,
        })),
      );
    } catch (error) {
      try {
        await db.delete(courses).where(eq(courses.id, createdCourse.id));
      } catch (cleanupError) {
        console.error("[createCourse:cleanup]", cleanupError);
      }
      throw error;
    }
    revalidateCourses();
    return { success: true, data: { id: createdCourse.id } };
  } catch (error) {
    console.error("[createCourse]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCourse(
  courseId: number,
  input: CourseInput,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return { success: false, error: "Invalid course ID." };
    }
    const parsed = courseSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: getErrorMessage(parsed.error) };
    }
    const { translations, ...courseData } = parsed.data;
    const [existing] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!existing) {
      return { success: false, error: "Course not found." };
    }
    await db.batch([
      db
        .update(courses)
        .set({
          url: courseData.url,
          sortOrder: courseData.sortOrder,
          completedAt: courseData.completedAt,
          isPublished: courseData.isPublished,
          updatedAt: new Date(),
        })
        .where(eq(courses.id, courseId)),
      db
        .insert(courseTranslations)
        .values(
          translations.map((translation) => ({
            courseId,
            locale: translation.locale,
            title: translation.title,
          })),
        )
        .onConflictDoUpdate({
          target: [courseTranslations.courseId, courseTranslations.locale],
          set: {
            title: sql`excluded.title`,
            updatedAt: new Date(),
          },
        }),
    ]);
    revalidateCourses();
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[updateCourse]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCourse(courseId: number): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return { success: false, error: "Invalid course ID." };
    }
    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning({ id: courses.id });
    if (!deletedCourse) {
      return { success: false, error: "Course not found." };
    }
    revalidateCourses();
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[deleteCourse]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleCoursePublish(
  courseId: number,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }
    if (
      !Number.isInteger(courseId) ||
      courseId <= 0 ||
      typeof isPublished !== "boolean"
    ) {
      return { success: false, error: "Invalid data." };
    }
    const [updatedCourse] = await db
      .update(courses)
      .set({
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning({ id: courses.id });
    if (!updatedCourse) {
      return { success: false, error: "Course not found." };
    }
    revalidateCourses();
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[toggleCoursePublish]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
