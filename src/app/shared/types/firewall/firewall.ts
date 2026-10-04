import type {
  FirewallAction,
  FirewallPoint,
  SecuritySummary,
} from "../analytics/analytics";

export type VercelFirewallEvent = {
  action: string;
  action_type: string;
  count: number;
  host: string | null;
  isActive: boolean;
  public_ip: string;
  ruleId: string | null;
  ruleName: string | null;
  startTime: string;
  endTime: string;
};

export type VercelFirewallResponse = {
  actions: VercelFirewallEvent[];
  pagination?: {
    hasMore: boolean;
    next: string | null;
  };
};

export type FirewallAnalytics = {
  summary: SecuritySummary;
  timeline: FirewallPoint[];
  actions: FirewallAction[];
};
