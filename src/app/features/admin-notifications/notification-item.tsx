"use client";

import { useLocale, useTranslations } from "next-intl";
import { notificationTranslationKeys } from "@/app/shared/constants/notifications";
import { formatRelativeTime } from "@/app/shared/helpers/format-relative-time";
import type { NotificationItemProps } from "@/app/shared/types/notification/notification";
import { notificationSeverityConfig } from "./notification-visual-config";

export function NotificationItem({
  notification,
  onSelect,
}: NotificationItemProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard.notifications");
  const config = notificationSeverityConfig[notification.severity];
  const Icon = config.icon;
  const translationKey = notificationTranslationKeys[notification.type];

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className="mt-0.5">
        <Icon className={`size-4 ${config.className}`} />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm leading-snug">
            {t(translationKey, notification.data ?? {})}
          </p>
          {!notification.readAt && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt, locale)}
        </p>
      </div>
    </button>
  );
}
