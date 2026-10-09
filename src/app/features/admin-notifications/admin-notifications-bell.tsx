"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { NOTIFICATION_POLL_INTERVAL } from "@/app/shared/constants/notifications";
import type { NotificationSnapshot } from "@/app/shared/types/notification/notification";
import { Button } from "@/app/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/shared/ui/popover";
import { NotificationPanel } from "./notification-panel";

const initialSnapshot: NotificationSnapshot = {
  notifications: [],
  unreadCount: 0,
};

export function AdminNotificationBell() {
  const t = useTranslations("dashboard.notifications");
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] =
    useState<NotificationSnapshot>(initialSnapshot);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        cache: "no-store",
        redirect: "manual",
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as NotificationSnapshot;
      setSnapshot(data);
    } catch {
      // Polling failure should not break the admin UI.
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, NOTIFICATION_POLL_INTERVAL);
    return () => {
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("title")}
        >
          <Bell />
          {snapshot.unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
              {snapshot.unreadCount > 99 ? "99+" : snapshot.unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <NotificationPanel
          snapshot={snapshot}
          showViewAll
          onSnapshotChange={setSnapshot}
          onNavigate={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
