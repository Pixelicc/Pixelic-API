import { Request, Response, NextFunction } from "express";
import { validateUUID, formatUUID } from "@pixelic/utils";
import * as Sentry from "@sentry/node";
import redis from "@pixelic/redis";
import { APIKeyRedis, APIKeyScope, RequireOneObjParam } from "@pixelic/types";

/**
 * Adds required authorization to a specific path/endpoint
 *
 * @param type Type of key that is allowed to make requests to a specific path/endpoint
 */
export const authorization = ({ type, scope }: RequireOneObjParam<{ type?: string | string[]; scope?: string }>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validateUUID(formatUUID(String(req.headers["x-api-key"])))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });
    if (!(await redis.exists(`API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });

    const data: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];
    if (scope && !data?.scopes?.includes(scope as APIKeyScope)) return res.status(403).json({ success: false, cause: `Insufficient Permissions - Requires ${scope} Scope` });
    if (typeof type === "string" && data.type !== type) return res.status(403).json({ success: false, cause: `Insufficient Permissions - Requires ${type} Key` });
    if (type && !type.includes(data?.type || "")) return res.status(403).json({ success: false, cause: `Insufficient Permissions - Requires ${type} Key` });

    Sentry.setUser({ id: data.owner });

    return next();
  };
};
