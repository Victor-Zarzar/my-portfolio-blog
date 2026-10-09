import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import type { CreateNotificationInput } from "@/app/shared/types/notification/notification";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schemas/notification";

export async function createNotification({
  userId,
  type,
  severity = "info",
  data,
  href,
}: CreateNotificationInput) {
  const [createdNotification] = await db
    .insert(notification)
    .values({
      id: crypto.randomUUID(),
      userId,
      type,
      severity,
      data: data ?? null,
      href: href ?? null,
    })
    .returning({
      id: notification.id,
    });
  return createdNotification;
}

export async function markNotificationAsRead({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  await db
    .update(notification)
    .set({
      readAt: new Date(),
    })
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId),
        isNull(notification.readAt),
      ),
    );
}

export async function markAllNotificationsAsRead(userId: string) {
  await db
    .update(notification)
    .set({
      readAt: new Date(),
    })
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
}
