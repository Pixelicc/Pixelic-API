import { MinecraftServerPlayercountModel } from "@pixelic/mongo";
import redis from "@pixelic/redis";
import { sendSLP } from "@pixelic/utils";

export const pingServers = async () => {
  try {
    const serverList: { UUID: string; name: string; host: string; port: string }[] = JSON.parse((await redis.call("JSON.GET", "Minecraft:serverList", "$")) as string)[0];

    const persistableData = [];
    for (const server of serverList) {
      const SLPData = await sendSLP(server.host, server.port);
      if (SLPData !== null) {
        persistableData.push({ timestamp: new Date(), meta: server.UUID, data: { playercount: SLPData.players.online, latency: SLPData.latency } });
      }
    }
    await MinecraftServerPlayercountModel.shortTerm.insertMany(persistableData);

    // Checks wether the last ingestion on the long term collection was over an hour ago
    if (!(await redis.exists("Minecraft:lastServerPlayercountLongTermIngestion"))) {
      await MinecraftServerPlayercountModel.longTerm.insertMany(persistableData);
      await redis.setex("Minecraft:lastServerPlayercountLongTermIngestion", 3595, "");
    }
  } catch {}
};
