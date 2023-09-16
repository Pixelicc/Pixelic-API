import Bottleneck from "bottleneck";
import axios from "axios";
import axiosRetry from "axios-retry";
import log from "@pixelic/logger";
import { config, validateUUID, validateUsername } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { formatUUID } from "@pixelic/utils";

const limiter = new Bottleneck({
  reservoir: 600,
  reservoirRefreshAmount: 600,
  reservoirRefreshInterval: 60000,
  maxConcurrent: 3,
  id: "Mojang:Limiter",
  datastore: config.environment === "PROD" ? "ioredis" : "local",
  clearDatastore: true,
  clientOptions: config.database.redis,
});

axiosRetry(axios, {
  retries: 10,
  retryDelay: (retryCount) => {
    log("Mojang", `Retrying to fetch Mojang Data... (Attempt : ${retryCount} | Retrying in : ${Math.pow(retryCount, 2) * 5}s)`, "warn");
    return Math.pow(retryCount, 2) * 5000;
  },
  retryCondition: async (error) => {
    return error?.response?.status === 429 || error?.response?.status === 502 || error?.response?.status === 503 || error?.response?.status === 504;
  },
});

export const requestUUID = async (username: string) => {
  username = username.toLowerCase();
  if (await redis.exists(`Mojang:Cache:${username}`)) return JSON.parse((await redis.get(`Mojang:Cache:${username}`)) as string);
  try {
    return await limiter.schedule({ expiration: 10000 }, async () => {
      if (await redis.exists(`Mojang:Cache:${username}`)) {
        limiter.incrementReservoir(1);
        return JSON.parse((await redis.get(`Mojang:Cache:${username}`)) as string);
      }
      log("Mojang", `Requested UUID of ${username}`, "info");
      const request = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
      const data = { UUID: formatUUID(request.data.id), username: request.data.name };
      if ((await redis.zscore("Mojang:UUIDList", data.UUID)) === null) await redis.zadd("Mojang:UUIDList", Math.floor(Date.now() / 1000), data.UUID);
      await redis.setex(`Mojang:Cache:${request.data.name.toLowerCase()}`, 86400 * 30, JSON.stringify(data));
      await redis.setex(`Mojang:Cache:${data.UUID}`, 86400 * 30, JSON.stringify(data));
      return data;
    });
  } catch {
    await redis.setex(`Mojang:Cache:${username}`, 86400, "");
    throw new Error("An Error occured whilst fetching this players UUID!");
  }
};

export const requestUsername = async (UUID: string) => {
  UUID = formatUUID(UUID);
  if (await redis.exists(`Mojang:Cache:${UUID}`)) return JSON.parse((await redis.get(`Mojang:Cache:${UUID}`)) as string);
  try {
    return await limiter.schedule({ expiration: 10000 }, async () => {
      if (await redis.exists(`Mojang:Cache:${UUID}`)) {
        limiter.incrementReservoir(1);
        return JSON.parse((await redis.get(`Mojang:Cache:${UUID}`)) as string);
      }
      log("Mojang", `Requested Username of ${UUID}`, "info");
      const request = await axios.get(`https://api.mojang.com/user/profile/${UUID}`);
      const data = { UUID: formatUUID(request.data.id), username: request.data.name };
      if ((await redis.zscore("Mojang:UUIDList", data.UUID)) === null) await redis.zadd("Mojang:UUIDList", Math.floor(Date.now() / 1000), data.UUID);
      await redis.setex(`Mojang:Cache:${request.data.name.toLowerCase()}`, 86400 * 30, JSON.stringify(data));
      await redis.setex(`Mojang:Cache:${UUID}`, 86400 * 30, JSON.stringify(data));
      return data;
    });
  } catch {
    await redis.setex(`Mojang:Cache:${UUID}`, 86400, "");
    throw new Error("An Error occured whilst fetching this players UUID!");
  }
};

export const parseUUID = async (player: string) => {
  try {
    if (validateUUID(player)) return formatUUID(player);
    if (!validateUsername(player)) return null;
    return (await requestUUID(player)).UUID;
  } catch {
    return null;
  }
};
