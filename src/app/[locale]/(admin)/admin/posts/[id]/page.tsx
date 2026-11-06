import { eq } from "drizzle-orm";
import { FilePenLine } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PostForm } from "@/app/features/post-form/post-form";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { posts, tags } from "@/lib/db/schemas/schema";

const LOCALES = ["pt", "en", "es"] as const;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  const t = await getTranslations("dashboard");

  const [session, post, availableTags] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        translations: true,
        postTags: true,
      },
    }),
    db.select({ id: tags.id, name: tags.name }).from(tags),
  ]);

  if (!post) {
    notFound();
  }

  const translations = [...post.translations].sort(
    (a, b) =>
      LOCALES.indexOf(a.locale as (typeof LOCALES)[number]) -
      LOCALES.indexOf(b.locale as (typeof LOCALES)[number]),
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <FadeWrapper>
        <AdminPageHeader
          icon={FilePenLine}
          title={t("editPost")}
          description={t("posts.editDescription")}
        />
      </FadeWrapper>
      <PostForm
        authorId={session!.user.id}
        postId={post.id}
        availableTags={availableTags}
        defaultValues={{
          year: post.year ?? undefined,
          photo: post.photo ?? "",
          translations: translations.map((tr) => ({
            locale: tr.locale as "pt" | "en" | "es",
            slug: tr.slug,
            title: tr.title,
            description: tr.description,
            content: tr.content,
          })),
          tagIds: post.postTags.map((pt) => pt.tagId),
        }}
      />
    </div>
  );
}
