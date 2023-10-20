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
    linkedAccounts: JSON.parse(user.linkedAccounts as string),
    totalRequests: Number(key.requests),
    usageHistory: objectStringToNumber((await redis.hgetall(`API:Users:Usage:${key.owner}`)) as APIUserUsage),
    IPHistory: await redis.zrevrange(`API:Users:IPs:${key.owner}`, 0, 100),
    requestHistory: parsedRequestHistory,
  });
});

router.get("/v1/user/usage", ratelimit(), async (req, res) => {
  const key = (await redis.hgetall(`API:Users:Keys:${formatUUID(String(req.headers["x-api-key"]))}`)) as APIKeyRedis;

  return res.json({
    success: true,
    totalRequests: Number(key.requests),
    usageHistory: objectStringToNumber((await redis.hgetall(`API:Users:Usage:${key.owner}`)) as APIUserUsage),
  });
});

router.post("/v1/user", authorization({ role: "ADMIN", scope: "key:create" }), async (req, res) => {
  const { role, scopes, discord }: { role: APIAuthRole | undefined; scopes: APIAuthScope[] | undefined; discord: { ID: DiscordSnowflake; [key: string]: any } } = req.body;
  if (await redis.exists(`API:Users:${String(discord?.ID)}`)) return res.status(422).json({ success: false, cause: "This User already exists" });

  if (typeof discord?.ID !== "string") return res.status(422).json({ success: false, cause: "Invalid Body" });
  if (!["string", "undefined"].includes(typeof role)) return res.status(422).json({ success: false, cause: "Invalid Body" });
  if (!["object", "undefined"].includes(typeof scopes) || (typeof scopes === "object" && !Array.isArray(scopes))) return res.status(422).json({ success: false, cause: "Invalid Body" });

  const key = formatUUID(generateUUID());

  await redis.hset(`API:Users:${discord.ID}`, {
    timestamp: Math.floor(Date.now() / 1000),
    discord: JSON.stringify(discord),
    role: role || "USER",
    scopes: JSON.stringify(scopes || []),
    linkedAccounts: JSON.stringify([]),
    keyHash: hashSHA512(key),
  });
  await redis.hset(`API:Users:Keys:${hashSHA512(key)}`, {
    timestamp: Math.floor(Date.now() / 1000),
    owner: discord.ID,
    role: role || "",
    scopes: JSON.stringify(scopes || []),
  });

  return res.status(201).json({
    success: true,
    user: {
      timestamp: Math.floor(Date.now() / 1000),
      discord,
      role: role || "USER",
      scopes: scopes || [],
      linkedAccounts: [],
      key: key,
      keyHash: hashSHA512(key),
    },
    key: {
      timestamp: Math.floor(Date.now() / 1000),
      owner: discord.ID,
      role: role || "USER",
      scopes: scopes || [],
    },
  });
});

router.patch("/v1/user/key", ratelimit("keyRegeneration", "1h", 3), async (req, res) => {
  const oldKey = hashSHA512(formatUUID(String(req.headers["x-api-key"])));
  const key = formatUUID(generateUUID());

  const owner = (await redis.hget(`API:Users:Keys:${oldKey}`, "owner")) as DiscordSnowflake;
  await redis.rename(`API:Users:Keys:${oldKey}`, `API:Users:Keys:${hashSHA512(key)}`);
  await redis.hset(`API:Users:Keys:${hashSHA512(key)}`, { keyHash: hashSHA512(key), lastKeyRegeneration: Math.floor(Date.now() / 1000) });
  await redis.hincrby(`API:Users:${owner}`, "keyRegenerations", 1);

  return res.status(200).json({ success: true, key: key });
});

router.patch("/v1/user", authorization({ role: "ADMIN", scope: "key:update" }), async (req, res) => {
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