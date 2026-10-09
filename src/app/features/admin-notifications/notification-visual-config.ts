import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import type { NotificationSeverity } from "@/app/shared/types/notification/notification";

export const notificationSeverityConfig = {
  info: {
    icon: Info,
    className: "text-muted-foreground",
  },

  success: {
    icon: CircleCheck,
    className: "text-emerald-500",
  },

  warning: {
    icon: TriangleAlert,
    className: "text-amber-500",
  },

  error: {
    icon: CircleX,
    className: "text-destructive",
  },
} satisfies Record<
  NotificationSeverity,
  {
    icon: typeof Info;
    className: string;
  }
>;
