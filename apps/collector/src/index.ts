import { CronJob } from "cron";
import { getSkyblockActiveAuctions, getSkyblockBazaar, getSkyblockElection, getSkyblockEndedAuctions } from "@pixelic/hypixel";
import { getServerList } from "@pixelic/wynncraft";

new CronJob("* * * * *", () => {
  getSkyblockEndedAuctions();
  getSkyblockBazaar({ itemInfo: false });
  getServerList({ UUIDs: false });
}).start();

new CronJob("*/5 * * * *", () => {
  getSkyblockActiveAuctions();
}).start();

new CronJob("0 * * * *", () => {
  getSkyblockElection();
}).start();
