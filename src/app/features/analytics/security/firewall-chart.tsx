"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatChartDate } from "@/app/shared/helpers/format-date";
import type { FirewallChartProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/shared/ui/chart";

export function FirewallChart({ data }: FirewallChartProps) {
  const t = useTranslations("dashboard.analytics.security");

  const chartConfig = {
    denied: {
      label: t("charts.denied"),
    },
    challenged: {
      label: t("charts.challenged"),
    },
    rateLimited: {
      label: t("charts.rateLimited"),
    },
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("charts.firewall")}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatChartDate(String(value), true)}
            />
            <YAxis tickLine={false} axisLine={false} width={35} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="border-border bg-popover text-popover-foreground shadow-md"
                  labelFormatter={(value) => formatChartDate(String(value))}
                />
              }
            />
            <Bar
              dataKey="denied"
              stackId="firewall"
              fill="var(--color-denied)"
            />
            <Bar
              dataKey="challenged"
              stackId="firewall"
              fill="var(--color-challenged)"
            />
            <Bar
              dataKey="rateLimited"
              stackId="firewall"
              fill="var(--color-rateLimited)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
