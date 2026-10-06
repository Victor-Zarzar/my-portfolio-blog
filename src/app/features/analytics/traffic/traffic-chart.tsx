"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatChartDate } from "@/app/shared/helpers/format-date";
import type { TrafficChartProps } from "@/app/shared/types/analytics/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/shared/ui/chart";

export function TrafficChart({ data }: TrafficChartProps) {
  const t = useTranslations("dashboard.analytics.traffic");

  const chartConfig = {
    pageViews: {
      label: t("charts.pageViews"),
      color: "oklch(0.606 0.25 292.717)",
    },
    visitors: {
      label: t("charts.visitors"),
      color: "oklch(0.606 0.25 292.717)",
    },
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("charts.traffic")}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
            <Area
              dataKey="pageViews"
              type="monotone"
              fill="var(--color-pageViews)"
              stroke="var(--color-pageViews)"
              fillOpacity={0.3}
            />
            <Area
              dataKey="visitors"
              type="monotone"
              fill="var(--color-visitors)"
              stroke="var(--color-visitors)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
