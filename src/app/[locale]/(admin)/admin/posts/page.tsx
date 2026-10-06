import { desc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { PostsTable } from "@/app/features/posts-columns/post-table";
import { Button } from "@/app/shared/ui/button";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

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
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <h1 className="text-center text-2xl font-bold">{t("posts.title")}</h1>
        </FadeWrapper>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="w-full border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
            variant="secondary"
          >
            <Link href="/admin/tags">{t("tags.title")}</Link>
          </Button>

          <Button
            asChild
            className="w-full border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
            variant="secondary"
          >
            <Link href="/admin/posts/new">{t("posts.new")}</Link>
          </Button>
        </div>
      </div>

      <PostsTable data={allPosts} />
    </div>
  );
}
