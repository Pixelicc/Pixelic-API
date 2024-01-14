import * as Sentry from "@sentry/node";
import { config } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { getServerList, getPlayer } from "@pixelic/wynncraft";

export default {
  collect: async () => {
    if (config.collector.wynncraft.serverPlayercounts) {
      try {
        const serverList = await getServerList({ UUIDs: true });

        if (!serverList) return;

        for (const server of Object.values(serverList.data.servers as { [key: string]: { playercount: number; players: { username: string; UUID: string }[] } })) {
          for (const player of server.players) {
            /**
             * Checks the Wynncraft Stats of online players once per day to provide historical stats
             * Should only result in ~5-10 requests per minute after the inital start
             */
            if (!player.UUID) continue;
            if (!(await redis.exists(`Wynncraft:Tracked:${player.UUID}`))) {
              await getPlayer(player.UUID)
                .then(async () => {
                  await redis.setex(`Wynncraft:Tracked:${player.UUID}`, 86400 - (Math.floor(Date.now() / 1000) % 86400), "");
                })
                .catch(() => {});
            }
          }
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    }
  },
};
