import type { NotificationType } from "@/app/shared/types/notification/notification";

export const NOTIFICATION_POPOVER_LIMIT = 10;

export const NOTIFICATION_PAGE_LIMIT = 100;

export const NOTIFICATION_POLL_INTERVAL = 30_000;

export const notificationTranslationKeys = {
  "post.published": "events.post.published",
  "post.unpublished": "events.post.unpublished",

  "contact.received": "events.contact.received",

  "security.firewall_spike": "events.security.firewallSpike",
  "security.two_factor_enabled": "events.security.twoFactorEnabled",
  "security.two_factor_disabled": "events.security.twoFactorDisabled",
  "security.password_changed": "events.security.passwordChanged",

  "integration.vercel_error": "events.integration.vercelError",
  "integration.cloudinary_error": "events.integration.cloudinaryError",
} as const satisfies Record<NotificationType, string>;
