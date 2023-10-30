import * as Sentry from "@sentry/node";
import { CronJob } from "cron";
import { config } from "@pixelic/utils";
import hypixel from "./hypixel.js";
import wynncraft from "./wynncraft.js";
import minecraft from "./minecraft/minecraft.js";

Sentry.init({
  dsn: config.sentry.dsn,
  integrations: [
    new Sentry.Integrations.Mongo({
      useMongoose: true,
    }),
  ],
  tracesSampleRate: config.sentry.tracesSampleRate,
  normalizeDepth: 3,
  environment: config.environment,
});

Sentry.setTag("App", "Collector");

new CronJob("30 * * * * *", () => {
  minecraft.collect();
}).start();

new CronJob("5 * * * * *", () => {
  hypixel.collect();
  wynncraft.collect();
}).start();

new CronJob("5 */5 * * * *", () => {
  hypixel.collectSkyblockActiveAuctions();
}).start();

new CronJob("5 0 * * * *", () => {
  hypixel.collectSkyblockElection();
}).start();
