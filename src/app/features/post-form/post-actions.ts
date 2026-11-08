"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { posts, postTags, postTranslations } from "@/lib/db/schemas/schema";
import { invalidatePostCache } from "@/lib/redis/cache";

const LOCALES = ["pt", "en", "es"] as const;
type PostLocale = (typeof LOCALES)[number];

const PRIMARY_LOCALE: PostLocale = "pt";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only");

const translationSchema = z.object({
  locale: z.enum(LOCALES),
  slug: slugSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
});

const createPostSchema = z.object({
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

type SlugEntry = { locale: string; slug: string };

function revalidatePosts() {
  revalidatePath("/[locale]/(admin)/posts", "page");
  revalidatePath("/[locale]/(pages)/blog", "page");
}

function primarySlug(translations: SlugEntry[]): string | undefined {
  return (
    translations.find((t) => t.locale === PRIMARY_LOCALE) ?? translations[0]
  )?.slug;
}

function isSlugConflict(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  const cause = err.cause instanceof Error ? err.cause.message : "";
  return `${err.message} ${cause}`.includes("slug_unique");
}

async function invalidateSlugs(entries: SlugEntry[]) {
  const seen = new Set<string>();
  for (const { locale, slug } of entries) {
    const key = `${locale}:${slug}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    await invalidatePostCache({ slug, locales: [locale as PostLocale] });
  }
}

export async function createPost(
  input: CreatePostInput,
): Promise<ActionResult<{ id: number }>> {
  const { user } = await requireAdmin();
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation error",
    };
  }

  const { year, photo, translations, tagIds } = parsed.data;
  const slug = primarySlug(translations);
  if (!slug) {
    return { success: false, error: "Slug is required" };
  }

  try {
    const [post] = await db
      .insert(posts)
      .values({
        slug,
        year,
        photo: photo || null,
        authorId: user.id,
        isPublished: false,
      })
      .returning();

    if (!post) {
      return { success: false, error: "Failed to create post" };
    }

    try {
      await db.insert(postTranslations).values(
        translations.map((t) => ({
          postId: post.id,
          locale: t.locale,
          slug: t.slug,
          title: t.title,
          description: t.description,
          content: t.content,
        })),
      );
    } catch (err) {
      await db.delete(posts).where(eq(posts.id, post.id));
      throw err;
    }

    if (tagIds?.length) {
      await db
        .insert(postTags)
        .values(tagIds.map((tagId) => ({ postId: post.id, tagId })));
    }

    await invalidateSlugs(translations);
    revalidatePosts();
    return { success: true, data: { id: post.id } };
  } catch (err) {
    if (isSlugConflict(err)) {
      return { success: false, error: "Slug already exists" };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create post",
    };
  }
}

export async function updatePost(
  id: number,
  input: UpdatePostInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation error",
    };
  }

  const { year, photo, translations, tagIds } = parsed.data;

  try {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: { translations: { columns: { locale: true, slug: true } } },
    });

    if (!existing) {
      return { success: false, error: "Post not found" };
    }

    const slug = translations ? primarySlug(translations) : undefined;

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
              slug: t.slug,
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

    await invalidateSlugs([...existing.translations, ...(translations ?? [])]);
    revalidatePosts();
    return { success: true, data: undefined };
  } catch (err) {
    if (isSlugConflict(err)) {
      return { success: false, error: "Slug already exists" };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update post",
    };
  }
}

export async function deletePost(id: number): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: { translations: { columns: { locale: true, slug: true } } },
    });

    if (!existing) {
      return { success: false, error: "Post not found" };
    }

    await db.delete(posts).where(eq(posts.id, id));
    await invalidateSlugs(existing.translations);

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
  await requireAdmin();

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
      with: { translations: { columns: { locale: true, slug: true } } },
    });

    await invalidateSlugs(existing?.translations ?? []);

    revalidatePosts();
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update publish status" };
  }
}
