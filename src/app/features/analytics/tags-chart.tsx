"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TagsChartProps } from "@/app/shared/types/analytics/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card";
import type { ChartConfig } from "@/app/shared/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/shared/ui/chart";

const chartConfig = {
  posts: {
    label: "Posts",
    color: "oklch(0.606 0.25 292.717)",
  },
} satisfies ChartConfig;

export function TagsChart({ data }: TagsChartProps) {
  const t = useTranslations("dashboard.analytics");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tags.title")}</CardTitle>
        <CardDescription>{t("tags.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="tag"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent className="border-border bg-popover text-popover-foreground shadow-md" />
              }
            />

            <Bar
              dataKey="posts"
              fill="var(--color-posts)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
