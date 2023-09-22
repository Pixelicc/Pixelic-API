// If you want to add futher custom scopes just do it by adding `| "YOUR-SCOPE"` to the type below
export type APIKeyScope = "";

export interface APIKeyRedis {
  owner: string;
  type?: "CUSTOM" | "STAFF" | "ADMIN";
  scopes?: APIKeyScope[];
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

export type RequireOneObjParam<T> = { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>> }[keyof T];
