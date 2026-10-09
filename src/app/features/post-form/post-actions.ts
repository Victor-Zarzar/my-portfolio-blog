"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { posts, postTags, postTranslations } from "@/lib/db/schemas/schema";
import { invalidatePostCache } from "@/lib/redis/cache";

const translationSchema = z.object({
  locale: z.enum(["pt", "en", "es"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
});

const createPostSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only"),
  year: z.coerce.number().int().optional(),
  photo: z.union([z.string().url(), z.literal("")]).optional(),
  authorId: z.string().min(1),
  translations: z.array(translationSchema).length(3),
  tagIds: z.array(z.number()).optional(),
});

const updatePostSchema = createPostSchema.partial().omit({ authorId: true });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidatePosts() {
  revalidatePath("/[locale]/(admin)/posts", "page");
  revalidatePath("/[locale]/(pages)/blog", "page");
}

export async function createPost(
  input: CreatePostInput,
): Promise<ActionResult<{ id: number }>> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation error",
    };
  }

  const { slug, year, photo, authorId, translations, tagIds } = parsed.data;

  try {
    const [post] = await db
      .insert(posts)
      .values({
        slug,
        year,
        photo: photo || null,
        authorId,
        isPublished: false,
      })
      .returning();

    if (!post) {
      return { success: false, error: "Failed to create post" };
    }

    await db.insert(postTranslations).values(
      translations.map((t) => ({
        postId: post.id,
        locale: t.locale,
        title: t.title,
        description: t.description,
        content: t.content,
      })),
    );

    if (tagIds?.length) {
      await db
        .insert(postTags)
        .values(tagIds.map((tagId) => ({ postId: post.id, tagId })));
    }

    await invalidatePostCache({ slug, locales: ["pt", "en", "es"] });
    revalidatePosts();
    return { success: true, data: { id: post.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create post";

    if (message.includes("posts_slug_unique")) {
      return { success: false, error: "Slug already exists" };
    }
    return { success: false, error: message };
  }
}

export async function updatePost(
  id: number,
  input: UpdatePostInput,
): Promise<ActionResult> {
  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation error",
    };
  }

  const { slug, year, photo, translations, tagIds } = parsed.data;

  try {
    if (slug || year !== undefined || photo !== undefined) {
      await db
        .update(posts)
        .set({
          ...(slug && { slug }),
          ...(year !== undefined && { year }),
          ...(photo !== undefined && { photo: photo || null }),
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id));
    }

    if (translations?.length) {
      for (const t of translations) {
        await db
          .insert(postTranslations)
          .values({ postId: id, ...t })
          .onConflictDoUpdate({
            target: [postTranslations.postId, postTranslations.locale],
            set: {
              title: t.title,
              description: t.description,
              content: t.content,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (tagIds !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id));
      if (tagIds.length) {
        await db
          .insert(postTags)
          .values(tagIds.map((tagId) => ({ postId: id, tagId })));
      }
    }

    const existing = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: { slug: true },
    });

    const oldSlug = existing?.slug;
    const newSlug = slug ?? oldSlug;

    await invalidatePostCache({
      slug: newSlug,
      locales: ["pt", "en", "es"],
    });

    revalidatePosts();
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update post";
    if (message.includes("posts_slug_unique")) {
      return { success: false, error: "Slug already exists" };
    }
    return { success: false, error: message };
  }
}

export async function deletePost(id: number): Promise<ActionResult> {
  try {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: { slug: true },
    });

    if (!existing) {
      return { success: false, error: "Post not found" };
    }

    await db.delete(posts).where(eq(posts.id, id));

    await invalidatePostCache({
      slug: existing.slug,
      locales: ["pt", "en", "es"],
    });

    revalidatePosts();
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete post" };
  }
}

export async function togglePublish(
  id: number,
  published: boolean,
): Promise<ActionResult> {
  try {
    await db
      .update(posts)
      .set({
        isPublished: published,
        publishedAt: published ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    const existing = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      columns: { slug: true },
    });

    await invalidatePostCache({
      slug: existing?.slug,
      locales: ["pt", "en", "es"],
    });

    revalidatePosts();
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update publish status" };
  }
}
