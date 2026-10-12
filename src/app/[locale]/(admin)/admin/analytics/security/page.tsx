import { ChartArea } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FirewallActions } from "@/app/features/analytics/security/firewall-actions";
import { FirewallChart } from "@/app/features/analytics/security/firewall-chart";
import { SecurityCards } from "@/app/features/analytics/security/security-cards";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { AdminPageHeader } from "@/app/widgets/admin-page-header/admin-page-header";
import { getFirewallAnalytics } from "@/lib/vercel/firewall";

export default async function SecurityAnalyticsPage() {
  const t = await getTranslations("dashboard.analytics.security");
  const analytics = await getFirewallAnalytics();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <FadeWrapper>
          <AdminPageHeader
            icon={ChartArea}
            title={t("title")}
            description={t("description")}
          />
        </FadeWrapper>
      </div>
      <SecurityCards data={analytics.summary} />
      <FirewallChart data={analytics.timeline} />
      <FirewallActions data={analytics.actions} />
    </div>
  );
}
