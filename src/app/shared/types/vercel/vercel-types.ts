export type VercelCountResponse = {
  version: number;
  data: {
    pageviews: number;
    visitors: number;
  };
};

export type VercelAggregateRow = {
  timestamp?: string;
  requestPath?: string;
  country?: string;
  pageviews: number;
  visitors: number;
};

export type VercelAggregateResponse = {
  version: number;
  data: VercelAggregateRow[];
};
