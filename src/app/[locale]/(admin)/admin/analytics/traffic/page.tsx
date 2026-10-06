import { getTranslations } from "next-intl/server";
import { TopPathsChart } from "@/app/features/analytics/traffic/top-paths-chart";
import { TrafficCards } from "@/app/features/analytics/traffic/traffic-cards";
import { TrafficChart } from "@/app/features/analytics/traffic/traffic-chart";
import { VisitorsMap } from "@/app/features/analytics/traffic/visitors-map";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { getTrafficAnalytics } from "@/lib/vercel/analytics";

export default async function TrafficAnalyticsPage() {
  const t = await getTranslations("dashboard.analytics.traffic");
  const analytics = await getTrafficAnalytics();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <FadeWrapper>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </FadeWrapper>
      </div>
      <TrafficCards data={analytics.summary} />
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <TrafficChart data={analytics.timeline} />
        <TopPathsChart data={analytics.topPaths} />
      </div>
      <VisitorsMap data={analytics.countries} />
    </div>
  );
}
