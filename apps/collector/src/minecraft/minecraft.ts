import Sentry from "@sentry/node";
import { MinecraftServerPlayercountModel } from "@pixelic/mongo";
import redis from "@pixelic/redis";
import { sendSLP } from "@pixelic/utils";

import servers from "./servers.js";

export default {
  collect: async () => {
    try {
      const persistableData = [];
      for (const server of servers) {
        const SLPData = await sendSLP(server.host, 25565);

        if (SLPData !== null && SLPData?.latency) {
          await redis.set(`Minecraft:Servers:${server.ID}`, JSON.stringify(SLPData)).catch(() => {});
          persistableData.push({ timestamp: new Date(), meta: server.ID, data: { playercount: SLPData.players.online, latency: SLPData.latency } });
        }
      }
      await MinecraftServerPlayercountModel.shortTerm.insertMany(persistableData);

      // Checks wether the last ingestion on the long term collection was over an hour ago
      if (!(await redis.exists("Minecraft:lastServerPlayercountLongTermIngestion"))) {
        await MinecraftServerPlayercountModel.longTerm.insertMany(persistableData);
        await redis.setex("Minecraft:lastServerPlayercountLongTermIngestion", 3595, "");
      }
    } catch (e) {
      Sentry.captureException(e);
    }
  },
};
