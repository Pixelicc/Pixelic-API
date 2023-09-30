import { CronJob } from "cron";
import { getSkyblockActiveAuctions, getSkyblockBazaar, getSkyblockElection, getSkyblockEndedAuctions } from "@pixelic/hypixel";

new CronJob("* * * * *", () => {
  getSkyblockEndedAuctions();
  getSkyblockBazaar({ itemInfo: false });
}).start();

new CronJob("*/5 * * * *", () => {
  getSkyblockActiveAuctions();
}).start();

new CronJob("0 * * * *", () => {
  getSkyblockElection();
}).start();
