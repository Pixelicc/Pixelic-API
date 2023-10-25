import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import * as Sentry from "@sentry/node";
import log from "@pixelic/logger";
import { config, validateUUID, validateUsername } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { formatUUID } from "@pixelic/utils";
import { requestTracker } from "@pixelic/interceptors";

axios.interceptors.response.use(requestTracker);

const limiter = new Bottleneck({
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval: 60000,
  maxConcurrent: 3,
  id: "Mojang:Limiter",
  datastore: config.environment === "PROD" ? "ioredis" : "local",
  clearDatastore: true,
  clientOptions: config.database.redis,
});

axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => {
    log("Mojang", `Retrying to fetch Mojang Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2) * 5}s)`, "warn");
    return Math.pow(retryCount, 2) * 5000;
  },
  retryCondition: (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});

export const requestUUID = async (username: string): Promise<string | null> => {
  username = username.toLowerCase();
  if (config.mojang.cache && (await redis.exists(`Mojang:Cache:${username}`))) return JSON.parse((await redis.get(`Mojang:Cache:${username}`)) as string).UUID;
  try {
    return await limiter.schedule(async () => {
      if (await redis.exists(`Mojang:Cache:${username}`)) {
        limiter.incrementReservoir(1);
        return JSON.parse((await redis.get(`Mojang:Cache:${username}`)) as string).UUID;
      }
      await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).then(async (request) => {
        log("Mojang", `Requested UUID of ${username}`, "info");
        const data = { UUID: formatUUID(request.data.id), username: request.data.name };
        if (config.mojang.UUIDList && (await redis.zscore("Mojang:UUIDList", data.UUID)) === null) await redis.zadd("Mojang:UUIDList", Math.floor(Date.now() / 1000), data.UUID);
        if (config.mojang.cache) {
          await redis.setex(`Mojang:Cache:${request.data.name.toLowerCase()}`, 86400 * 30, JSON.stringify(data));
          await redis.setex(`Mojang:Cache:${data.UUID}`, 86400 * 30, JSON.stringify(data));
        }
        return data.UUID;
      });
    });
  } catch (e) {
    Sentry.captureException(e);
    if (config.mojang.cache) await redis.setex(`Mojang:Cache:${username}`, 3600, JSON.stringify({ username, UUID: null }));
    return null;
  }
};

export const requestUsername = async (UUID: string): Promise<string | null> => {
  UUID = formatUUID(UUID);
  if (config.mojang.cache && (await redis.exists(`Mojang:Cache:${UUID}`))) return JSON.parse((await redis.get(`Mojang:Cache:${UUID}`)) as string).username;
  try {
    return await limiter.schedule(async () => {
      if (await redis.exists(`Mojang:Cache:${UUID}`)) {
        limiter.incrementReservoir(1);
        return JSON.parse((await redis.get(`Mojang:Cache:${UUID}`)) as string).username;
      }
      await axios.get(`https://api.mojang.com/user/profile/${UUID}`, { timeout: 10000 }).then(async (request) => {
        log("Mojang", `Requested Username of ${UUID}`, "info");
        const data = { UUID: formatUUID(request.data.id), username: request.data.name };
        if (config.mojang.UUIDList && (await redis.zscore("Mojang:UUIDList", data.UUID)) === null) await redis.zadd("Mojang:UUIDList", Math.floor(Date.now() / 1000), data.UUID);
        if (config.mojang.cache) {
          await redis.setex(`Mojang:Cache:${request.data.name.toLowerCase()}`, 86400 * 30, JSON.stringify(data));
          await redis.setex(`Mojang:Cache:${UUID}`, 86400 * 30, JSON.stringify(data));
        }
        return data.username;
      });
    });
  } catch (e) {
    Sentry.captureException(e);
    if (config.mojang.cache) await redis.setex(`Mojang:Cache:${UUID}`, 3600, JSON.stringify({ username: null, UUID }));
    return null;
  }
};

export const parseUUID = async (player: string) => {
  if (validateUUID(player)) return formatUUID(player);
  if (!validateUsername(player)) return null;
  return await requestUUID(player);
};
