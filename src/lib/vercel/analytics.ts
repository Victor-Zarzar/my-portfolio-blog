import "server-only";

import { captureServerError } from "@/app/shared/helpers/capture-server-error";
import type {
  CountryTraffic,
  TopPath,
  TrafficAnalytics,
  TrafficPoint,
} from "@/app/shared/types/analytics/analytics";
import type {
  VercelAggregateResponse,
  VercelAggregateRow,
  VercelCountResponse,
} from "@/app/shared/types/vercel/vercel-types";
import { cacheWithRedis } from "@/lib/redis/cache";
import { cacheKeys } from "@/lib/redis/keys";
import { vercelFetch } from "./client";

const VISITS_COUNT_ENDPOINT = "/v1/query/web-analytics/visits/count";

const VISITS_AGGREGATE_ENDPOINT = "/v1/query/web-analytics/visits/aggregate";

function getDateRange(days: number) {
  const until = new Date();
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);
  return {
    since,
    until,
  };
}

function formatDate(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function createTimeline(
  rows: VercelAggregateRow[],
  since: Date,
  until: Date,
): TrafficPoint[] {
  const trafficByDate = new Map(
    rows
      .filter((row) => row.timestamp)
      .map((row) => [
        formatDate(row.timestamp!),
        {
          pageViews: row.pageviews,
          visitors: row.visitors,
        },
      ]),
  );

  const timeline: TrafficPoint[] = [];
  const current = new Date(since);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(until);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    const date = formatDate(current);
    const traffic = trafficByDate.get(date);
    timeline.push({
      date,
      pageViews: traffic?.pageViews ?? 0,
      visitors: traffic?.visitors ?? 0,
    });
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return timeline;
}

export async function getTrafficAnalytics(
  days = 30,
): Promise<TrafficAnalytics> {
  try {
    return await cacheWithRedis({
      key: cacheKeys.vercelTraffic(days),
      ttl: 300,
      fetcher: async () => {
        const { since, until } = getDateRange(days);
        const queryRange = {
          since: since.toISOString(),
          until: until.toISOString(),
        };
        const [
          summaryResponse,
          timelineResponse,
          pathsResponse,
          countriesResponse,
        ] = await Promise.all([
          vercelFetch<VercelCountResponse>(VISITS_COUNT_ENDPOINT, queryRange),
          vercelFetch<VercelAggregateResponse>(VISITS_AGGREGATE_ENDPOINT, {
            ...queryRange,
            by: "day",
          }),
          vercelFetch<VercelAggregateResponse>(VISITS_AGGREGATE_ENDPOINT, {
            ...queryRange,
            by: "requestPath",
            limit: 10,
          }),
          vercelFetch<VercelAggregateResponse>(VISITS_AGGREGATE_ENDPOINT, {
            ...queryRange,
            by: "country",
            limit: 100,
          }),
        ]);

        const topPaths: TopPath[] = pathsResponse.data
          .filter((item) => item.requestPath && item.requestPath !== "Others")
          .map((item) => ({
            path: item.requestPath!,
            views: item.pageviews,
          }))
          .sort((a, b) => b.views - a.views);

        const countries: CountryTraffic[] = countriesResponse.data
          .filter((item) => item.country && /^[A-Z]{2}$/.test(item.country))
          .map((item) => ({
            country: item.country!,
            visitors: item.visitors,
            pageViews: item.pageviews,
          }))
          .sort((a, b) => b.visitors - a.visitors);

        const timeline = createTimeline(timelineResponse.data, since, until);
        return {
          summary: {
            pageViews: summaryResponse.data.pageviews,
            visitors: summaryResponse.data.visitors,
            countries: countries.length,
            topPath: topPaths[0]?.path ?? null,
          },
          timeline,
          topPaths,
          countries,
        };
      },
    });
  } catch (error) {
    captureServerError("Error fetching Vercel analytics:", error);
    throw error;
  }
}
