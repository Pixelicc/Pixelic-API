import { Request, Response, NextFunction } from "express";
import { validateUUID, formatUUID } from "@packages/utils";
import * as Sentry from "@sentry/node";
import redis from "@packages/redis";
import { APIKeyRedis } from "@pixelic/types";

/**
 * Adds required authorization to a specific path/endpoint
 *
 * @param type Type of key that is allowed to make requests to a specific path/endpoint
 */
export const authorization = (type: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validateUUID(formatUUID(String(req.headers["x-api-key"])))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });
    if (!(await redis.exists(`API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });

    const data: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];
    if (typeof type === "string" && data.type !== type) return res.status(403).json({ success: false, cause: "Insufficient Permissions" });
    if (!type.includes(data?.type || "")) return res.status(403).json({ success: false, cause: "Insufficient Permissions" });

    Sentry.setUser({ id: data.owner });

    return next();
  };
};
