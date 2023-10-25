import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";
import { requestTracker } from "@pixelic/interceptors";

axios.interceptors.response.use(requestTracker);

/**
 * TODO: Adjust Limiter.reservoir... to new Wynncraft API V3 Values when they are made public
 *
 * TODO : Add Auth Tokens to requestHandler when they are made required
 */

const Limiter = new Bottleneck({
  reservoir: 180,
  reservoirRefreshAmount: 180,
  reservoirRefreshInterval: 60000,
  maxConcurrent: 1,
  id: "Wynncraft:Limiter",
  datastore: config.environment === "PROD" ? "ioredis" : "local",
  clearDatastore: true,
  clientOptions: config.database.redis,
});

axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => {
    log("Wynncraft", `Retrying to fetch Wynncraft Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2) * 5}s)`, "warn");
    return Math.pow(retryCount, 2) * 5000;
  },
  retryCondition: async (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});

export const requestWynncraft = async (URL: string) => {
  try {
    return await Limiter.schedule(async () => {
      const request = await axios.get(URL);
      return request.data;
    });
  } catch {
    throw new Error();
  }
};
