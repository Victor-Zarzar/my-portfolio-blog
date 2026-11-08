import { desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PostsTable } from "@/app/features/posts-columns/post-table";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schemas/schema";

export default async function AdminPostsPage() {
  const t = await getTranslations("dashboard");

  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      translations: {
        columns: {
          locale: true,
          slug: true,
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
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
