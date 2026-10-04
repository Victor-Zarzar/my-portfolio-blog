export type AnalyticsSummary = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
};

export type PostsByMonth = {
  month: string;
  posts: number;
};

export type PostsByTag = {
  tag: string;
  posts: number;
};

export type TranslationsByLocale = {
  locale: string;
  translations: number;
};

export type AnalyticsData = {
  summary: AnalyticsSummary;
  postsByMonth: PostsByMonth[];
  postsByTag: PostsByTag[];
  translationsByLocale: TranslationsByLocale[];
};

export type AnalyticsCardsProps = {
  data: AnalyticsSummary;
};

export type PostsChartProps = {
  data: PostsByMonth[];
};

export type TagsChartProps = {
  data: PostsByTag[];
};

export type TranslationsChartProps = {
  data: TranslationsByLocale[];
};

export type TrafficSummary = {
  pageViews: number;
  visitors: number;
  countries: number;
  topPath: string | null;
};

export type TrafficPoint = {
  date: string;
  pageViews: number;
  visitors: number;
};

export type TrafficAnalytics = {
  summary: TrafficSummary;
  timeline: TrafficPoint[];
  topPaths: TopPath[];
  countries: CountryTraffic[];
};

export type TopPath = {
  path: string;
  views: number;
};

export type CountryTraffic = {
  country: string;
  visitors: number;
  pageViews: number;
};

export type TrafficCardsProps = {
  data: TrafficSummary;
};

export type TrafficChartProps = {
  data: TrafficPoint[];
};

export type TopPathsChartProps = {
  data: TopPath[];
};

export type VisitorsMapProps = {
  data: CountryTraffic[];
};

export type SecuritySummary = {
  events: number;
  denied: number;
  challenged: number;
  rateLimited: number;
};

export type FirewallPoint = {
  date: string;
  denied: number;
  challenged: number;
  rateLimited: number;
};

export type FirewallAction = {
  id: string;
  action: string;
  ruleName: string | null;
  host: string | null;
  count: number;
};

export type SecurityCardsProps = {
  data: SecuritySummary;
};

export type FirewallChartProps = {
  data: FirewallPoint[];
};

export type FirewallActionsProps = {
  data: FirewallAction[];
};

export type CountryProperties = {
  iso_a2: string;
  name: string;
};

export type HoveredCountry = {
  name: string;
  code: string;
  visitors: number;
};
