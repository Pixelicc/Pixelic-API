import { CronJob } from "cron";
import { config } from "@pixelic/utils";
import { getSkyblockActiveAuctions, getSkyblockBazaar, getSkyblockElection, getSkyblockEndedAuctions } from "@pixelic/hypixel";
import { getServerList } from "@pixelic/wynncraft";
import { pingServers } from "./SLPCollector.js";

new CronJob("* * * * *", () => {
  // Hypixel
  if (config.collector.hypixel.skyblock.endedAuctions) getSkyblockEndedAuctions();
  if (config.collector.hypixel.skyblock.bazaar) getSkyblockBazaar({ itemInfo: false });

  // Wynncraft
  if (config.collector.wynncraft.serverPlayercounts) getServerList({ UUIDs: false });
}).start();

new CronJob("30 * * * * *", () => {
  // Offset by 30s so Minecraft Server Latency can be measured more precisely
  if (config.collector.minecraft.serverPlayercounts) pingServers();
}).start();

new CronJob("*/5 * * * *", () => {
  // Hypixel
  if (config.collector.hypixel.skyblock.activeAuctions) getSkyblockActiveAuctions();
}).start();

new CronJob("0 * * * *", () => {
  // Hypixel
  if (config.collector.hypixel.skyblock.election) getSkyblockElection();
}).start();
