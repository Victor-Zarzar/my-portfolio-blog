export type NotificationSeverity = "info" | "success" | "warning" | "error";

export type NotificationType =
  | "post.published"
  | "post.unpublished"
  | "contact.received"
  | "security.firewall_spike"
  | "security.two_factor_enabled"
  | "security.two_factor_disabled"
  | "security.password_changed"
  | "integration.vercel_error"
  | "integration.cloudinary_error";

export type NotificationDataValue = string | number;

export type NotificationData = Record<string, NotificationDataValue>;

export type NotificationDto = {
  id: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  data: NotificationData | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationSnapshot = {
  notifications: NotificationDto[];
  unreadCount: number;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  severity?: NotificationSeverity;
  data?: NotificationData;
  href?: string;
};

export type NotificationPanelProps = {
  snapshot: NotificationSnapshot;
  showViewAll?: boolean;
  onSnapshotChange?: (snapshot: NotificationSnapshot) => void;
  onNavigate?: () => void;
};

export type NotificationItemProps = {
  notification: NotificationDto;
  onSelect: (notification: NotificationDto) => void;
};
