import * as Sentry from "@sentry/node";
import log from "@pixelic/logger";
import { config, deepCompare } from "@pixelic/utils";
import { parseUUID } from "@pixelic/mojang";
import redis from "@pixelic/redis";
import { formatPlayer, formatGuild, formatSkyblockActiveAuction, formatSkyblockEndedAuction, formatSkyblockItems, formatSkyblockElection, formatSkyblockBazaar } from "./formatters.js";
import { RequireOneObjParam } from "@pixelic/types";
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

export const getPlayer = async (player: string) => {
  const UUID = await parseUUID(player);
  if (UUID === null) return "Invalid UUID or Username";
  try {
    if (await checkCache(`Hypixel:Cache:Players:${UUID}`)) return await getCache(`Hypixel:Cache:Players:${UUID}`);
    return await Limiter.schedule(async () => {
      if (await checkCache(`Hypixel:Cache:Players:${UUID}`)) return await getCache(`Hypixel:Cache:Players:${UUID}`, { raceCondition: true });
      return await HypixelAPI.get("/player", { params: { uuid: UUID } })
        .then(async (res) => {
          log("Hypixel", `Fetched Player (${UUID})`, "info");
          if (res.data.player === null) return "This player never played on Hypixel";
          const formattedData = await formatPlayer(res.data.player);
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Players:${UUID}`, 600, JSON.stringify(formattedData));
          if (config.hypixel.persistData) {
            await HypixelPlayerModel.updateOne({ _id: UUID }, { ...formattedData, timestamp: Math.floor(Date.now() / 1000) }, { upsert: true });
          }
          if (config.hypixel.persistHistoricalData) {
            if ((await HypixelHistoricalPlayerModel.exists({ UUID: UUID })) === null) {
              await HypixelHistoricalPlayerModel.create(formattedData);
            } else {
              const lastDataPoint = await HypixelHistoricalPlayerModel.findOne({
                UUID: UUID,
              })
                .sort({ _id: -1 })
                .lean();
              const difference = deepCompare(lastDataPoint, formattedData);
              if (Object.keys(difference).length !== 0) {
                await HypixelHistoricalPlayerModel.create(formattedData);
                await HypixelHistoricalPlayerModel.replaceOne({ _id: lastDataPoint?._id }, { UUID: UUID, ...difference });
              }
            }
          }
          return formattedData;
        })
        .catch(async () => {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Players:${UUID}`, 300, JSON.stringify(null));
          return null;
        });
    });
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGuild = async ({ player, ID, name }: RequireOneObjParam<{ player?: string; ID?: string; name?: string }>) => {
  try {
    var data: any;
    if (player) {
      const UUID = await parseUUID(player);
      if (UUID === null) return "Invalid UUID or Username";
      if (await checkCache(`Hypixel:Cache:Guilds:${UUID}`)) {
        if ((await getCache(`Hypixel:Cache:Guilds:${UUID}`)) === null) return null;
        return await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${UUID}`)}`);
      }
      await Limiter.schedule(async () => {
        if (await checkCache(`Hypixel:Cache:Guilds:${UUID}`)) {
          if ((await getCache(`Hypixel:Cache:Guilds:${UUID}`)) === null) return null;
          return await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${UUID}`)}`, { raceCondition: true });
        }
        try {
          data = (await HypixelAPI.get("/guild", { params: { player: UUID } })).data;
        } catch {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Guilds:${UUID}`, 300, JSON.stringify(null));
          return null;
        }
      });
      log("Hypixel", `Fetched Guild (${UUID})`, "info");
    }
    if (ID) {
      if (!/^[0-9a-fA-F]{24}$/.test(ID)) return "Invalid Guild ID";
      if (await checkCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`)) return await getCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`);
      await Limiter.schedule(async () => {
        if (await checkCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`)) return await getCache(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`, { raceCondition: true });
        try {
          data = (await HypixelAPI.get("/guild", { params: { id: ID } })).data;
        } catch {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Guilds:${ID}`, 300, JSON.stringify(null));
          return null;
        }
      });
      log("Hypixel", `Fetched Guild (${ID})`, "info");
    }
    if (name) {
      if (!/^[a-zA-Z0-9_ ]{3,32}$/.test(name)) return "Invalid Guild Name";
      if (await checkCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) {
        if ((await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) === null) return null;
        return await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)}`);
      }
      await Limiter.schedule(async () => {
        if (await checkCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) {
          if ((await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)) === null) return null;
          return await getCache(`Hypixel:Cache:Guilds:${await getCache(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)}`, { raceCondition: true });
        }
        try {
          data = (await HypixelAPI.get("/guild", { params: { name } })).data;
        } catch {
          if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Guilds:${name.toLowerCase()}`, 300, JSON.stringify(null));
          return null;
        }
      });
      log("Hypixel", `Fetched Guild (${name})`, "info");
    }
    if (data.guild === null) return "This Guild does not exist";
    const formattedData = formatGuild(data.guild);
    if (config.hypixel.cache) {
      const pipeline = redis.pipeline();
      formattedData.members.forEach((member) => pipeline.setex(`Hypixel:Cache:Guilds:${member.UUID}`, 600, JSON.stringify(formattedData.ID)));
      pipeline.setex(`Hypixel:Cache:Guilds:${formattedData.name.toLowerCase()}`, 600, JSON.stringify(formattedData.ID));
      pipeline.setex(`Hypixel:Cache:Guilds:${formattedData.ID}`, 600, JSON.stringify(formattedData));
      pipeline.exec();
    }
    if (config.hypixel.persistData) {
      await HypixelGuildModel.updateOne({ _id: formattedData.ID }, { ...formattedData, timestamp: Math.floor(Date.now() / 1000) }, { upsert: true });
    }
    if (config.hypixel.persistHistoricalData) {
      const members: any = {};
      formattedData.members.forEach((member) => {
        const { UUID, ...rest } = member;
        members[UUID] = rest;
      });
      if ((await HypixelHistoricalGuildModel.exists({ ID: formattedData.ID })) === null) {
        await HypixelHistoricalGuildModel.create({ ...formattedData, members });
      } else {
        const lastDataPoint = await HypixelHistoricalGuildModel.findOne({
          ID: formattedData.ID,
        })
          .sort({ _id: -1 })
          .lean();
        const difference = deepCompare(lastDataPoint, { ...formattedData, members });
        if (Object.keys(difference).length !== 0) {
          await HypixelHistoricalGuildModel.create({ ...formattedData, members });
          await HypixelHistoricalGuildModel.replaceOne({ _id: lastDataPoint?._id }, { ID: formattedData.ID, ...difference });
        }
      }
    }
    return formattedData;
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return null;
  }
};

/**
 * To get and query active auctions use the `queryActiveAuctions` function in combination with this function
 *
 * This is a very resource heavy function and should be used appropriately
 */
export const getSkyblockActiveAuctions = async (): Promise<void> => {
  try {
    const UUIDs: string[] = [];
    const UUIDsBefore = await redis.smembers("Hypixel:Auctions:UUIDs");

    const firstPage = (await HypixelAPI.get("https://api.hypixel.net/skyblock/auctions")).data;
    log("Hypixel", `Fetching Skyblock Auctions (1/${firstPage.totalPages})`, "info");
    const pipeline = redis.pipeline();
    for (const auction of firstPage.auctions) {
      const formattedData = await formatSkyblockActiveAuction(auction);
      pipeline.sadd("Hypixel:Auctions:UUIDs", formattedData.UUID);
      pipeline.call("JSON.SET", `Hypixel:Auctions:${formattedData.UUID}`, "$", JSON.stringify(formattedData));
      UUIDs.push(formattedData.UUID);
    }
    pipeline.exec();

    for (var i = 1; i < firstPage.totalPages; i++) {
      const page = (await HypixelAPI.get(`https://api.hypixel.net/skyblock/auctions?page=${i}`)).data;
      log("Hypixel", `Fetching Skyblock Auctions (${i + 1}/${firstPage.totalPages})`, "info");
      const pipeline = redis.pipeline();
      for (const auction of page.auctions) {
        const formattedData = await formatSkyblockActiveAuction(auction);
        pipeline.sadd("Hypixel:Auctions:UUIDs", formattedData.UUID);
        pipeline.call("JSON.SET", `Hypixel:Auctions:${formattedData.UUID}`, "$", JSON.stringify(formattedData));
        UUIDs.push(formattedData.UUID);
      }
      pipeline.exec();
    }
    log("Hypixel", "Fetched all Skyblock Auctions", "info");

    const removeInvalid = redis.pipeline();
    for (const UUID of UUIDsBefore.filter((UUID) => !UUIDs.includes(UUID))) {
      removeInvalid.srem("Hypixel:Auctions:UUIDs", UUID);
      removeInvalid.del(`Hypixel:Auctions:${UUID}`);
    }

    removeInvalid.exec();
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Skyblock Auctions", "warn");
  }
};

export const querySkyblockActiveAuctions = async (query: string, limit?: number) => {
  try {
    const result: any = await redis.call("FT.SEARCH", "Hypixel.Skyblock.Auction", query, "LIMIT", "0", limit ? String(limit) : "1000");
    const parsedMatches = [];

    for (var i = 2; i < result.length; i += 2) {
      parsedMatches.push(JSON.parse(result[i][1]));
    }

    return {
      count: result[0],
      matches: parsedMatches,
    };
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getSkyblockEndedAuctions = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockEndedAuctions"))) return JSON.parse((await redis.get("Hypixel:Cache:skyblockEndedAuctions")) as string);
    const auctions: any[] = [];
    const data = (await HypixelAPI.get("https://api.hypixel.net/skyblock/auctions_ended")).data.auctions;
    log("Hypixel", "Fetched Skyblock Ended Auctions", "info");
    for (const auction of data) {
      const formattedData = await formatSkyblockEndedAuction(auction);
      auctions.push(formattedData);
      if (config.hypixel.persistHistoricalData && (await redis.get("Hypixel:Cache:skyblockEndedAuctionsLastState")) !== JSON.stringify(data)) {
        await HypixelSkyblockAuctionModel.create({ timestamp: new Date(), meta: formattedData.seller, data: formattedData });
        await HypixelSkyblockAuctionTrackingModel.create({ _id: formattedData.UUID, price: formattedData.price, bin: formattedData.bin, itemID: formattedData.item.attributes.ID, timestamp: new Date(formattedData.timestamp * 1000) });

        // Checks wether the last ingestion was over an hour ago
        if (!(await redis.exists("Hypixel:lastSkyblockAuctionhouseIngestion"))) {
          await calculateSkyblockAuctionPrices();
        }
      }
    }
    await redis.set("Hypixel:Cache:skyblockEndedAuctionsLastState", JSON.stringify(data));
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockEndedAuctions", 55, JSON.stringify(auctions));
    return auctions;
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Skyblock Ended Auctions", "warn");
    return null;
  }
};

export const getSkyblockBazaar = async ({ itemInfo }: { itemInfo?: boolean }) => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockBazaar")) {
      return itemInfo ? await formatSkyblockBazaar(await getCache("Hypixel:Cache:skyblockBazaar"), { itemInfo: true }) : await formatSkyblockBazaar(await getCache("Hypixel:Cache:skyblockBazaar"), { itemInfo: false });
    }
    const data = (await HypixelAPI.get("https://api.hypixel.net/skyblock/bazaar")).data.products;
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
    return formattedData;
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Skyblock Bazaar", "warn");
    return null;
  }
};

export const getSkyblockItems = async () => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockItems")) return await getCache("Hypixel:Cache:skyblockItems");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/skyblock/items")).data.items;
    log("Hypixel", "Fetched Skyblock Items", "info");
    const formattedData = formatSkyblockItems(data);
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockItems", 1800, JSON.stringify(formattedData));
    return formattedData;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getSkyblockElection = async () => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockElection")) return await getCache("Hypixel:Cache:skyblockElection");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/skyblock/election")).data;
    log("Hypixel", "Fetched Skyblock Election", "info");
    const formattedData = formatSkyblockElection(data);
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockElection", 600, JSON.stringify(formattedData));
    if (config.hypixel.persistHistoricalData) {
      if ((await HypixelSkyblockElectionModel.exists({ _id: formattedData.lastElection.year })) === null) {
        await HypixelSkyblockElectionModel.create({ _id: formattedData.lastElection.year, candidates: formattedData.lastElection.candidates, timestamp: Math.floor(Date.now() / 1000) }).catch(() => {});
      }
    }
    return formattedData;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getSkyblockCollections = async () => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockCollections")) return await getCache("Hypixel:Cache:skyblockCollections");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/skyblock/collections")).data.collections;
    log("Hypixel", "Fetched Skyblock Collections", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockCollections", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getSkyblockSkills = async () => {
  try {
    if (await checkCache("Hypixel:Cache:skyblockSkills")) return await getCache("Hypixel:Cache:skyblockSkills");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/skyblock/skills")).data.skills;
    log("Hypixel", "Fetched Skyblock Skills", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockSkills", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGames = async () => {
  try {
    if (await checkCache("Hypixel:Cache:games")) return await getCache("Hypixel:Cache:games");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/games")).data.games;
    log("Hypixel", "Fetched Games", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:games", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getAchievements = async () => {
  try {
    if (await checkCache("Hypixel:Cache:achievements")) return await getCache("Hypixel:Cache:achievements");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/achievements")).data.achievements;
    log("Hypixel", "Fetched Achievements", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:achievements", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getChallenges = async () => {
  try {
    if (await checkCache("Hypixel:Cache:challenges")) return await getCache("Hypixel:Cache:challenges");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/challenges")).data.challenges;
    log("Hypixel", "Fetched Challenges", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:challenges", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getQuests = async () => {
  try {
    if (await checkCache("Hypixel:Cache:quests")) return await getCache("Hypixel:Cache:quests");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/quests")).data.quests;
    log("Hypixel", "Fetched Quests", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:quests", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGuildAchievements = async () => {
  try {
    if (await checkCache("Hypixel:Cache:guildAchievements")) return await getCache("Hypixel:Cache:guildAchievements");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/guilds/achievements")).data;
    log("Hypixel", "Fetched Guild Achievements", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:guildAchievements", 600, JSON.stringify({ one_time: data.one_time, tiered: data.tiered }));
    return { one_time: data.one_time, tiered: data.tiered };
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getPets = async () => {
  try {
    if (await checkCache("Hypixel:Cache:pets")) return await getCache("Hypixel:Cache:pets");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/vanity/pets")).data.types;
    log("Hypixel", "Fetched Pets", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:pets", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getCompanions = async () => {
  try {
    if (await checkCache("Hypixel:Cache:companions")) return await getCache("Hypixel:Cache:companions");
    const data = (await HypixelAPI.get("https://api.hypixel.net/resources/vanity/companions")).data.types;
    log("Hypixel", "Fetched Companions", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:companions", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};
