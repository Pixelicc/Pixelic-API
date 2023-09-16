import { parseUUID } from "@packages/mojang";
import { requestWynncraft } from "./requestHandler.js";
import { formatGuild, formatPlayer, formatServerList, formatTerritoryList } from "./formatters.js";
import { dashUUID } from "@packages/utils";

export const getPlayer = async (player: string) => {
  const UUID = await parseUUID(player);
  if (UUID === null) return "Invalid UUID or Username";
  try {
    const data = await requestWynncraft(`https://api.wynncraft.com/v2/player/${dashUUID(UUID)}/stats`);
    if (data.data.length === 0) return "This player never played on Wynncraft";
    return formatPlayer(data.data[0]);
  } catch {
    return null;
  }
};

export const getGuild = async (guild: string) => {
  try {
    const data = await requestWynncraft(`https://api.wynncraft.com/public_api.php?action=guildStats&command=${guild}`);
    if (data.error) return "This Guild does not exist";
    return formatGuild(data);
  } catch {
    return null;
  }
};

export const getGuildList = async (): Promise<string[] | null> => {
  try {
    const data = await requestWynncraft("https://api.wynncraft.com/public_api.php?action=guildList");
    if (data.error) return null;
    return data.guilds;
  } catch {
    return null;
  }
};

export const getServerList = async () => {
  try {
    const data = await requestWynncraft("https://api.wynncraft.com/public_api.php?action=onlinePlayers");
    if (data.error) return null;
    return formatServerList(data);
  } catch {
    return null;
  }
};

export const getTerritoryList = async () => {
  try {
    const data = await requestWynncraft("https://api.wynncraft.com/public_api.php?action=territoryList");
    if (data.error) return null;
    return formatTerritoryList(data.territories);
  } catch {
    return null;
  }
};
