import { Request, Response, NextFunction } from "express";
import { validateUUID, formatUUID, hashSHA512 } from "@pixelic/utils";
import * as Sentry from "@sentry/node";
import redis from "@pixelic/redis";
import { APIAuthRole, APIAuthScope, RequireOneObjParam } from "@pixelic/types";
import { DiscordSnowflake } from "@pixelic/types/src/discord.js";

/**
 * Adds required authorization to a specific path/endpoint
 *
 * @param role Only Users with that specific role are allowed to make requests to this specific path/endpoint
 * @param scope Only Users that have this scope are allowed to make requests to this path/enpoint
 */
export const authorization = ({ role, scope }: RequireOneObjParam<{ role?: APIAuthRole | APIAuthRole[]; scope?: APIAuthScope }>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!validateUUID(formatUUID(String(req.headers["x-api-key"])))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });
    if (!(await redis.exists(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`))) return res.status(403).json({ success: false, cause: "Invalid API-Key" });

    const data = await redis.hmget(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`, "scopes", "role", "owner");
    if (scope && !data?.[0]?.includes(scope as APIAuthScope)) return res.status(403).json({ success: false, cause: "Insufficient Permissions", requires: role });
    if (typeof role === "string" && data[1] !== role) return res.status(403).json({ success: false, cause: "Insufficient Permissions", requires: scope });
    if (role && !role.includes(data[1] as APIAuthRole)) return res.status(403).json({ success: false, cause: "Insufficient Permissions", requires: scope });

    Sentry.setUser({ id: data[2] as DiscordSnowflake });

    return next();
  };
};
