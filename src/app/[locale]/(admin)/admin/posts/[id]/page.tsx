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
          slug: post.slug,
          year: post.year ?? undefined,
          photo: post.photo ?? "",
          translations: post.translations.map((t) => ({
            locale: t.locale as "pt" | "en" | "es",
            title: t.title,
            description: t.description,
            content: t.content,
          })),
          tagIds: post.postTags.map((pt) => pt.tagId),
        }}
      />
    </div>
  );
}
