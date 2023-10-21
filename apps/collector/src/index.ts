import { CronJob } from "cron";
import * as Sentry from "@sentry/node";
import { config } from "@pixelic/utils";
import { getSkyblockActiveAuctions, getSkyblockBazaar, getSkyblockElection, getSkyblockEndedAuctions } from "@pixelic/hypixel";
import { getServerList } from "@pixelic/wynncraft";
import { pingServers } from "./SLPCollector.js";

Sentry.init({
  dsn: config.collector.sentry.dsn,
  tracesSampleRate: config.collector.sentry.tracesSampleRate,
  normalizeDepth: 3,
  environment: config.environment,
});

new CronJob("* * * * *", () => {
  // Hypixel
  if (config.collector.hypixel.skyblock.endedAuctions) getSkyblockEndedAuctions().catch((e) => Sentry.captureException(e));
  if (config.collector.hypixel.skyblock.bazaar) getSkyblockBazaar({ itemInfo: false }).catch((e) => Sentry.captureException(e));

  // Wynncraft
  if (config.collector.wynncraft.serverPlayercounts) getServerList({ UUIDs: false }).catch((e) => Sentry.captureException(e));
}).start();

new CronJob("30 * * * * *", () => {
  // Offset by 30s so Minecraft Server Latency can be measured more precisely
  if (config.collector.minecraft.serverPlayercounts) pingServers().catch((e) => Sentry.captureException(e));
}).start();

new CronJob("*/5 * * * *", () => {
  // Hypixel
  if (config.collector.hypixel.skyblock.activeAuctions) getSkyblockActiveAuctions().catch((e) => Sentry.captureException(e));
}).start();

new CronJob("0 * * * *", () => {
  // Hypixel
  if (config.collector.hypixel.skyblock.election) getSkyblockElection().catch((e) => Sentry.captureException(e));
}).start();
