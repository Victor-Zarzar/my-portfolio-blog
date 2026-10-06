"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TopPathsChartProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/shared/ui/chart";

export function TopPathsChart({ data }: TopPathsChartProps) {
  const t = useTranslations("dashboard.analytics.traffic");

  const chartConfig = {
    views: {
      label: t("charts.views"),
      color: "oklch(0.65 0.22 275)",
    },
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("charts.topPaths")}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="path"
              type="category"
              tickLine={false}
              axisLine={false}
              width={110}
              tickFormatter={(value: string) =>
                value.length > 18 ? `${value.slice(0, 18)}…` : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent className="border-border bg-popover text-popover-foreground shadow-md" />
              }
            />
            <Bar dataKey="views" fill="var(--color-views)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
