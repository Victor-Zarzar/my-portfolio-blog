import { getTranslations } from "next-intl/server";
import { AnalyticsCards } from "@/app/features/analytics/analytics-cards";
import { PostsChart } from "@/app/features/analytics/posts-chart";
import { TagsChart } from "@/app/features/analytics/tags-chart";
import { TranslationsChart } from "@/app/features/analytics/translations-chart";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { getAnalytics } from "@/lib/db/queries/analytics";

export default async function AnalyticsPage() {
  const t = await getTranslations("dashboard.analytics");

  const analytics = await getAnalytics();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <FadeWrapper>
          <h1 className=" text-2xl font-bold">{t("title")}</h1>

          <p className="text-muted-foreground">{t("description")}</p>
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
