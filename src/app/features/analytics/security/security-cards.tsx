import { Ban, Gauge, ShieldAlert, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SecurityCardsProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";

export function SecurityCards({ data }: SecurityCardsProps) {
  const t = useTranslations("dashboard.analytics.security");

  const cards = [
    {
      title: t("cards.events"),
      value: data.events,
      icon: ShieldCheck,
    },
    {
      title: t("cards.denied"),
      value: data.denied,
      icon: Ban,
    },
    {
      title: t("cards.challenged"),
      value: data.challenged,
      icon: ShieldAlert,
    },
    {
      title: t("cards.rateLimited"),
      value: data.rateLimited,
      icon: Gauge,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
