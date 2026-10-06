import { getTranslations } from "next-intl/server";
import { FirewallActions } from "@/app/features/analytics/security/firewall-actions";
import { FirewallChart } from "@/app/features/analytics/security/firewall-chart";
import { SecurityCards } from "@/app/features/analytics/security/security-cards";
import FadeWrapper from "@/app/shared/wrapper/fade-wrapper";
import { getFirewallAnalytics } from "@/lib/vercel/firewall";

export default async function SecurityAnalyticsPage() {
  const t = await getTranslations("dashboard.analytics.security");
  const analytics = await getFirewallAnalytics();

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <FadeWrapper>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </FadeWrapper>
      </div>
      <SecurityCards data={analytics.summary} />
      <FirewallChart data={analytics.timeline} />
      <FirewallActions data={analytics.actions} />
    </div>
  );
}
