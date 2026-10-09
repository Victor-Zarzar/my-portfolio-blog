import { NotificationPanel } from "@/app/features/admin-notifications/notification-panel";
import { NOTIFICATION_PAGE_LIMIT } from "@/app/shared/constants/notifications";
import { requireAdmin } from "@/lib/auth/guard";
import { getNotificationSnapshot } from "@/lib/db/queries/notification";

export default async function NotificationsPage() {
  const session = await requireAdmin();

  const snapshot = await getNotificationSnapshot(
    session.user.id,
    NOTIFICATION_PAGE_LIMIT,
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <div className="overflow-hidden rounded-xl border bg-card">
        <NotificationPanel snapshot={snapshot} />
      </div>
    </div>
  );
}
