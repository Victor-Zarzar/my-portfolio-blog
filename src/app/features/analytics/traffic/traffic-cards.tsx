import { Eye, Globe2, Route, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TrafficCardsProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";

export function TrafficCards({ data }: TrafficCardsProps) {
  const t = useTranslations("dashboard.analytics.traffic");

  const cards = [
    {
      title: t("cards.pageViews"),
      value: data.pageViews,
      icon: Eye,
    },
    {
      title: t("cards.visitors"),
      value: data.visitors,
      icon: Users,
    },
    {
      title: t("cards.countries"),
      value: data.countries,
      icon: Globe2,
    },
    {
      title: t("cards.topPath"),
      value: data.topPath ?? "-",
      icon: Route,
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
              <div className="truncate text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
