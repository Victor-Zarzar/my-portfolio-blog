"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatChartDate } from "@/app/shared/helpers/format-date";
import type { FirewallChartProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";
import type { ChartConfig } from "@/app/shared/ui/chart";
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
      color: "oklch(0.637 0.237 25.331)",
    },
    challenged: {
      label: t("charts.challenged"),
      color: "oklch(0.705 0.213 47.604)",
    },
    rateLimited: {
      label: t("charts.rateLimited"),
      color: "oklch(0.795 0.184 86.047)",
    },
  } satisfies ChartConfig;

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
              stroke="var(--card)"
              strokeWidth={1}
            />
            <Bar
              dataKey="challenged"
              stackId="firewall"
              fill="var(--color-challenged)"
              stroke="var(--card)"
              strokeWidth={1}
            />
            <Bar
              dataKey="rateLimited"
              stackId="firewall"
              fill="var(--color-rateLimited)"
              stroke="var(--card)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
