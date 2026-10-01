"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
    <Card>
      <CardHeader>
        <CardTitle>{t("posts.title")}</CardTitle>
        <CardDescription>{t("posts.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
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
