import { asc } from "drizzle-orm";
import { Tags } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TagsDataTable } from "@/app/features/tags-columns/tags-table";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schemas/schema";

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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <AdminPageHeader
            icon={Tags}
            title={t("tags.title")}
            description={t("tags.description")}
          />
        </FadeWrapper>
      </div>
      <TagsDataTable data={data} />
    </div>
  );
}
