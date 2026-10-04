import "server-only";

import { captureServerError } from "@/app/shared/helpers/capture-server-error";
import type {
  FirewallAction,
  FirewallPoint,
  SecuritySummary,
} from "@/app/shared/types/analytics/analytics";
import type {
  FirewallAnalytics,
  VercelFirewallEvent,
  VercelFirewallResponse,
} from "@/app/shared/types/firewall/firewall";
import { cacheWithRedis } from "@/lib/redis/cache";
import { cacheKeys } from "@/lib/redis/keys";
import { vercelFetch } from "./client";

const FIREWALL_EVENTS_ENDPOINT = "/v1/security/firewall/events";

function normalizeAction(event: VercelFirewallEvent) {
  return `${event.action} ${event.action_type}`
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isDenied(event: VercelFirewallEvent) {
  const action = normalizeAction(event);
  return action.includes("deny") || action.includes("block");
}

function isChallenged(event: VercelFirewallEvent) {
  return normalizeAction(event).includes("challenge");
}

function isRateLimited(event: VercelFirewallEvent) {
  const action = normalizeAction(event);
  return (
    action.includes("rate_limit") ||
    (action.includes("rate") && action.includes("limit"))
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function createSummary(events: VercelFirewallEvent[]): SecuritySummary {
  return events.reduce<SecuritySummary>(
    (summary, event) => {
      summary.events += event.count;
      if (isDenied(event)) {
        summary.denied += event.count;
      }
      if (isChallenged(event)) {
        summary.challenged += event.count;
      }
      if (isRateLimited(event)) {
        summary.rateLimited += event.count;
      }
      return summary;
    },
    {
      events: 0,
      denied: 0,
      challenged: 0,
      rateLimited: 0,
    },
  );
}

function createTimeline(
  events: VercelFirewallEvent[],
  since: Date,
  until: Date,
): FirewallPoint[] {
  const timeline = new Map<string, FirewallPoint>();
  const current = new Date(since);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(until);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    const date = formatDate(current);
    timeline.set(date, {
      date,
      denied: 0,
      challenged: 0,
      rateLimited: 0,
    });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  for (const event of events) {
    const date = formatDate(event.startTime);
    const point = timeline.get(date);
    if (!point) {
      continue;
    }
    if (isDenied(event)) {
      point.denied += event.count;
    }
    if (isChallenged(event)) {
      point.challenged += event.count;
    }
    if (isRateLimited(event)) {
      point.rateLimited += event.count;
    }
  }
  return Array.from(timeline.values());
}

function createActions(events: VercelFirewallEvent[]): FirewallAction[] {
  const actions = new Map<string, FirewallAction>();
  for (const event of events) {
    const key = [
      event.ruleId ?? "system",
      event.action,
      event.host ?? "unknown",
    ].join(":");
    const existing = actions.get(key);
    if (existing) {
      existing.count += event.count;
      continue;
    }
    actions.set(key, {
      id: key,
      action: event.action,
      ruleName: event.ruleName,
      host: event.host,
      count: event.count,
    });
  }
  return Array.from(actions.values()).sort((a, b) => b.count - a.count);
}

async function getFirewallEvents() {
  const response = await vercelFetch<VercelFirewallResponse>(
    FIREWALL_EVENTS_ENDPOINT,
    {
      limit: 100,
    },
  );
  return response.actions;
}

export async function getFirewallAnalytics(
  days = 30,
): Promise<FirewallAnalytics> {
  try {
    return await cacheWithRedis({
      key: cacheKeys.vercelFirewall(days),
      ttl: 300,
      fetcher: async () => {
        const until = new Date();
        const since = new Date(until);
        since.setUTCDate(since.getUTCDate() - (days - 1));
        since.setUTCHours(0, 0, 0, 0);
        const events = await getFirewallEvents();
        return {
          summary: createSummary(events),
          timeline: createTimeline(events, since, until),
          actions: createActions(events),
        };
      },
    });
  } catch (error) {
    captureServerError("Error fetching Vercel firewall analytics:", error);
    throw error;
  }
}
