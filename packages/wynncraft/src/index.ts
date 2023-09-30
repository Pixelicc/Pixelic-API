import { parseUUID } from "@pixelic/mojang";
import { requestWynncraft } from "./requestHandler.js";
import { formatGuild, formatPlayer, formatServerList, formatTerritoryList } from "./formatters.js";
import { config, dashUUID, deepCompare } from "@pixelic/utils";
import redis from "@pixelic/redis";
import axios from "axios";
import { WynncraftPlayerModel, WynncraftHistoricalPlayerModel, WynncraftGuildModel } from "@pixelic/mongo";

export const getPlayer = async (player: string) => {
  const UUID = await parseUUID(player);
  if (UUID === null) return "Invalid UUID or Username";
  try {
    if (config.wynncraft.cache && (await redis.exists(`Wynncraft:Cache:Players:${UUID}`))) return JSON.parse((await redis.get(`Wynncraft:Cache:Players:${UUID}`)) as string);
    const data = await requestWynncraft(`https://api.wynncraft.com/v2/player/${dashUUID(UUID)}/stats`);
    if (data.data.length === 0) return "This player never played on Wynncraft";
    const formattedData = formatPlayer(data.data[0]);
    if (config.wynncraft.cache) await redis.setex(`Wynncraft:Cache:Players:${UUID}`, 300, JSON.stringify(formattedData));
    if (config.wynncraft.persistData) {
      const operation = await WynncraftPlayerModel.updateOne({ _id: UUID }, { ...formattedData, timestamp: Math.floor(Date.now() / 1000) }, { upsert: true });
      if (config.wynncraft.webhooks.newPlayerEvent.enabled && operation.upsertedId !== null) {
        axios
          .post(config.wynncraft.webhooks.newPlayerEvent.URL, {
            username: "[Wynncraft]",
            embeds: [
              {
                description: `
                \`•\` **Trigger**: \`Event.newPlayer\`

                \`•\` **Username**: \`${formattedData.username}\`
                \`•\` **UUID**: \`${UUID}\`
                \`•\` **Rank**: \`${formattedData.rank}\`
                \`•\` **Purchased Rank**: \`${formattedData.purchasedRank}\`
                \`•\` **Playtime**: \`${Math.floor(formattedData.playtime / 60)}h\`
                `
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n"),
                footer: {
                  text: `Now storing ${(await WynncraftPlayerModel.estimatedDocumentCount()).toLocaleString("en-US")} Players`,
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
    if (config.wynncraft.persistHistoricalData) {
      if ((await WynncraftHistoricalPlayerModel.exists({ UUID: UUID })) === null) {
        await WynncraftHistoricalPlayerModel.create(formattedData);
      } else {
        const lastDataPoint = await WynncraftHistoricalPlayerModel.findOne({
          UUID: UUID,
        })
          .sort({ _id: -1 })
          .lean();
        const difference = deepCompare(lastDataPoint, { playtime: formattedData.playtime, global: formattedData.global, characters: formattedData.characters });
        if (Object.keys(difference).length !== 0) {
          await WynncraftHistoricalPlayerModel.create({ UUID: UUID, playtime: formattedData.playtime, global: formattedData.global, characters: formattedData.characters });
          await WynncraftHistoricalPlayerModel.replaceOne({ _id: lastDataPoint?._id }, { UUID: UUID, ...difference });
        }
      }
    }
    return formattedData;
  } catch {
    return null;
  }
};

export const getGuild = async (guild: string) => {
  try {
    if (config.wynncraft.cache && (await redis.exists(`Wynncraft:Cache:Guilds:${guild.toLowerCase()}`))) return JSON.parse((await redis.get(`Wynncraft:Cache:Guilds:${guild.toLowerCase()}`)) as string);
    const data = await requestWynncraft(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${guild}`);
    if (data.error) return "This Guild does not exist";
    const formattedData = formatGuild(data);
    if (config.wynncraft.cache) await redis.setex(`Wynncraft:Cache:Guilds:${guild.toLowerCase()}`, 300, JSON.stringify(formattedData));
    if (config.wynncraft.persistData) await WynncraftGuildModel.updateOne({ _id: formattedData.name.toLowerCase() }, { ...formattedData, timestamp: Math.floor(Date.now() / 1000) }, { upsert: true });
    return formattedData;
  } catch {
    return null;
  }
};

export const getGuildList = async () => {
  try {
    if (config.wynncraft.cache && (await redis.exists("Wynncraft:Cache:guildList"))) return JSON.parse((await redis.get("Wynncraft:Cache:guildList")) as string);
    const data = await requestWynncraft("https://api.wynncraft.com/public_api.php?action=guildList");
    if (data.error) return null;
    if (config.wynncraft.cache) await redis.setex("Wynncraft:Cache:guildList", 300, JSON.stringify(data.guilds));
    return data.guilds;
  } catch {
    return null;
  }
};

export const getServerList = async () => {
  try {
    if (config.wynncraft.cache && (await redis.exists("Wynncraft:Cache:serverList"))) return JSON.parse((await redis.get("Wynncraft:Cache:serverList")) as string);
    const data = await requestWynncraft("https://api.wynncraft.com/public_api.php?action=onlinePlayers");
    if (data.error) return null;
    const formattedData = formatServerList(data);
    if (config.wynncraft.cache) await redis.setex("Wynncraft:Cache:serverList", 30, JSON.stringify(formattedData));
    return formattedData;
  } catch {
    return null;
  }
};

export const getTerritoryList = async () => {
  try {
    if (config.wynncraft.cache && (await redis.exists("Wynncraft:Cache:territoryList"))) return JSON.parse((await redis.get("Wynncraft:Cache:serverList")) as string);
    const data = await requestWynncraft("https://api.wynncraft.com/public_api.php?action=territoryList");
    if (data.error) return null;
    const formattedData = formatTerritoryList(data.territories);
    if (config.wynncraft.cache) await redis.setex("Wynncraft:Cache:territoryList", 300, JSON.stringify(formattedData));
    return formattedData;
  } catch {
    return null;
  }
};
