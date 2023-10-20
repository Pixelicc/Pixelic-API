import { Request, Response, NextFunction } from "express";
import { validateUUID, formatUUID, hashSHA512 } from "@pixelic/utils";
import log from "@pixelic/logger";
import * as Sentry from "@sentry/node";
import redis from "@pixelic/redis";
import { APIKeyModel } from "@pixelic/mongo";
import { DiscordSnowflake } from "@pixelic/types/src/discord.js";

const setRatelimitingHeaders = (res: Response, { timeframe, limit, requestsLastPeriod }: { timeframe: string | undefined; limit: number; requestsLastPeriod: number }) => {
  res.set("X-RateLimit-Limit", String(limit));
  res.set("X-RateLimit-Remaining", String(limit - requestsLastPeriod));
  if (timeframe === undefined) res.set("X-RateLimit-Reset", String(60 - new Date().getUTCSeconds()));
  if (timeframe === "5m") res.set("X-RateLimit-Reset", String(300 - (Math.floor(Date.now() / 1000) % 300)));
  if (timeframe === "1h") res.set("X-RateLimit-Reset", String(3600 - (new Date().getUTCMinutes() * 60 + new Date().getUTCSeconds())));
  if (timeframe === "1d") res.set("X-RateLimit-Reset", String(Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000)));
};

const addIPToHistory = async (user: string, IP: string | null | undefined) => {
  if (IP === null || IP === undefined || IP === "undefined") return;
  if ((await redis.zscore(`API:Users:IPs:${user}`, IP)) !== null) return;
  const length = await redis.zcard(`API:Users:IPs:${user}`);
  if (length > 99) {
    await redis.zremrangebyrank(`API:Users:IPs:${user}`, 0, length - 99);
  }
  await redis.zadd(`API:Users:IPs:${user}`, Math.floor(Date.now()), IP);
};

/**
 * Adds ratelimiting to a specific path/endpoint
 *
 * @param prefix Prefix to add to the ratelimiting attributes in Redis - Defaults to the standard ratelimiting naming scheme
 * @param timeframe Sets when the ratelimit will reset again - Defaults to 1m
 * @param limit Limits how many requests a user can send during the current period - Defaults to 60
 */
export const ratelimit = (prefix?: string, timeframe?: "5m" | "1h" | "1d", limit?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!validateUUID(formatUUID(String(req.headers["x-api-key"])))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });
      const hash = hashSHA512(formatUUID(String(req.headers["x-api-key"])));
      if (!(await redis.exists(`API:Users:Keys:${hash}`))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });

      const data = (await redis.hmget(`API:Users:Keys:${hash}`, "owner", prefix ? prefix + "Limit" : "limit", prefix ? prefix + "LastRequest" : "lastRequest", prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod")) as string[];
      const key: { owner: DiscordSnowflake; limit: number; lastRequest: number | string; requestsLastPeriod: number } = {
        owner: data[0],
        limit: Number(data[1]),
        lastRequest: Number(data[2]),
        requestsLastPeriod: Number(data[3]),
      };

      Sentry.setUser({ id: key.owner });

      if (data[1] === null) {
        key.limit = limit ? limit : 60;
        key.requestsLastPeriod = 0;
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "Limit" : "limit"}`, limit ? limit : 60);
      }

      if (timeframe === undefined && key.lastRequest != new Date().getUTCMinutes()) {
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "LastRequest" : "lastRequest"}`, new Date().getUTCMinutes());
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
        key.requestsLastPeriod = 0;
      }

      if (timeframe === "5m" && key.lastRequest != new Date(Math.floor(new Date().getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)).getUTCMinutes()) {
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "LastRequest" : "lastRequest"}`, new Date(Math.floor(new Date().getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)).getUTCMinutes());
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
        key.requestsLastPeriod = 0;
      }

      if (timeframe === "1h" && key.lastRequest != new Date().getUTCHours()) {
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "LastRequest" : "lastRequest"}`, new Date().getUTCHours());
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
        key.requestsLastPeriod = 0;
      }

      if (timeframe === "1d" && key.lastRequest != new Date().toISOString().slice(0, 10)) {
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "LastRequest" : "lastRequest"}`, JSON.stringify(new Date().toISOString().slice(0, 10)));
        await redis.hset(`API:Users:Keys:${hash}`, `${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
        key.requestsLastPeriod = 0;
      }

      if (Number(key.requestsLastPeriod) >= Number(key.limit)) {
        setRatelimitingHeaders(res, { timeframe, limit: key.limit, requestsLastPeriod: key.requestsLastPeriod });
        return res.status(429).json({ success: false, cause: "Ratelimit exceeded" });
      }

      await redis.hincrby(`API:Users:Keys:${hash}`, `${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 1);
      if (prefix) await redis.hincrby(`API:Users:Keys:${hash}`, `${prefix}Requests`, 1);
      await redis.hincrby(`API:Users:Keys:${hash}`, `requests`, 1);

      await redis.hincrby(`API:Users:Usage:${key.owner}`, new Date().toISOString().slice(0, 10), 1);

      APIKeyModel.updateOne(
        {
          owner: key.owner,
        },
        {
          $push: {
            requestHistory: {
              $each: [
                {
                  ID: res.getHeader("X-Request-ID"),
                  URL: req.originalUrl.slice(0, 2048),
                  method: req.method,
                  userAgent: req?.headers?.["user-agent"] ? req.headers["user-agent"].slice(0, 512) : null,
                  IP: req.headers["x-forwarded-for"],
                },
              ],
              $sort: { ID: -1 },
              $slice: 1000,
            },
          },
        },
        {
          upsert: true,
        }
      ).exec();

      (key.requestsLastPeriod as number)++;

      addIPToHistory(key.owner, String(req.headers["x-forwarded-for"]));
      setRatelimitingHeaders(res, { timeframe, limit: key.limit, requestsLastPeriod: key.requestsLastPeriod });

      return next();
    } catch (error) {
      Sentry.captureException(error);
      log("Middlewares", "The ratelimiting middleware is experiencing unexpected issues", "error");
      return res.status(500).json({ success: false });
    }
  };
};
