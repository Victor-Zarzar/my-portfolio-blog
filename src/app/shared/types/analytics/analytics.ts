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
