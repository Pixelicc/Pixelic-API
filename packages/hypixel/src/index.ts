import { parseUUID } from "@packages/mojang";
import { requestHypixel } from "./requestHandler.js";
import { formatPlayer } from "./formatters.js";

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
