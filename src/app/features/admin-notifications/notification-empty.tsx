import { BellOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function NotificationEmpty() {
  const t = useTranslations("dashboard.notifications");

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <BellOff className="size-8 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{t("empty.title")}</p>
        <p className="text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    </div>
  );
}
