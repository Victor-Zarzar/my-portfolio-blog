"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schemas/schema";

const schema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only"),
});

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateTags() {
  revalidatePath("/[locale]/(admin)/admin/tags", "page");
  revalidatePath("/[locale]/(admin)/admin/posts", "page");
  revalidatePath("/[locale]/(pages)/blog", "page");
}

export async function createTag(data: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation error",
    };
  }

  try {
    const slug = parsed.data.slug.toLowerCase();

    const existing = await db.query.tags.findFirst({
      where: (tag, { eq }) => eq(tag.slug, slug),
    });

    if (existing) {
      return { success: false, error: "Slug already exists" };
    }

    await db.insert(tags).values({
      name: parsed.data.name,
      slug,
    });
    revalidateTags();
    return { success: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create tag";

    return { success: false, error: message };
  }
}

export async function deleteTag(slug: string): Promise<ActionResult> {
  try {
    await db.delete(tags).where(eq(tags.slug, slug));

    revalidateTags();

    return { success: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete tag";

    return { success: false, error: message };
  }
}
