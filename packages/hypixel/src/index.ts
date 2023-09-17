import { parseUUID } from "@pixelic/mojang";
import { requestHypixel } from "./requestHandler.js";
import { formatPlayer, formatGuild } from "./formatters.js";

export const getPlayer = async (player: string) => {
  const UUID = await parseUUID(player);
  if (UUID === null) return "Invalid UUID or Username";
  try {
    const data = await requestHypixel(`https://api.hypixel.net/player?uuid=${UUID}`);
    if (data.player === null) return "This player never played on Hypixel";
    return formatPlayer(data.player);
  } catch {
    return null;
  }
};

export const getGuild = async ({ player, ID, name }: { player?: string; ID?: string; name?: string }) => {
  if (player) {
    const UUID = await parseUUID(player);
    if (UUID === null) return "Invalid UUID or Username";
    try {
      const data = await requestHypixel(`https://api.hypixel.net/guild?player=${UUID}`);
      if (data.guild === null) return "This player is not in a Guild";
      return formatGuild(data.guild);
    } catch {
      return null;
    }
  }
  if (ID) {
    if (!/^[0-9a-fA-F]{24}$/.test(ID)) return "Invalid Guild ID";
    try {
      const data = await requestHypixel(`https://api.hypixel.net/guild?id=${ID}`);
      if (data.guild === null) return "This Guild does not exist";
      return formatGuild(data.guild);
    } catch {
      return null;
    }
  }
  if (name) {
    if (!/^[a-zA-Z0-9_]{2,32}$/.test(name)) return "Invalid Guild Name";
    try {
      const data = await requestHypixel(`https://api.hypixel.net/guild?name=${name}`);
      if (data.guild === null) return "This Guild does not exist";
      return formatGuild(data.guild);
    } catch {
      return null;
    }
  }
  return null;
};
