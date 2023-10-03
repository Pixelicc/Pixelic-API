import redis from "@pixelic/redis";
import { AxiosResponse } from "axios";

export const requestTracker = (res: AxiosResponse) => {
  try {
    const host = res.request.host;
    const path = res.request.path;

    if (host === "api.mojang.com") {
      redis.hincrby("Mojang:Stats", "totalRequests", 1);
      redis.hincrby("Mojang:Stats", "bytesReceived", Buffer.byteLength(JSON.stringify(res.data)));
    }
    if (host === "api.hypixel.net") {
      redis.hincrby("Hypixel:Stats", "totalRequests", 1);
      redis.hincrby("Hypixel:Stats", "bytesReceived", Buffer.byteLength(JSON.stringify(res.data)));
    }
    if (host === "api.wynncraft.com") {
      redis.hincrby("Wynncraft:Stats", "totalRequests", 1);
      redis.hincrby("Wynncraft:Stats", "bytesReceived", Buffer.byteLength(JSON.stringify(res.data)));
    }
    if (host === "discord.com" && path.includes("/api")) {
      redis.hincrby("Discord:Stats", "totalRequests", 1);
      redis.hincrby("Discord:Stats", "bytesReceived", Buffer.byteLength(JSON.stringify(res.data)));
    }
  } catch {}
  return res;
};
