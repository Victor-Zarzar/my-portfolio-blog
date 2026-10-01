"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TranslationsChartProps } from "@/app/shared/types/analytics/analytics";
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
  translations: {
    label: "Translations",
    color: "oklch(0.723 0.219 149.579)",
  },
} satisfies ChartConfig;

export function TranslationsChart({ data }: TranslationsChartProps) {
  const t = useTranslations("dashboard.analytics");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("translations.title")}</CardTitle>
        <CardDescription>{t("translations.description")}</CardDescription>
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
              dataKey="locale"
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
              dataKey="translations"
              fill="var(--color-translations)"
              radius={[4, 4, 0, 0]}
              maxBarSize={120}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
