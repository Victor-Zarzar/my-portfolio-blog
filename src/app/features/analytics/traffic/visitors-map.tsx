"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps/core";

import type {
  CountryProperties,
  HoveredCountry,
  VisitorsMapProps,
} from "@/app/shared/types/analytics/analytics";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/shared/ui/card";

const geoUrl = "/maps/world.json";

export function VisitorsMap({ data }: VisitorsMapProps) {
  const t = useTranslations("dashboard.analytics.traffic");

  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(
    null,
  );

  const visitorsByCountry = new Map(
    data.map((item) => [item.country, item.visitors]),
  );

  const maxVisitors = Math.max(...data.map((item) => item.visitors), 1);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>{t("map.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-hidden rounded-lg">
          {hoveredCountry && (
            <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border bg-background/95 px-3 py-2 text-sm shadow-md backdrop-blur">
              <div className="font-medium">{hoveredCountry.name}</div>
              <div className="text-xs text-muted-foreground">
                {hoveredCountry.visitors}{" "}
                {hoveredCountry.visitors === 1 ? "visitante" : "visitantes"}
              </div>
            </div>
          )}
          <ComposableMap
            width={900}
            height={450}
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 145,
            }}
            className="h-auto w-full"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const properties = geo.properties as CountryProperties | null;
                  const countryCode = properties?.iso_a2;
                  const countryName =
                    properties?.name ?? countryCode ?? "Unknown";
                  const visitors = countryCode
                    ? (visitorsByCountry.get(countryCode) ?? 0)
                    : 0;
                  const intensity = visitors / maxVisitors;
                  const hasVisitors = visitors > 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        hasVisitors
                          ? "var(--chart-1)"
                          : "var(--muted-foreground)"
                      }
                      fillOpacity={hasVisitors ? 0.25 + intensity * 0.75 : 0.1}
                      stroke="var(--border)"
                      strokeWidth={0.45}
                      className="cursor-default outline-none transition-all duration-200 hover:brightness-125 focus-visible:brightness-125"
                      onMouseEnter={() => {
                        if (!countryCode) {
                          return;
                        }
                        setHoveredCountry({
                          code: countryCode,
                          name: countryName,
                          visitors,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <LegendItem opacity={0.12} label={t("map.legend.noData")} />
            <LegendItem opacity={0.4} label={t("map.legend.low")} active />
            <LegendItem opacity={0.65} label={t("map.legend.medium")} active />
            <LegendItem opacity={1} label={t("map.legend.high")} active />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({
  opacity,
  label,
  active = false,
}: {
  opacity: number;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="size-2.5 shrink-0 rounded-sm"
        style={{
          backgroundColor: active
            ? "var(--chart-1)"
            : "var(--muted-foreground)",
          opacity,
        }}
      />
      <span>{label}</span>
    </div>
  );
}
