import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";
import { requestTracker } from "@pixelic/interceptors";

export const Limiter = new Bottleneck({
  reservoir: config.hypixel.limit,
  reservoirRefreshAmount: config.hypixel.limit,
  reservoirRefreshInterval: 300000,
  maxConcurrent: 1,
  id: "Hypixel:Limiter",
  datastore: config.environment === "PROD" ? "ioredis" : "local",
  clearDatastore: true,
  clientOptions: config.database.redis,
});

export const HypixelAPI = axios.create({ baseURL: "https://api.hypixel.net", headers: { "API-Key": config.hypixel.key } });
HypixelAPI.interceptors.response.use(requestTracker);

axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount, error) => {
    if (error?.response?.headers?.["ratelimit-reset"]) {
      log("Hypixel", `Retrying to fetch Hypixel Data... (Attempt : ${retryCount} | Retrying in : ${Number(error.response.headers["ratelimit-reset"]) * 1000}s)`, "warn");
      return Number(error.response.headers["ratelimit-reset"]) * 1000;
    }
    log("Hypixel", `Retrying to fetch Hypixel Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2) * 5}s)`, "warn");
    return Math.pow(retryCount, 2) * 1000;
  },
  retryCondition: async (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});
