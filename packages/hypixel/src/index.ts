import axios from "axios";
import * as Sentry from "@sentry/node";
import log from "@pixelic/logger";
import { config, deepCompare } from "@pixelic/utils";
import { parseUUID } from "@pixelic/mojang";
import { requestHypixel } from "./requestHandler.js";
import redis from "@pixelic/redis";
import { formatPlayer, formatGuild, formatSkyblockActiveAuction, formatSkyblockEndedAuction, formatSkyblockItems, formatSkyblockElection, formatSkyblockBazaar } from "./formatters.js";
import { RequireOneObjParam } from "@pixelic/types";
import { HypixelGuildModel, HypixelHistoricalGuildModel, HypixelHistoricalPlayerModel, HypixelPlayerModel, HypixelSkyblockAuctionModel, HypixelSkyblockAuctionTrackingModel, HypixelSkyblockBazaarModel, HypixelSkyblockElectionModel } from "@pixelic/mongo";
import { calculateSkyblockAuctionPrices } from "./calcs.js";
import { requestTracker } from "@pixelic/interceptors";

axios.interceptors.response.use(requestTracker);

export const getPlayer = async (player: string) => {
  try {
    const UUID = await parseUUID(player);
    if (UUID === null) return "Invalid UUID or Username";
    if (config.hypixel.cache && (await redis.exists(`Hypixel:Cache:Players:${UUID}`))) return JSON.parse((await redis.get(`Hypixel:Cache:Players:${UUID}`)) as string);
    const data = await requestHypixel(`https://api.hypixel.net/player?uuid=${UUID}`);
    if (data.player === null) return "This player never played on Hypixel";
    const formattedData = await formatPlayer(data.player);
    if (config.hypixel.cache) await redis.setex(`Hypixel:Cache:Players:${UUID}`, 600, JSON.stringify(formattedData));
    if (config.hypixel.persistData) {
      const operation = await HypixelPlayerModel.updateOne({ _id: UUID }, { ...formattedData, timestamp: Math.floor(Date.now() / 1000) }, { upsert: true });
      if (config.hypixel.webhooks.newPlayerEvent.enabled && operation.upsertedId !== null) {
        axios
          .post(config.hypixel.webhooks.newPlayerEvent.URL, {
            username: "[Hypixel]",
            embeds: [
              {
                description: `
                \`•\` **Trigger**: \`Event.newPlayer\`

                \`•\` **Username**: \`${formattedData.username}\`
                \`•\` **UUID**: \`${UUID}\`
                \`•\` **Rank**: \`${formattedData.rank}\`
                \`•\` **Network Level**: \`${Number(formattedData.level.toFixed(2))}\`
                \`•\` **First Login**: \`${new Date((formattedData?.firstLogin || Math.floor(Date.now() / 1000)) * 1000).toUTCString()}\`
                `
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n"),
                footer: {
                  text: `Now storing ${(await HypixelPlayerModel.estimatedDocumentCount()).toLocaleString("en-US")} Players`,
                },
                thumbnail: {
                  url: `https://visage.surgeplay.com/bust/256/${UUID}`,
                },
                color: 12706241,
                timestamp: new Date().toISOString(),
              },
            ],
          })
          .catch(() => {});
      }
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
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGuild = async ({ player, ID, name }: RequireOneObjParam<{ player?: string; ID?: string; name?: string }>) => {
  try {
    var data;
    if (player) {
      const UUID = await parseUUID(player);
      if (UUID === null) return "Invalid UUID or Username";
      if (config.hypixel.cache && (await redis.exists(`Hypixel:Cache:Guilds:${UUID}`))) return JSON.parse((await redis.get(`Hypixel:Cache:Guilds:${await redis.get(`Hypixel:Cache:Guilds:${UUID}`)}`)) as string);
      data = await requestHypixel(`https://api.hypixel.net/guild?player=${UUID}`);
    }
    if (ID) {
      if (!/^[0-9a-fA-F]{24}$/.test(ID)) return "Invalid Guild ID";
      if (config.hypixel.cache && (await redis.exists(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`))) return JSON.parse((await redis.get(`Hypixel:Cache:Guilds:${ID.toLowerCase()}`)) as string);
      data = await requestHypixel(`https://api.hypixel.net/guild?id=${ID}`);
    }
    if (name) {
      if (!/^[a-zA-Z0-9_ ]{3,32}$/.test(name)) return "Invalid Guild Name";
      if (config.hypixel.cache && (await redis.exists(`Hypixel:Cache:Guilds:${name.toLowerCase()}`))) return JSON.parse((await redis.get(`Hypixel:Cache:Guilds:${await redis.get(`Hypixel:Cache:Guilds:${name.toLowerCase()}`)}`)) as string);
      data = await requestHypixel(`https://api.hypixel.net/guild?name=${name}`);
    }
    if (data.guild === null) return "This Guild does not exist";
    const formattedData = formatGuild(data.guild);
    if (config.hypixel.cache) {
      const pipeline = redis.pipeline();
      formattedData.members.forEach((member) => pipeline.setex(`Hypixel:Cache:Guilds:${member.UUID}`, 600, formattedData.ID));
      pipeline.setex(`Hypixel:Cache:Guilds:${formattedData.name.toLowerCase()}`, 600, formattedData.ID);
      pipeline.setex(`Hypixel:Cache:Guilds:${formattedData.ID}`, 600, JSON.stringify(formattedData));
      pipeline.exec();
    }
    if (config.hypixel.persistData) {
      const operation = await HypixelGuildModel.updateOne({ _id: formattedData.ID }, { ...formattedData, timestamp: Math.floor(Date.now() / 1000) }, { upsert: true });
      if (config.hypixel.webhooks.newGuildEvent.enabled && operation.upsertedId !== null) {
        axios
          .post(config.hypixel.webhooks.newGuildEvent.URL, {
            username: "[Hypixel]",
            embeds: [
              {
                description: `
                \`•\` **Trigger**: \`Event.newGuild\`
                
                \`•\` **Name [Tag]**: \`${formattedData.name}${formattedData.tag !== null ? ` [${formattedData.tag}]` : ""}\`
                \`•\` **ID**: \`${formattedData.ID}\`
                \`•\` **Level**: \`${Number(formattedData.level.toFixed(2))}\`
                \`•\` **Members**: \`${formattedData.memberCount}\`
                \`•\` **Created**: \`${new Date((formattedData?.created || Math.floor(Date.now() / 1000)) * 1000).toUTCString()}\`
                `
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n"),
                footer: {
                  text: `Now storing ${(await HypixelGuildModel.estimatedDocumentCount()).toLocaleString("en-US")} Guilds`,
                },
                color: 12706241,
                timestamp: new Date().toISOString(),
              },
            ],
          })
          .catch(() => {});
      }
    }
    if (config.hypixel.persistHistoricalData) {
      if ((await HypixelHistoricalGuildModel.exists({ ID: formattedData.ID })) === null) {
        await HypixelHistoricalGuildModel.create(formattedData);
      } else {
        const lastDataPoint = await HypixelHistoricalGuildModel.findOne({
          ID: formattedData.ID,
        })
          .sort({ _id: -1 })
          .lean();
        const difference = deepCompare(lastDataPoint, formattedData);
        if (Object.keys(difference).length !== 0) {
          await HypixelHistoricalGuildModel.create(formattedData);
          await HypixelHistoricalGuildModel.replaceOne({ _id: lastDataPoint?._id }, { ID: formattedData.ID, ...difference });
        }
      }
    }
    return formattedData;
  } catch (e) {
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

    const firstPage = (await axios.get("https://api.hypixel.net/skyblock/auctions")).data;
    log("Hypixel", `Fetching Hypixel Skyblock Auctions (1/${firstPage.totalPages})`, "info");
    const pipeline = redis.pipeline();
    for (const auction of firstPage.auctions) {
      const formattedData = await formatSkyblockActiveAuction(auction);
      pipeline.sadd("Hypixel:Auctions:UUIDs", formattedData.UUID);
      pipeline.call("JSON.SET", `Hypixel:Auctions:${formattedData.UUID}`, "$", JSON.stringify(formattedData));
      UUIDs.push(formattedData.UUID);
    }
    pipeline.exec();

    for (var i = 1; i < firstPage.totalPages; i++) {
      const page = (await axios.get(`https://api.hypixel.net/skyblock/auctions?page=${i}`)).data;
      log("Hypixel", `Fetching Hypixel Skyblock Auctions (${i + 1}/${firstPage.totalPages})`, "info");
      const pipeline = redis.pipeline();
      for (const auction of page.auctions) {
        const formattedData = await formatSkyblockActiveAuction(auction);
        pipeline.sadd("Hypixel:Auctions:UUIDs", formattedData.UUID);
        pipeline.call("JSON.SET", `Hypixel:Auctions:${formattedData.UUID}`, "$", JSON.stringify(formattedData));
        UUIDs.push(formattedData.UUID);
      }
      pipeline.exec();
    }
    log("Hypixel", "Fetched all Hypixel Skyblock Auctions", "info");

    const removeInvalid = redis.pipeline();
    for (const UUID of UUIDsBefore.filter((UUID) => !UUIDs.includes(UUID))) {
      removeInvalid.srem("Hypixel:Auctions:UUIDs", UUID);
      removeInvalid.del(`Hypixel:Auctions:${UUID}`);
    }

    removeInvalid.exec();
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Hypixel Skyblock Auctions", "warn");
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
    const data = (await axios.get("https://api.hypixel.net/skyblock/auctions_ended")).data.auctions;
    log("Hypixel", "Fetched Hypixel Skyblock Ended Auctions", "info");
    for (const auction of data) {
      const formattedData = await formatSkyblockEndedAuction(auction);
      auctions.push(formattedData);

      if (config.hypixel.persistData) {
        await HypixelSkyblockAuctionModel.create({ timestamp: new Date(), meta: formattedData.seller, data: formattedData });
        await HypixelSkyblockAuctionTrackingModel.create({ _id: formattedData.UUID, price: formattedData.price, bin: formattedData.bin, itemID: formattedData.item.attributes.ID, timestamp: new Date(formattedData.timestamp * 1000) });
      }
      // Checks wether the last ingestion was over an hour ago
      if (!(await redis.exists("Hypixel:lastSkyblockAuctionhouseIngestion"))) {
        await calculateSkyblockAuctionPrices();
      }
    }
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockEndedAuctions", 55, JSON.stringify(auctions));
    return auctions;
  } catch (e) {
    Sentry.captureException(e);
    log("Hypixel", "Failed to fetch Hypixel Skyblock Ended Auctions", "warn");
    return null;
  }
};

export const getSkyblockBazaar = async ({ itemInfo }: { itemInfo?: boolean }) => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockBazaar"))) {
      return itemInfo ? await formatSkyblockBazaar(JSON.parse((await redis.get("Hypixel:Cache:skyblockBazaar")) as string), { itemInfo: true }) : await formatSkyblockBazaar(JSON.parse((await redis.get("Hypixel:Cache:skyblockBazaar")) as string), { itemInfo: false });
    }
    const data = (await axios.get("https://api.hypixel.net/skyblock/bazaar")).data.products;
    log("Hypixel", "Fetched Hypixel Skyblock Bazaar", "info");
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
    log("Hypixel", "Failed to fetch Hypixel Skyblock Bazaar", "warn");
    return null;
  }
};

export const getSkyblockItems = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockItems"))) return JSON.parse((await redis.get("Hypixel:Cache:skyblockItems")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/skyblock/items")).data.items;
    log("Hypixel", "Fetched Hypixel Skyblock Items", "info");
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
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockElection"))) return JSON.parse((await redis.get("Hypixel:Cache:skyblockElection")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/skyblock/election")).data;
    log("Hypixel", "Fetched Hypixel Skyblock Election", "info");
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
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockCollections"))) return JSON.parse((await redis.get("Hypixel:Cache:skyblockCollections")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/skyblock/collections")).data.collections;
    log("Hypixel", "Fetched Hypixel Skyblock Collections", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockCollections", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getSkyblockSkills = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:skyblockSkills"))) return JSON.parse((await redis.get("Hypixel:Cache:skyblockSkills")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/skyblock/skills")).data.skills;
    log("Hypixel", "Fetched Hypixel Skyblock Skills", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:skyblockSkills", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGames = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:games"))) return JSON.parse((await redis.get("Hypixel:Cache:games")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/games")).data.games;
    log("Hypixel", "Fetched Hypixel Games", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:games", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getAchievements = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:achievements"))) return JSON.parse((await redis.get("Hypixel:Cache:achievements")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/achievements")).data.achievements;
    log("Hypixel", "Fetched Hypixel Achievements", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:achievements", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getChallenges = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:challenges"))) return JSON.parse((await redis.get("Hypixel:Cache:challenges")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/challenges")).data.challenges;
    log("Hypixel", "Fetched Hypixel Challenges", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:challenges", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getQuests = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:quests"))) return JSON.parse((await redis.get("Hypixel:Cache:quests")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/quests")).data.quests;
    log("Hypixel", "Fetched Hypixel Quests", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:quests", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getGuildAchievements = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:guildAchievements"))) return JSON.parse((await redis.get("Hypixel:Cache:guildAchievements")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/guilds/achievements")).data;
    log("Hypixel", "Fetched Hypixel Guild Achievements", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:guildAchievements", 600, JSON.stringify({ one_time: data.one_time, tiered: data.tiered }));
    return { one_time: data.one_time, tiered: data.tiered };
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getPets = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:pets"))) return JSON.parse((await redis.get("Hypixel:Cache:pets")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/vanity/pets")).data.types;
    log("Hypixel", "Fetched Hypixel Pets", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:pets", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};

export const getCompanions = async () => {
  try {
    if (config.hypixel.cache && (await redis.exists("Hypixel:Cache:companions"))) return JSON.parse((await redis.get("Hypixel:Cache:companions")) as string);
    const data = (await axios.get("https://api.hypixel.net/resources/vanity/companions")).data.types;
    log("Hypixel", "Fetched Hypixel Companions", "info");
    if (config.hypixel.cache) await redis.setex("Hypixel:Cache:companions", 600, JSON.stringify(data));
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
};
