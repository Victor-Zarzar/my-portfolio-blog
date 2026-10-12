import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { NotificationPanel } from "@/app/features/admin-notifications/notification-panel";
import { SettingsPageHeader } from "@/app/features/admin-settings/settings-page-header";
import { NOTIFICATION_PAGE_LIMIT } from "@/app/shared/constants/notifications";
import { Card, CardContent } from "@/app/shared/ui/card";
import { requireAdmin } from "@/lib/auth/guard";
import { getNotificationSnapshot } from "@/lib/db/queries/notification";

export default async function NotificationsPage() {
  const session = await requireAdmin();
  const t = await getTranslations("dashboard.settings.notifications");

  const snapshot = await getNotificationSnapshot(
    session.user.id,
    NOTIFICATION_PAGE_LIMIT,
  );

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        icon={Bell}
        title={t("title")}
        description={t("description")}
      />
      <Card className="w-full gap-0 py-3">
        <CardContent className="px-2">
          <NotificationPanel snapshot={snapshot} />
        </CardContent>
      </Card>
    </section>
  );
}
