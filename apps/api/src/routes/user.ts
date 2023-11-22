import express from "express";
import { authorization, ratelimit } from "@pixelic/middlewares";
import redis from "@pixelic/redis";
import { decodeULIDTime, formatUUID, generateUUID, hashSHA512, objectStringToNumber } from "@pixelic/utils";
import { APIKeyModel } from "@pixelic/mongo";
import { APIKeyMongo, APIKeyRedis, APIAuthRole, APIAuthScope, APIUser, APIUserUsage } from "@pixelic/types";
import { DiscordSnowflake } from "@pixelic/types/src/discord.js";

const router = express.Router();

router.get("/v1/user", ratelimit(), async (req, res) => {
  const key = (await redis.hgetall(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`)) as APIKeyRedis;
  const user = (await redis.hgetall(`API:Users:${key.owner}`)) as APIUser;
  const requestHistory: APIKeyMongo["requestHistory"] = (await APIKeyModel.findOne({ owner: key.owner }, ["requestHistory.ID", "requestHistory.URL", "requestHistory.method", "requestHistory.userAgent", "requestHistory.IP"]).lean())?.requestHistory || [];

  const parsedRequestHistory: APIKeyMongo["requestHistory"] & { timestamp: number }[] = [];
  for (const request of requestHistory.reverse()) {
    parsedRequestHistory.push({ ...request, timestamp: Math.floor(decodeULIDTime(request.ID || String(res.get("X-Request-ID"))) / 1000) });
  }

  return res.json({
    success: true,
    role: user.role,
    scopes: JSON.parse(user.scopes as string),
    discordAccount: JSON.parse(user.discord as string),
    linkedAccounts: JSON.parse(user.linkedAccounts as string),
    totalRequests: Number(key.requests),
    usageHistory: objectStringToNumber((await redis.hgetall(`API:Users:Usage:${key.owner}`)) as APIUserUsage),
    IPHistory: await redis.zrevrange(`API:Users:IPs:${key.owner}`, 0, 100),
    requestHistory: parsedRequestHistory,
  });
});

router.get("/v1/user/usage", ratelimit(), async (req, res) => {
  const key = (await redis.hgetall(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`)) as APIKeyRedis;

  return res.json({
    success: true,
    totalRequests: Number(key.requests),
    usageHistory: objectStringToNumber((await redis.hgetall(`API:Users:Usage:${key.owner}`)) as APIUserUsage),
  });
});

router.patch("/v1/user", authorization({ role: "ADMIN", scope: "user:update" }), async (req, res) => {
  const { user, role, scopes }: { user: DiscordSnowflake; role: APIAuthRole | undefined; scopes: APIAuthScope[] | undefined } = req.body;
  if (!(await redis.exists(`API:Users:${String(user)}`))) return res.status(422).json({ success: false, cause: "This User does not exist" });

  if (typeof user !== "string") return res.status(422).json({ success: false, cause: "Invalid Body" });
  if (!["string", "undefined"].includes(typeof role)) return res.status(422).json({ success: false, cause: "Invalid Body" });
  if (!["object", "undefined"].includes(typeof scopes) || (typeof scopes === "object" && !Array.isArray(scopes))) return res.status(422).json({ success: false, cause: "Invalid Body" });

  await redis.hset(`API:Users:${user}`, { role, scopes: scopes ? JSON.stringify(scopes) : undefined });
  await redis.hset(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`, { role, scopes: scopes ? JSON.stringify(scopes) : undefined });

  return res.status(200).json({ success: true });
});

router.delete("/v1/user", ratelimit(), async (req, res) => {
  const owner = (await redis.hget(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`, "owner")) as DiscordSnowflake;
  await redis.del(`API:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`);
  await redis.del(`API:Users:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`);
  await APIKeyModel.deleteOne({ owner: owner });

  return res.status(200).json({ success: true });
});

export default router;
