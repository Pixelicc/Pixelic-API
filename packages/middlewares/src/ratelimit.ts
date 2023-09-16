import { Request, Response, NextFunction } from "express";
import { validateUUID, formatUUID } from "@packages/utils";
import * as Sentry from "@sentry/node";
import redis from "@packages/redis";
import { APIKeyModel } from "@packages/mongo";
import { APIKeyRedis } from "@pixelic/types";

/**
 * Adds ratelimiting to a specific path/endpoint
 *
 * @param prefix Prefix to add to the ratelimiting attributes in Redis - Defaults to the standard ratelimiting naming scheme
 * @param timeframe Sets when the ratelimit will reset again - Defaults to 1m
 * @param limit Limits how many requests a user can send during the current period - Defaults to 60
 */
export const ratelimit = (prefix?: string, timeframe?: "5m" | "1h" | "1d", limit?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validateUUID(formatUUID(String(req.headers["x-api-key"])))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });
    if (!(await redis.exists(`API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });

    var data: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];

    Sentry.setUser({ id: data.owner });

    if (data[prefix ? prefix + "Limit" : "limit"] === undefined) {
      data[prefix ? prefix + "Limit" : "limit"] = limit ? limit : 60;
      data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"] = 0;
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "Limit" : "limit"}`, limit ? limit : 60);
    }

    if (timeframe === undefined && data[prefix ? prefix + "LastRequest" : "lastRequest"] !== new Date().getUTCMinutes()) {
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "LastRequest" : "lastRequest"}`, new Date().getUTCMinutes());
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
      data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"] = 0;
    }

    if (timeframe === "5m" && data[prefix ? prefix + "LastRequest" : "lastRequest"] !== new Date(Math.floor(new Date().getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)).getUTCMinutes()) {
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "LastRequest" : "lastRequest"}`, new Date(Math.floor(new Date().getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)).getUTCMinutes());
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
      data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"] = 0;
    }

    if (timeframe === "1h" && data[prefix ? prefix + "LastRequest" : "lastRequest"] !== new Date().getUTCHours()) {
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "LastRequest" : "lastRequest"}`, new Date().getUTCHours());
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
      data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"] = 0;
    }

    if (timeframe === "1d" && data[prefix ? prefix + "LastRequest" : "lastRequest"] !== new Date().toISOString().slice(0, 10)) {
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "LastRequest" : "lastRequest"}`, JSON.stringify(new Date().toISOString().slice(0, 10)));
      await redis.call("JSON.SET", `API:Keys:${data.key}`, `$.${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 0);
      data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"] = 0;
    }

    if (data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"] >= data[prefix ? prefix + "Limit" : "limit"]) {
      res.set("X-RateLimit-Limit", String(data[prefix ? prefix + "Limit" : "limit"]));
      res.set("X-RateLimit-Remaining", String(data[prefix ? prefix + "Limit" : "limit"] - data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"]));
      if (timeframe === undefined) res.set("X-RateLimit-Reset", String(60 - new Date().getUTCSeconds()));
      if (timeframe === "5m") res.set("X-RateLimit-Reset", String(300 - (Math.floor(Date.now() / 1000) % 300)));
      if (timeframe === "1h") res.set("X-RateLimit-Reset", String(3600 - (new Date().getUTCMinutes() * 60 + new Date().getUTCSeconds())));
      if (timeframe === "1d") res.set("X-RateLimit-Reset", String(Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000)));
      return res.status(429).json({ success: false, cause: "Ratelimit exceeded" });
    }

    await redis.call("JSON.NUMINCRBY", `API:Keys:${data.key}`, `$.${prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"}`, 1);
    if (prefix) await redis.call("JSON.NUMINCRBY", `API:Keys:${data.key}`, `$.${prefix}Requests`, 1);
    await redis.call("JSON.NUMINCRBY", `API:Keys:${data.key}`, `$.requests`, 1);

    await APIKeyModel.updateOne(
      {
        owner: data.owner,
      },
      {
        $inc: {
          [`usageHistory.${new Date().toISOString().slice(0, 10)}`]: 1,
        },
        $push: {
          requestHistory: {
            $each: [
              {
                ID: res.getHeader("X-Request-ID"),
                URL: req.originalUrl.slice(0, 2048),
                method: req.method,
                userAgent: req?.headers?.["user-agent"] ? req.headers["user-agent"].slice(0, 512) : null,
                IP: req.headers["x-forwarded-for"],
                key: req.headers["x-api-key"],
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
    );

    data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"]++;

    if (req.headers["x-forwarded-for"] !== undefined) {
      if (!data.IPHistory.some((IP: string) => IP === String(req.headers["x-forwarded-for"]))) {
        data.IPHistory.push(String(req.headers["x-forwarded-for"]));
        await redis.call("JSON.SET", `API:Keys:${data.key}`, "$.IPHistory", JSON.stringify(data.IPHistory.reverse().slice(0, 10).reverse()));
      }
    }

    res.set("X-RateLimit-Limit", String(data[prefix ? prefix + "Limit" : "limit"]));
    res.set("X-RateLimit-Remaining", String(data[prefix ? prefix + "Limit" : "limit"] - data[prefix ? prefix + "RequestsLastPeriod" : "requestsLastPeriod"]));
    if (timeframe === undefined) res.set("X-RateLimit-Reset", String(60 - new Date().getUTCSeconds()));
    if (timeframe === "5m") res.set("X-RateLimit-Reset", String(300 - (Math.floor(Date.now() / 1000) % 300)));
    if (timeframe === "1h") res.set("X-RateLimit-Reset", String(3600 - (new Date().getUTCMinutes() * 60 + new Date().getUTCSeconds())));
    if (timeframe === "1d") res.set("X-RateLimit-Reset", String(Math.floor((new Date().setUTCHours(24, 0, 0, 0) - Date.now()) / 1000)));

    return next();
  };
};
