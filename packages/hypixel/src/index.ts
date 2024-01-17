import * as Sentry from "@sentry/node";
import log from "@pixelic/logger";
import { config, deepCompare } from "@pixelic/utils";
import { parseUUID } from "@pixelic/mojang";
import redis from "@pixelic/redis";
import { formatPlayer, formatGuild, formatSkyblockActiveAuction, formatSkyblockEndedAuction, formatSkyblockItems, formatSkyblockElection, formatSkyblockBazaar } from "./formatters.js";
import { GetterResponse, RequireOneObjParam } from "@pixelic/types";
import { HypixelGuildModel, HypixelHistoricalGuildModel, HypixelHistoricalPlayerModel, HypixelPlayerModel, HypixelSkyblockAuctionModel, HypixelSkyblockAuctionTrackingModel, HypixelSkyblockBazaarModel, HypixelSkyblockElectionModel } from "@pixelic/mongo";
import { calculateSkyblockAuctionPrices } from "./calcs.js";

import { Limiter, HypixelAPI } from "./requestHandler.js";

const checkCache = async (key: string): Promise<boolean> => {
  return config.hypixel.cache && (await redis.exists(key)) === 1;
};

const getCache = async (key: string, options?: { raceCondition: boolean }): Promise<any> => {
  if (options?.raceCondition) {
    Limiter.incrementReservoir(1);
    redis.hincrby("Hypixel:Stats", "raceConditionCachedRequests", 1);
  } else {
    redis.hincrby("Hypixel:Stats", "cachedRequests", 1);
  }
  return JSON.parse((await redis.get(key)) as string);
};

export const getPlayer = async (player: string): Promise<GetterResponse<any, "Invalid UUID" | "Invalid Username" | "Invalid Player" | "Invalid Hypixel Player", boolean | null>> => {
  const getUUID = await parseUUID(player);
  if (getUUID?.error) return { error: getUUID.error, cached: getUUID.cached };
  const UUID = getUUID.data;
  try {
    if (await checkCache(`Hypixel:Cache:Players:${UUID}`)) return { data: await getCache(`Hypixel:Cache:Players:${UUID}`), cached: true };
    // @ts-ignore
    return await Limiter.schedule(async () => {
      if (await checkCache(`Hypixel:Cache:Players:${UUID}`)) return { data: await getCache(`Hypixel:Cache:Players:${UUID}`, { raceCondition: true }), cached: true };
      return await HypixelAPI.get("/player", { params: { uuid: UUID } })
        .then(async (res) => {
          log("Hypixel", `Fetched Player (${UUID})`, "info");
          if (res.data.player === null) return { error: "Invalid Hypixel Player", cached: false };
          const formattedData = await formatPlayer(res.data.player);
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Players:${UUID}`, 600, JSON.stringify(formattedData));
          if (config.hypixel.persistData) {
            const operation = await HypixelPlayerModel.updateOne({ _id: UUID }, { $set: { player: formattedData, lastUpdated: Math.floor(Date.now() / 1000) }, $inc: { updates: 1 } }, { upsert: true });
            if (operation.acknowledged && operation.upsertedId !== null) {
              await HypixelPlayerModel.updateOne({ _id: UUID }, { $set: { timestamp: Math.floor(Date.now() / 1000) } });
            }
          }
          if (config.hypixel.persistHistoricalData) {
            const lastDataPoint = await HypixelHistoricalPlayerModel.findOne({
              UUID,
              isFullData: true,
            }).lean();

            if (lastDataPoint === null) {
              await HypixelHistoricalPlayerModel.create({ UUID, data: formattedData, timestamp: Math.floor(Date.now() / 1000), isFullData: true });
            } else {
              if (lastDataPoint?._id.getTimestamp().toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
                const difference = deepCompare(lastDataPoint.data, formattedData);
                if (Object.keys(difference).length !== 0) {
                  await HypixelHistoricalPlayerModel.create({ UUID, data: difference, timestamp: Math.floor(Date.now() / 1000), isFullData: undefined });
                  await HypixelHistoricalPlayerModel.create({ UUID, data: formattedData, timestamp: Math.floor(Date.now() / 1000), isFullData: true });
                  await HypixelHistoricalPlayerModel.deleteOne({ _id: lastDataPoint?._id });
                }
              }
            }
          }
          return { data: formattedData, cached: false };
        })
        .catch(async () => {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Players:${UUID}`, 300, JSON.stringify(null));
          return { error: "Unkown", cached: false };
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getGuild = async ({ player, ID, name }: RequireOneObjParam<{ player?: string; ID?: string; name?: string }>): Promise<GetterResponse<any, "Invalid UUID" | "Invalid Username" | "Invalid Player" | "Player not in Guild" | "Invalid Guild ID" | "Invalid Guild Name" | "Invalid Guild", boolean | null>> => {
  try {
    var data: any;
    if (player) {
      const getUUID = await parseUUID(player);
      if (getUUID?.error) return { error: getUUID.error, cached: getUUID.cached };
      const UUID = getUUID.data;
      if (await checkCache(`Hypixel:Cache:Guilds:${UUID}`)) {
        if ((await getCache(`Hypixel:Cache:Guilds:${UUID}`)) === null) return { error: "Player not in Guild", cached: true };
        return { data: await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${UUID}`)}`), cached: true };
      }
      await Limiter.schedule(async () => {
        if (await checkCache(`Hypixel:Cache:Guilds:${UUID}`)) {
          if ((await getCache(`Hypixel:Cache:Guilds:${UUID}`)) === null) return { error: "Player not in Guild", cached: true };
          return { data: await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${UUID}`)}`, { raceCondition: true }), cached: true };
        }
        try {
          data = (await HypixelAPI.get("/guild", { params: { player: UUID } })).data;
        } catch {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Guilds:${UUID}`, 300, JSON.stringify(null));
          return { error: "Player not in Guild", cached: false };
        }
      });
      log("Hypixel", `Fetched Guild (${UUID})`, "info");
    }
    if (ID) {
      if (!/^[0-9a-fA-F]{24}$/.test(ID)) return { error: "Invalid Guild ID", cached: null };
      if (await checkCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`)) return { data: await getCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`), cached: true };
      await Limiter.schedule(async () => {
        if (await checkCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`)) return { data: await getCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`, { raceCondition: true }), cached: true };
        try {
          data = (await HypixelAPI.get("/guild", { params: { id: ID } })).data;
        } catch {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Guilds:${ID}`, 300, JSON.stringify(null));
          return { error: "Invalid Guild", cached: false };
        }
      });
      log("Hypixel", `Fetched Guild (${ID})`, "info");
    }
    if (name) {
      if (!/^[a-zA-Z0-9_ ]{3,32}$/.test(name)) return { error: "Invalid Guild Name", cached: null };
      if (await checkCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) {
        if ((await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) === null) return { error: "Invalid Guild", cached: true };
        return { data: await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)}`), cached: true };
      }
      await Limiter.schedule(async () => {
        if (await checkCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) {
          if ((await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) === null) return null;
          return { data: await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)}`, { raceCondition: true }), cached: true };
        }
        try {
          data = (await HypixelAPI.get("/guild", { params: { name } })).data;
        } catch {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Guilds:${name.toLowerCase()}`, 300, JSON.stringify(null));
          return { error: "Invalid Guild", cached: false };
        }
      });
      log("Hypixel", `Fetched Guild (${name})`, "info");
    }
    if (data.guild === null) return { error: "Invalid Guild", cached: null };
    const formattedData = formatGuild(data.guild);
    if (config.hypixel.cache) {
      const pipeline = redis.pipeline();
      formattedData.members.forEach((member) => pipeline.setex(`Hypixel:Cache:Guilds:${member.UUID}`, 600, JSON.stringify(formattedData.ID)));
      pipeline.setex(`Hypixel:Cache:Guilds:${formattedData.name.toLowerCase()}`, 600, JSON.stringify(formattedData.ID));
      pipeline.setex(`Hypixel:Cache:Guilds:${formattedData.ID}`, 600, JSON.stringify(formattedData));
      pipeline.exec();
    }

    if (config.hypixel.persistData) {
      const operation = await HypixelGuildModel.updateOne({ _id: formattedData.ID }, { $set: { guild: formattedData, lastUpdated: Math.floor(Date.now() / 1000) }, $inc: { updates: 1 } }, { upsert: true });
      if (operation.acknowledged && operation.upsertedId !== null) {
        await HypixelGuildModel.updateOne({ _id: formattedData.ID }, { $set: { timestamp: Math.floor(Date.now() / 1000) } });
      }
    }
    if (config.hypixel.persistHistoricalData) {
      const members: any = {};
      formattedData.members.forEach((member) => {
        const { UUID, ...rest } = member;
        members[UUID] = rest;
      });

      const lastDataPoint = await HypixelHistoricalGuildModel.findOne({
        ID: formattedData.ID,
        isFullData: true,
      }).lean();

      if (lastDataPoint === null) {
        await HypixelHistoricalGuildModel.create({ ID: formattedData.ID, data: { ...formattedData, members }, isFullData: true });
      } else {
        if (lastDataPoint?._id.getTimestamp().toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
          const difference = deepCompare(lastDataPoint, { ...formattedData, members });
          if (Object.keys(difference).length !== 0) {
            await HypixelHistoricalGuildModel.create({ ID: formattedData.ID, data: difference, isFullData: undefined });
            await HypixelHistoricalGuildModel.create({ ID: formattedData.ID, data: { ...formattedData, members }, isFullData: true });
            await HypixelHistoricalGuildModel.deleteOne({ _id: lastDataPoint?._id });
          }
        }
      }
    }
    return { data: formattedData, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

/**
 * To retrieve and query active auctions use the `queryActiveAuctions` function in combination with this function
 *
 * This is a highly resource heavy function and should be used appropriately
 */
export const getSkyblockActiveAuctions = async () => {
  try {
    const UUIDs: string[] = [];
    const UUIDsBefore = await redis.smembers("Hypixel:Skyblock:Auctions:UUIDs");

    const firstPage = (await HypixelAPI.get("https://api.hypixel.net/v2/skyblock/auctions")).data;
    log("Hypixel", `Fetching Skyblock Auctions (1/${firstPage.totalPages})`, "info");
    const pipeline = redis.pipeline();
    for (const auction of firstPage.auctions) {
      const formattedData = await formatSkyblockActiveAuction(auction);
      pipeline.sadd("Hypixel:Skyblock:Auctions:UUIDs", formattedData.UUID);
      pipeline.call("JSON.SET", `Hypixel:Skyblock:Auctions:${formattedData.UUID}`, "$", JSON.stringify(formattedData));
      UUIDs.push(formattedData.UUID);
    }
    pipeline.exec();

    for (var i = 1; i < firstPage.totalPages; i++) {
      const page = (await HypixelAPI.get(`https://api.hypixel.net/v2/skyblock/auctions?page=${i}`)).data;
      log("Hypixel", `Fetching Skyblock Auctions (${i + 1}/${firstPage.totalPages})`, "info");
      const pipeline = redis.pipeline();
      for (const auction of page.auctions) {
        const formattedData = await formatSkyblockActiveAuction(auction);
        pipeline.sadd("Hypixel:Skyblock:Auctions:UUIDs", formattedData.UUID);
        pipeline.call("JSON.SET", `Hypixel:Skyblock:Auctions:${formattedData.UUID}`, "$", JSON.stringify(formattedData));
        UUIDs.push(formattedData.UUID);
      }
      pipeline.exec();
    }
    log("Hypixel", "Fetched all Skyblock Auctions", "info");

    const removeInvalid = redis.pipeline();
    for (const UUID of UUIDsBefore.filter((UUID) => !UUIDs.includes(UUID))) {
      removeInvalid.srem("Hypixel:Skyblock:Auctions:UUIDs", UUID);
      removeInvalid.del(`Hypixel:Skyblock:Auctions:${UUID}`);
    }

    removeInvalid.exec();
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Skyblock Auctions", "warn");
  }
};

export const querySkyblockActiveAuctions = async (query: string, limit?: number): Promise<GetterResponse<{ count: number; matches: any[] }, "Unkown", null>> => {
  try {
    const result: any = await redis.call("FT.SEARCH", "Hypixel.Skyblock.Auction", query, "LIMIT", "0", limit ? String(limit) : "1000");
    const parsedMatches = [];

    for (var i = 2; i < result.length; i += 2) {
      parsedMatches.push(JSON.parse(result[i][1]));
    }

    return {
      data: {
        count: result[0],
        matches: parsedMatches,
      },
      cached: null,
    };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getSkyblockEndedAuctions = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockEndedAuctions"))) return { data: JSON.parse((await redis.get("Hypixel:Cache:skyblockEndedAuctions")) as string), cached: true };
    const auctions: any[] = [];
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/skyblock/auctions_ended")).data.auctions;
    log("Hypixel", "Fetched Skyblock Ended Auctions", "info");
    const isNewData = (await redis.get("Hypixel:Cache:skyblockEndedAuctionsLastState")) !== JSON.stringify(data);
    for (const auction of data) {
      const formattedData = await formatSkyblockEndedAuction(auction);
      auctions.push(formattedData);
      if (config.hypixel.persistHistoricalData && isNewData) {
        await HypixelSkyblockAuctionModel.create({ _id: formattedData.UUID, ...formattedData, timestamp: Math.floor(Date.now() / 1000) });
        await HypixelSkyblockAuctionTrackingModel.create({ _id: formattedData.UUID, price: formattedData.price, bin: formattedData.bin, itemID: formattedData.item.ID, timestamp: new Date(formattedData.timestamp * 1000) });

        const pipeline = redis.pipeline();
        pipeline.zincrby("Hypixel:Stats:Skyblock:AuctionsSoldByItem", 1, formattedData.item.ID);
        pipeline.zincrby("Hypixel:Stats:Skyblock:AuctionVolumeByItem", formattedData?.item?.count || 1, formattedData.item.ID);
        pipeline.zincrby("Hypixel:Stats:Skyblock:AuctionsSoldByTier", 1, formattedData.item.tier);
        pipeline.hincrby(`Hypixel:Stats:Skyblock:AuctionsSoldByItemHistory:${formattedData.item.ID}`, new Date().toISOString().slice(0, 10), 1);
        pipeline.hincrby(`Hypixel:Stats:Skyblock:AuctionVolumeByItemHistory:${formattedData.item.ID}`, new Date().toISOString().slice(0, 10), formattedData?.item?.count || 1);
        pipeline.hincrby(`Hypixel:Stats:Skyblock:AuctionsSoldByTierHistory:${formattedData.item.tier}`, new Date().toISOString().slice(0, 10), 1);
        pipeline.hincrby("Hypixel:Stats:Skyblock:Auctions", "sold", 1);
        pipeline.hincrby("Hypixel:Stats:Skyblock:Auctions", "coinsMoved", formattedData.price);
        pipeline.hincrby("Hypixel:Stats:Skyblock:AuctionsSoldHistory", new Date().toISOString().slice(0, 10), 1);
        pipeline.hincrby("Hypixel:Stats:Skyblock:AuctionsCoinsMovedHistory", new Date().toISOString().slice(0, 10), formattedData.price);
        pipeline.exec();
      }
    }
    if (config.hypixel.persistHistoricalData) {
      // Checks wether the last ingestion was over an hour ago
      if (!(await redis.exists("Hypixel:lastSkyblockAuctionhouseIngestion"))) {
        await calculateSkyblockAuctionPrices();
      }
    }
    await redis.set("Hypixel:Cache:skyblockEndedAuctionsLastState", JSON.stringify(data));
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockEndedAuctions", 55, JSON.stringify(auctions));
    return { data: auctions, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Skyblock Ended Auctions", "warn");
    return { error: "Unkown", cached: null };
  }
};

export const getSkyblockBazaar = async ({ itemInfo }: { itemInfo?: boolean }): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockBazaar")) {
      return itemInfo ? { data: await formatSkyblockBazaar(await getCache("Hypixel:Cache:skyblockBazaar"), { itemInfo: true }), cached: true } : { data: await formatSkyblockBazaar(await getCache("Hypixel:Cache:skyblockBazaar"), { itemInfo: false }), cached: true };
    }
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/skyblock/bazaar")).data.products;
    log("Hypixel", "Fetched Skyblock Bazaar", "info");
    const formattedData = itemInfo ? await formatSkyblockBazaar(data, { itemInfo: true }) : await formatSkyblockBazaar(data, { itemInfo: false });
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockBazaar", 55, JSON.stringify(data));
    if (config.hypixel.persistData) {
      const persistableData = [];
      for (const product of Object.keys(formattedData)) {
        persistableData.push({ timestamp: new Date(), meta: product, data: formattedData[product].quickStatus });
      }
      await HypixelSkyblockBazaarModel.shortTerm.insertMany(persistableData);

      // Checks wether the last ingestion on the long term collection was over an hour ago
      if (!(await redis.exists("Hypixel:lastSkyblockBazaarLongTermIngestion"))) {
        await HypixelSkyblockBazaarModel.longTerm.insertMany(persistableData);
        await redis.setex("Hypixel:lastSkyblockBazaarLongTermIngestion", 3595, "");
      }
    }
    return { data: formattedData, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Skyblock Bazaar", "warn");
    return { error: "Unkown", cached: null };
  }
};

export const getSkyblockItems = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockItems")) return { data: await getCache("Hypixel:Cache:skyblockItems"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/skyblock/items")).data.items;
    log("Hypixel", "Fetched Skyblock Items", "info");
    const formattedData = formatSkyblockItems(data);
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockItems", 1800, JSON.stringify(formattedData));
    return { data: formattedData, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getSkyblockElection = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockElection")) return { data: await getCache("Hypixel:Cache:skyblockElection"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/skyblock/election")).data;
    log("Hypixel", "Fetched Skyblock Election", "info");
    const formattedData = formatSkyblockElection(data);
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockElection", 600, JSON.stringify(formattedData));
    if (config.hypixel.persistHistoricalData) {
      if ((await HypixelSkyblockElectionModel.exists({ _id: formattedData.lastElection.year })) === null) {
        await HypixelSkyblockElectionModel.create({ _id: formattedData.lastElection.year, candidates: formattedData.lastElection.candidates, timestamp: Math.floor(Date.now() / 1000) }).catch(() => {});
      }
    }
    return { data: formattedData, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getSkyblockCollections = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockCollections")) return { data: await getCache("Hypixel:Cache:skyblockCollections"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/skyblock/collections")).data.collections;
    log("Hypixel", "Fetched Skyblock Collections", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockCollections", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getSkyblockSkills = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockSkills")) return { data: await getCache("Hypixel:Cache:skyblockSkills"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/skyblock/skills")).data.skills;
    log("Hypixel", "Fetched Skyblock Skills", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockSkills", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getGames = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:games")) return { data: await getCache("Hypixel:Cache:games"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/games")).data.games;
    log("Hypixel", "Fetched Games", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:games", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getAchievements = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:achievements")) return { data: await getCache("Hypixel:Cache:achievements"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/achievements")).data.achievements;
    log("Hypixel", "Fetched Achievements", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:achievements", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getChallenges = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:challenges")) return { data: await getCache("Hypixel:Cache:challenges"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/challenges")).data.challenges;
    log("Hypixel", "Fetched Challenges", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:challenges", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getQuests = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:quests")) return { data: await getCache("Hypixel:Cache:quests"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/quests")).data.quests;
    log("Hypixel", "Fetched Quests", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:quests", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getGuildAchievements = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:guildAchievements")) return { data: await getCache("Hypixel:Cache:guildAchievements"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/guilds/achievements")).data;
    log("Hypixel", "Fetched Guild Achievements", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:guildAchievements", 600, JSON.stringify({ one_time: data.one_time, tiered: data.tiered }));
    return { data: { normal: data.one_time, tiered: data.tiered }, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getPets = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:pets")) return { data: await getCache("Hypixel:Cache:pets"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/vanity/pets")).data.types;
    log("Hypixel", "Fetched Pets", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:pets", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};

export const getCompanions = async (): Promise<GetterResponse<any, "Unkown", boolean | null>> => {
  try {
    if (await checkCache("Hypixel:Cache:companions")) return { data: await getCache("Hypixel:Cache:companions"), cached: true };
    const data = (await HypixelAPI.get("https://api.hypixel.net/v2/resources/vanity/companions")).data.types;
    log("Hypixel", "Fetched Companions", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:companions", 600, JSON.stringify(data));
    return { data, cached: false };
  } catch (e) {
    Sentry.captureException(e);
    return { error: "Unkown", cached: null };
  }
};
