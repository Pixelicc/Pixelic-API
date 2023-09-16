import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import log from "@packages/logger";
import { config } from "@packages/utils";

const Limiter = new Bottleneck({
  reservoir: config.hypixel.limit,
  reservoirRefreshAmount: config.hypixel.limit,
  reservoirRefreshInterval: 300000,
  maxConcurrent: 1,
  id: "Hypixel:Limiter",
  datastore: config.environment === "PROD" ? "ioredis" : "local",
  clearDatastore: true,
  clientOptions: config.database.redis,
});

axiosRetry(axios, {
  retries: 10,
  retryDelay: (retryCount) => {
    log("Hypixel", `Retrying to fetch Hypixel Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2) * 5}s)`, "warn");
    return Math.pow(retryCount, 2) * 5000;
  },
  retryCondition: async (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});

export const requestHypixel = async (URL: string) => {
  try {
    return await Limiter.schedule({ expiration: 10000 }, async () => {
      const request = await axios.get(URL, { headers: { "API-Key": config.hypixel.key } });
      return request.data;
    });
  } catch {
    throw new Error();
  }
};
