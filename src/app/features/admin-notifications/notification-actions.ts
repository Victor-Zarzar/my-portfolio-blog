"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications/notification-service";

const notificationIdSchema = z.string().min(1);

export async function markNotificationAsReadAction(notificationId: string) {
  const session = await requireAdmin();
  const id = notificationIdSchema.parse(notificationId);

  await markNotificationAsRead({
    notificationId: id,
    userId: session.user.id,
  });
  revalidatePath("/[locale]/admin/notifications", "page");
}

export async function markAllNotificationsAsReadAction() {
  const session = await requireAdmin();
  await markAllNotificationsAsRead(session.user.id);
  revalidatePath("/[locale]/admin/notifications", "page");
}
