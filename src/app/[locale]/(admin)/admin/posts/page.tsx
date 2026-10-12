import { desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PostsTable } from "@/app/features/posts-columns/post-table";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schemas/schema";

export default async function AdminPostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations("dashboard");

  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      translations: {
        where: (translation, { eq }) => eq(translation.locale, locale),
        columns: {
          title: true,
          description: true,
        },
      },
      postTags: {
        with: {
          tag: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <AdminPageHeader
            icon={FileText}
            title={t("posts.title")}
            description={t("posts.description")}
          />
        </FadeWrapper>
      </div>
      <PostsTable data={allPosts} />
    </div>
  );
}
