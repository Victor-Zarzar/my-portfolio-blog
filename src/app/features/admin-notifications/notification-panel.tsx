"use client";

import { CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  NotificationDto,
  NotificationPanelProps,
  NotificationSnapshot,
} from "@/app/shared/types/notification/notification";
import { Button } from "@/app/shared/ui/button";
import { ScrollArea } from "@/app/shared/ui/scroll-area";
import { Separator } from "@/app/shared/ui/separator";
import { Link, useRouter } from "@/i18n/navigation";

import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "./notification-actions";
import { NotificationEmpty } from "./notification-empty";
import { NotificationItem } from "./notification-item";

export function NotificationPanel({
  snapshot: externalSnapshot,
  showViewAll = false,
  onSnapshotChange,
  onNavigate,
}: NotificationPanelProps) {
  const t = useTranslations("dashboard.notifications");
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(externalSnapshot);

  useEffect(() => {
    setSnapshot(externalSnapshot);
  }, [externalSnapshot]);

  function updateSnapshot(nextSnapshot: NotificationSnapshot) {
    setSnapshot(nextSnapshot);
    onSnapshotChange?.(nextSnapshot);
  }

  async function handleSelect(selectedNotification: NotificationDto) {
    const previousSnapshot = snapshot;

    if (!selectedNotification.readAt) {
      const nextSnapshot: NotificationSnapshot = {
        unreadCount: Math.max(0, snapshot.unreadCount - 1),
        notifications: snapshot.notifications.map((notification) =>
          notification.id === selectedNotification.id
            ? {
                ...notification,
                readAt: new Date().toISOString(),
              }
            : notification,
        ),
      };
      updateSnapshot(nextSnapshot);
      try {
        await markNotificationAsReadAction(selectedNotification.id);
      } catch {
        updateSnapshot(previousSnapshot);
        toast.error(t("errors.markAsRead"));
        return;
      }
    }
    onNavigate?.();
    if (selectedNotification.href) {
      router.push(selectedNotification.href);
    }
    router.refresh();
  }

  async function handleMarkAllAsRead() {
    if (snapshot.unreadCount === 0) {
      return;
    }
    const previousSnapshot = snapshot;
    const now = new Date().toISOString();

    updateSnapshot({
      unreadCount: 0,
      notifications: snapshot.notifications.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? now,
      })),
    });
    try {
      await markAllNotificationsAsReadAction();
      router.refresh();
    } catch {
      updateSnapshot(previousSnapshot);
      toast.error(t("errors.markAllAsRead"));
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="font-semibold">{t("title")}</p>
          {snapshot.unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("unread", {
                count: snapshot.unreadCount,
              })}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={snapshot.unreadCount === 0}
          onClick={handleMarkAllAsRead}
        >
          <CheckCheck />

          {t("markAllAsRead")}
        </Button>
      </div>
      <Separator />
      {snapshot.notifications.length === 0 ? (
        <NotificationEmpty />
      ) : (
        <ScrollArea className="max-h-96">
          <div className="divide-y">
            {snapshot.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </ScrollArea>
      )}
      {showViewAll && (
        <>
          <Separator />
          <Button variant="ghost" className="m-2" asChild>
            <Link href="/admin/notifications" onClick={onNavigate}>
              {t("viewAll")}
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
