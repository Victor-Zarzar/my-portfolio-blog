import { asc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { TagsDataTable } from "@/app/features/tags-columns/tags-table";
import { Button } from "@/app/shared/ui/button";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";

export default async function TagsPage() {
  const t = await getTranslations("dashboard");

  const allTags = await db.query.tags.findMany({
    orderBy: [asc(tags.name)],
    with: {
      postTags: true,
    },
  });

  const data = allTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postsCount: tag.postTags.length,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <h1 className="text-center text-2xl font-bold">{t("tags.title")}</h1>
        </FadeWrapper>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="w-full border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
            variant="secondary"
          >
            <Link href="/admin/posts">{t("tags.posts")}</Link>
          </Button>
          <Button
            asChild
            className="w-full border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white dark:bg-neutral-800"
            variant="secondary"
          >
            <Link href="/admin/tags/new">{t("tags.new")}</Link>
          </Button>
        </div>
      </div>
      <TagsDataTable data={data} />
    </div>
  );
}
