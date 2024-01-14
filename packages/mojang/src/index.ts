import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import * as Sentry from "@sentry/node";
import log from "@pixelic/logger";
import { config, validateUUID, validateUsername } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { formatUUID } from "@pixelic/utils";
import { requestTracker } from "@pixelic/interceptors";
import { GetterResponse } from "@pixelic/types";

const MojangAPI = axios.create();

MojangAPI.interceptors.response.use(requestTracker);

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

axiosRetry(MojangAPI, {
  retries: 5,
  retryDelay: (retryCount) => {
    log("Mojang", `Retrying to fetch Mojang Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2)}s)`, "warn");
    return Math.pow(retryCount, 2) * 1000;
  },
  retryCondition: (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});

export const requestUUID = async (username: string): Promise<GetterResponse<string, "Invalid Username" | "Invalid Player", boolean | null>> => {
  if (!validateUsername(username)) return { error: "Invalid Username", cached: null };
  username = username.toLowerCase();
  if (config.mojang.cache && (await redis.exists(`Mojang:Cache:${username}`))) {
    redis.hincrby("Mojang:Stats", "cachedRequests", 1);
    return { data: JSON.parse((await redis.get(`Mojang:Cache:${username}`)) as string).UUID, cached: true };
  }
  try {
    return await limiter.schedule(async () => {
      if (await redis.exists(`Mojang:Cache:${username}`)) {
        limiter.incrementReservoir(1);
        redis.hincrby("Mojang:Stats", "raceConditionCachedRequests", 1);
        return { data: JSON.parse((await redis.get(`Mojang:Cache:${username}`)) as string).UUID, cached: true };
      }
      return await MojangAPI.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        .then(async (request) => {
          log("Mojang", `Fetched UUID (${username})`, "info");
          const data = { UUID: formatUUID(request.data.id), username: request.data.name };
          if (config.mojang.UUIDList && (await redis.zscore("Mojang:UUIDList", data.UUID)) === null) await redis.zadd("Mojang:UUIDList", Math.floor(Date.now() / 1000), data.UUID);
          if (config.mojang.cache) {
            await redis.setex(`Mojang:Cache:${request.data.name.toLowerCase()}`, 86400 * 30, JSON.stringify(data));
            await redis.setex(`Mojang:Cache:${data.UUID}`, 86400 * 30, JSON.stringify(data));
          }
          return { data: data.UUID, cached: false };
        })
        .catch(async () => {
          if (config.mojang.cache) await redis.setex(`Mojang:Cache:${username}`, 3600, JSON.stringify({ username, UUID: null }));
          return { error: "Invalid Player", cached: false };
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    if (config.mojang.cache) await redis.setex(`Mojang:Cache:${username}`, 3600, JSON.stringify({ username, UUID: null }));
    return { error: "Unkown", cached: null };
  }
};

export const requestUsername = async (UUID: string): Promise<GetterResponse<string, "Invalid UUID" | "Invalid Player", boolean | null>> => {
  if (!validateUUID(UUID)) return { error: "Invalid UUID", cached: null };
  UUID = formatUUID(UUID);
  if (config.mojang.cache && (await redis.exists(`Mojang:Cache:${UUID}`))) {
    redis.hincrby("Mojang:Stats", "cachedRequests", 1);
    return { data: JSON.parse((await redis.get(`Mojang:Cache:${UUID}`)) as string).username, cached: true };
  }
  try {
    return await limiter.schedule(async () => {
      if (await redis.exists(`Mojang:Cache:${UUID}`)) {
        limiter.incrementReservoir(1);
        redis.hincrby("Mojang:Stats", "raceConditionCachedRequests", 1);
        return { data: JSON.parse((await redis.get(`Mojang:Cache:${UUID}`)) as string).username, cached: true };
      }
      return await MojangAPI.get(`https://api.mojang.com/user/profile/${UUID}`)
        .then(async (request) => {
          log("Mojang", `Fetched Username (${UUID})`, "info");
          const data = { UUID: formatUUID(request.data.id), username: request.data.name };
          if (config.mojang.UUIDList && (await redis.zscore("Mojang:UUIDList", data.UUID)) === null) await redis.zadd("Mojang:UUIDList", Math.floor(Date.now() / 1000), data.UUID);
          if (config.mojang.cache) {
            await redis.setex(`Mojang:Cache:${request.data.name.toLowerCase()}`, 86400 * 30, JSON.stringify(data));
            await redis.setex(`Mojang:Cache:${UUID}`, 86400 * 30, JSON.stringify(data));
          }
          return { data: data.username, cached: false };
        })
        .catch(async () => {
          if (config.mojang.cache) await redis.setex(`Mojang:Cache:${UUID}`, 3600, JSON.stringify({ username: null, UUID }));
          return { error: "Invalid Player", cached: false };
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    if (config.mojang.cache) await redis.setex(`Mojang:Cache:${UUID}`, 3600, JSON.stringify({ username: null, UUID }));
    return { error: "Unkown", cached: null };
  }
};

export const parseUUID = async (player: string): Promise<GetterResponse<string, "Invalid Username" | "Invalid UUID" | "Invalid Player", boolean | null>> => {
  if (validateUUID(player)) return { data: formatUUID(player), cached: null };
  if (!validateUsername(player)) return { error: "Invalid Username", cached: null };
  return await requestUUID(player);
};
