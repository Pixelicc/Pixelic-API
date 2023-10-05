import { CronJob } from "cron";
import { getSkyblockActiveAuctions, getSkyblockBazaar, getSkyblockElection, getSkyblockEndedAuctions } from "@pixelic/hypixel";
import { getServerList } from "@pixelic/wynncraft";
import { pingServers } from "./SLPCollector.js";

new CronJob("* * * * *", () => {
  // Hypixel
  getSkyblockEndedAuctions();
  getSkyblockBazaar({ itemInfo: false });

  // Wynncraft
  getServerList({ UUIDs: false });
}).start();

new CronJob("30 * * * * *", () => {
  // Offset by 30s so Minecraft Server Latency can be measured more precisely
  pingServers();
}).start();

new CronJob("*/5 * * * *", () => {
  // Hypixel
  getSkyblockActiveAuctions();
}).start();

new CronJob("0 * * * *", () => {
  // Hypixel
  getSkyblockElection();
}).start();
