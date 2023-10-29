import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";
import { requestTracker } from "@pixelic/interceptors";

/**
 * TODO: Adjust Limiter.reservoir... to new Wynncraft API V3 Values when they are made public
 */

export const Limiter = new Bottleneck({
  reservoir: 180,
  reservoirRefreshAmount: 180,
  reservoirRefreshInterval: 60000,
  maxConcurrent: 1,
  id: "Wynncraft:Limiter",
  datastore: config.environment === "PROD" ? "ioredis" : "local",
  clearDatastore: true,
  clientOptions: config.database.redis,
});

/**
 * TODO : Add Auth Tokens to requestHandler when they are made required
 */
export const WynncraftAPI = axios.create({ baseURL: "https://api.wynncraft.com" });
WynncraftAPI.interceptors.response.use(requestTracker);

axiosRetry(WynncraftAPI, {
  retries: 5,
  retryDelay: (retryCount) => {
    log("Wynncraft", `Retrying to fetch Wynncraft Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2)}s)`, "warn");
    return Math.pow(retryCount, 2) * 1000;
  },
  retryCondition: async (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});
