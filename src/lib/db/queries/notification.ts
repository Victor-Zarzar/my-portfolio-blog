import "server-only";

import { count, desc, eq, isNull } from "drizzle-orm";
import type {
  NotificationData,
  NotificationDto,
  NotificationSeverity,
  NotificationSnapshot,
  NotificationType,
} from "@/app/shared/types/notification/notification";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schemas/notification";

function toNotificationDto(
  row: typeof notification.$inferSelect,
): NotificationDto {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as NotificationType,
    severity: row.severity as NotificationSeverity,
    data: (row.data as NotificationData | null) ?? null,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getNotifications({
  userId,
  limit = 10,
  unreadOnly = false,
}: {
  userId: string;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationDto[]> {
  const where = unreadOnly
    ? eq(notification.userId, userId) && isNull(notification.readAt)
    : eq(notification.userId, userId);

  const rows = await db
    .select()
    .from(notification)
    .where(where)
    .orderBy(desc(notification.createdAt))
    .limit(limit);

  return rows.map(toNotificationDto);
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const [result] = await db
    .select({
      value: count(),
    })
    .from(notification)
    .where(eq(notification.userId, userId) && isNull(notification.readAt));

  return result?.value ?? 0;
}

export async function getNotificationSnapshot(
  userId: string,
  limit = 10,
): Promise<NotificationSnapshot> {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications({
      userId,
      limit,
    }),
    getUnreadNotificationCount(userId),
  ]);

  return {
    notifications,
    unreadCount,
  };
}
