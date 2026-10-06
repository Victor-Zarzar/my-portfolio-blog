"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { formatChartMonth } from "@/app/shared/helpers/format-date";
import type { PostsChartProps } from "@/app/shared/types/analytics/analytics";
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
    color: "oklch(0.623 0.214 259.815)",
  },
} satisfies ChartConfig;

export function PostsChart({ data }: PostsChartProps) {
  const t = useTranslations("dashboard.analytics");

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("posts.title")}</CardTitle>
        <CardDescription>{t("posts.description")}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-55 min-w-0 w-full sm:h-65 xl:h-75"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 8,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatChartMonth(String(value))}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="border-border bg-popover text-popover-foreground shadow-md"
                  labelFormatter={(value) => formatChartMonth(String(value))}
                />
              }
            />
            <Line
              dataKey="posts"
              type="monotone"
              stroke="var(--color-posts)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-posts)",
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
