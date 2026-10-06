import { FileCheck2, FileText, Tags, Text } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalyticsCardsProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const t = useTranslations("dashboard.analytics");

  const cards = [
    {
      title: t("cards.totalPosts"),
      value: data.totalPosts,
      icon: FileText,
    },
    {
      title: t("cards.publishedPosts"),
      value: data.publishedPosts,
      icon: FileCheck2,
    },
    {
      title: t("cards.draftPosts"),
      value: data.draftPosts,
      icon: Text,
    },
    {
      title: t("cards.totalTags"),
      value: data.totalTags,
      icon: Tags,
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
