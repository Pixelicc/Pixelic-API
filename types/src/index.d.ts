export interface APIKeyRedis {
  owner: string;
  type: undefined | string;
  limit: string;
  lastRequest: number | string;
  requestsLastPeriod: number;
  requests: number;
  keyHistory: {
    key: string;
    requests: number;
    timestamp: number;
  }[];
  IPHistory: string[];

  // Other custom fields eg. other ratelimiting parameters etc.
  [key: string]: any;
}

export interface APIKeyMongo {
  owner: string;
  usageHistory: {
    [key: string]: number;
  };
  requestHistory: {
    ID: string;
    URL: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    userAgent: string;
    IP: string;
    key: string;
  }[];
}

export type APIKey = APIKeyMongo & APIKeyRedis;
