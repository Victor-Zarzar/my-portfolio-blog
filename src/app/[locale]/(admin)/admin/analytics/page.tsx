import { ChartColumn } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AnalyticsCards } from "@/app/features/analytics/analytics-cards";
import { PostsChart } from "@/app/features/analytics/posts-chart";
import { TagsChart } from "@/app/features/analytics/tags-chart";
import { TranslationsChart } from "@/app/features/analytics/translations-chart";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { getAnalytics } from "@/lib/db/queries/analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const t = await getTranslations("dashboard.analytics");
  const analytics = await getAnalytics();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <AdminPageHeader
            icon={ChartColumn}
            title={t("title")}
            description={t("description")}
          />
        </FadeWrapper>
      </div>
      <AnalyticsCards data={analytics.summary} />
      <div className="grid gap-6 xl:grid-cols-2">
        <PostsChart data={analytics.postsByMonth} />
        <TagsChart data={analytics.postsByTag} />
      </div>
      <TranslationsChart data={analytics.translationsByLocale} />
    </div>
  );
}
