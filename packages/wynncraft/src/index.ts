import * as Sentry from "@sentry/node";
import { parseUUID } from "@pixelic/mojang";
import { formatGuild, formatPlayer, formatServerList, formatTerritoryList } from "./formatters.js";
import { config, dashUUID, deepCompare } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { WynncraftPlayerModel, WynncraftHistoricalPlayerModel, WynncraftGuildModel, WynncraftServerPlayercountModel } from "@pixelic/mongo";
import { RequireOneObjParam } from "@pixelic/types";
import log from "@pixelic/logger";

import { Limiter, WynncraftAPI } from "./requestHandler.js";

const checkCache = async (key: string): Promise<boolean> => {
  return config.wynncraft.cache && (await redis.exists(key)) === 1;
};

const getCache = async (key: string, options?: { raceCondition: boolean }): Promise<any> => {
  if (options?.raceCondition) {
    Limiter.incrementReservoir(1);
    redis.hincrby("Wynncraft:Stats", "raceConditionCachedRequests", 1);
  } else {
    redis.hincrby("Wynncraft:Stats", "cachedRequests", 1);
  }
  return JSON.parse((await redis.get(key)) as string);
};

export const getPlayer = async (player: string) => {
  const UUID = await parseUUID(player);
  if (UUID === null) return "Invalid UUID or Username";
  try {
    if (await checkCache(`Wynncraft:Cache:Players:${UUID}`)) return await getCache(`Wynncraft:Cache:Players:${UUID}`);
    return await Limiter.schedule(async () => {
      if (await checkCache(`Wynncraft:Cache:Players:${UUID}`)) return await getCache(`Wynncraft:Cache:Players:${UUID}`, { raceCondition: true });
      return await WynncraftAPI.get(`/v3/player/${dashUUID(UUID)}`, { params: { fullResult: "True" } })
        .then(async (res) => {
          log("Wynncraft", `Fetched Player (${UUID})`, "info");
          const formattedData = formatPlayer(res.data);
          if (config.wynncraft.cache) await redis.setex(`Wynncraft:Cache:Players:${UUID}`, 300, JSON.stringify(formattedData));
          if (config.wynncraft.persistData) {
            const characters: any = [];
            Object.entries(formattedData.characters as { [key: string]: any }).forEach(([UUID, character]) => {
              characters.push({ UUID, ...character });
            });
            const operation = await WynncraftPlayerModel.updateOne({ _id: UUID }, { $set: { player: { ...formattedData, characters }, lastUpdated: Math.floor(Date.now() / 1000) }, $inc: { updates: 1 } }, { upsert: true });
            if (operation.acknowledged && operation.upsertedId !== null) {
              await WynncraftPlayerModel.updateOne({ _id: UUID }, { $set: { timestamp: Math.floor(Date.now() / 1000) } });
            }
          }
          if (config.hypixel.persistHistoricalData) {
            const lastDataPoint = await WynncraftHistoricalPlayerModel.findOne({
              UUID,
              isFullData: true,
            }).lean();

            if (lastDataPoint === null) {
              await WynncraftHistoricalPlayerModel.create({ UUID, data: formattedData, timestamp: Math.floor(Date.now() / 1000), isFullData: true });
            } else {
              if (lastDataPoint?._id.getTimestamp().toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
                const difference = deepCompare(lastDataPoint.data, formattedData);
                if (Object.keys(difference).length !== 0) {
                  await WynncraftHistoricalPlayerModel.create({ UUID, data: difference, timestamp: Math.floor(Date.now() / 1000), isFullData: undefined });
                  await WynncraftHistoricalPlayerModel.create({ UUID, data: formattedData, timestamp: Math.floor(Date.now() / 1000), isFullData: true });
                  await WynncraftHistoricalPlayerModel.deleteOne({ _id: lastDataPoint?._id });
                }
              }
            }
          }
          return formattedData;
        })
        .catch(async () => {
          if (config.wynncraft.cache) await redis.setex(`Wynncraft:Cache:Players:${UUID}`, 300, JSON.stringify(null));
          return null;
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    if (config.wynncraft.cache) await redis.setex(`Wynncraft:Cache:Players:${UUID}`, 300, JSON.stringify(null));
    return null;
  }
};

export const getGuild = async ({ name, prefix }: RequireOneObjParam<{ name?: string; prefix?: string }>) => {
  try {
    var data: any;
    if (name) {
      if (!/^[a-zA-Z ]{3,32}$/.test(name)) return "Invalid Guild Name";
      if (await checkCache(`Wynncraft:Cache:Guilds:${name.toLowerCase()}`)) return await getCache(`Wynncraft:Cache:Guilds:${name.toLowerCase()}`);
      await Limiter.schedule(async () => {
        if (await checkCache(`Wynncraft:Cache:Guilds:${name.toLowerCase()}`)) return await getCache(`Wynncraft:Cache:Guilds:${name.toLowerCase()}`, { raceCondition: true });
        try {
          data = (await WynncraftAPI.get(`/v3/guild/${name}`)).data;
        } catch {
          return null;
        }
      });
      log("Wynncraft", `Fetched Guild (${name})`, "info");
    }
    if (prefix) {
      if (!/^[a-zA-Z]{3,4}$/.test(prefix)) return "Invalid Guild Prefix";
      if (await checkCache(`Wynncraft:Cache:Guilds:${prefix.toLowerCase()}`)) return await getCache(`Wynncraft:Cache:Guilds:${await redis.get(`Wynncraft:Cache:Guilds:${prefix.toLowerCase()}`)}`);
      await Limiter.schedule(async () => {
        if (await checkCache(`Wynncraft:Cache:Guilds:${prefix.toLowerCase()}`)) return await getCache(`Wynncraft:Cache:Guilds:${await redis.get(`Wynncraft:Cache:Guilds:${prefix.toLowerCase()}`)}`, { raceCondition: true });
        try {
          data = (await WynncraftAPI.get(`/v3/guild/prefix/${prefix}`)).data;
        } catch {
          return null;
        }
      });
      log("Wynncraft", `Fetched Guild (${prefix})`, "info");
    }
    if (!data.name) return "This Guild does not exist";
    const formattedData = formatGuild(data);
    if (config.wynncraft.cache) {
      await redis.setex(`Wynncraft:Cache:Guilds:${formattedData.prefix.toLowerCase()}`, 600, formattedData.name.toLowerCase());
      await redis.setex(`Wynncraft:Cache:Guilds:${formattedData.name.toLowerCase()}`, 600, JSON.stringify(formattedData));
    }
    if (config.wynncraft.persistData) {
      const operation = await WynncraftGuildModel.updateOne({ _id: formattedData.name.toUpperCase() }, { $set: { guild: formattedData, lastUpdated: Math.floor(Date.now() / 1000) }, $inc: { updates: 1 } }, { upsert: true });
      if (operation.acknowledged && operation.upsertedId !== null) {
        await WynncraftGuildModel.updateOne({ _id: formattedData.name.toUpperCase() }, { $set: { timestamp: Math.floor(Date.now() / 1000) } });
      }
    }
    return formattedData;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGuildList = async () => {
  try {
    if (await checkCache("Wynncraft:Cache:guildList")) return await getCache("Wynncraft:Cache:guildList");
    return await Limiter.schedule(async () => {
      if (await checkCache("Wynncraft:Cache:guildList")) return await getCache("Wynncraft:Cache:guildList", { raceCondition: true });
      return await WynncraftAPI.get("/v3/guild/list/guild")
        .then(async (res) => {
          log("Wynncraft", "Fetched Guild List", "info");
          if (config.wynncraft.cache) await redis.setex("Wynncraft:Cache:guildList", 300, JSON.stringify({ guildcount: res.data.length, guilds: res.data }));
          return { guildcount: res.data.length, guilds: res.data };
        })
        .catch(() => {
          return null;
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getServerList = async ({ UUIDs }: { UUIDs?: boolean }) => {
  try {
    if (await checkCache("Wynncraft:Cache:serverList")) return await formatServerList(await getCache("Wynncraft:Cache:serverList"), { UUIDs });
    return await Limiter.schedule(async () => {
      if (await checkCache("Wynncraft:Cache:serverList")) return await formatServerList(await getCache("Wynncraft:Cache:serverList", { raceCondition: true }), { UUIDs });
      return await WynncraftAPI.get("/v3/player")
        .then(async (res) => {
          log("Wynncraft", "Fetched Wynncraft Server List", "info");
          const formattedData = await formatServerList(res.data, { UUIDs: UUIDs });
          if (config.wynncraft.cache) await redis.setex("Wynncraft:Cache:serverList", 55, JSON.stringify(res.data));
          if (config.wynncraft.persistData) {
            const persistableData = [];
            for (const server of Object.keys(formattedData.servers)) {
              persistableData.push({ timestamp: new Date(), meta: server, data: formattedData.servers[server].playercount });
            }
            await WynncraftServerPlayercountModel.shortTerm.insertMany(persistableData);

            // Checks wether the last ingestion on the long term collection was over an hour ago
            if (!(await redis.exists("Wynncraft:lastServerListLongTermIngestion"))) {
              await WynncraftServerPlayercountModel.longTerm.insertMany(persistableData);
              await redis.setex("Wynncraft:lastServerListLongTermIngestion", 3595, "");
            }
          }
          return formattedData;
        })
        .catch(() => {
          return null;
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getTerritoryList = async () => {
  try {
    if (await checkCache("Wynncraft:Cache:territoryList")) return await getCache("Wynncraft:Cache:territoryList");
    return await Limiter.schedule(async () => {
      if (await checkCache("Wynncraft:Cache:territoryList")) return await getCache("Wynncraft:Cache:territoryList", { raceCondition: true });
      return await WynncraftAPI.get("/v3/guild/list/territory")
        .then(async (res) => {
          log("Wynncraft", "Fetched Territory List", "info");
          const formattedData = formatTerritoryList(res.data);
          if (config.wynncraft.cache) await redis.setex("Wynncraft:Cache:territoryList", 300, JSON.stringify(formattedData));
          return formattedData;
        })
        .catch(() => {
          return null;
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};
