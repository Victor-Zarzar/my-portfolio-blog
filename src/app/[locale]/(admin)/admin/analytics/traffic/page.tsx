import { ChartColumnIncreasing } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TopPathsChart } from "@/app/features/analytics/traffic/top-paths-chart";
import { TrafficCards } from "@/app/features/analytics/traffic/traffic-cards";
import { TrafficChart } from "@/app/features/analytics/traffic/traffic-chart";
import { VisitorsMap } from "@/app/features/analytics/traffic/visitors-map";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { getTrafficAnalytics } from "@/lib/vercel/analytics";

export const dynamic = "force-dynamic";

export default async function TrafficAnalyticsPage() {
  const t = await getTranslations("dashboard.analytics.traffic");
  const analytics = await getTrafficAnalytics();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <AdminPageHeader
            icon={ChartColumnIncreasing}
            title={t("title")}
            description={t("description")}
          />
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
