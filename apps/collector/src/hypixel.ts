import * as Sentry from "@sentry/node";
import { config } from "@pixelic/utils";
import { getSkyblockActiveAuctions, getSkyblockEndedAuctions, getSkyblockBazaar, getSkyblockElection } from "@pixelic/hypixel";

export default {
  collect: () => {
    if (config.collector.hypixel.skyblock.endedAuctions) getSkyblockEndedAuctions().catch((e) => Sentry.captureException(e));
    if (config.collector.hypixel.skyblock.bazaar) getSkyblockBazaar({ itemInfo: false }).catch((e) => Sentry.captureException(e));
  },
  collectSkyblockActiveAuctions: () => {
    if (config.collector.hypixel.skyblock.activeAuctions) getSkyblockActiveAuctions().catch((e) => Sentry.captureException(e));
  },
  collectSkyblockElection: () => {
    if (config.collector.hypixel.skyblock.election) getSkyblockElection().catch((e) => Sentry.captureException(e));
  },
};
