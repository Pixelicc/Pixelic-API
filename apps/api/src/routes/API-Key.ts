import express from "express";
import { authorization, ratelimit } from "@pixelic/middlewares";
import redis from "@pixelic/redis";
import { formatUUID, generateUUID } from "@pixelic/utils";
import { APIKeyModel } from "@pixelic/mongo";
import { APIKeyMongo, APIKeyRedis } from "@pixelic/types";
import { decodeTime } from "ulidx";

const router = express.Router();

router.get("/v1/key", ratelimit(), async (req, res) => {
  const redisData: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];
  const mongoData: APIKeyMongo = (await APIKeyModel.findOne({ owner: redisData.owner }, ["owner", "usageHistory", "requestHistory.ID", "requestHistory.URL", "requestHistory.method", "requestHistory.userAgent", "requestHistory.IP", "requestHistory.key"]).lean()) || { owner: redisData.owner, usageHistory: {}, requestHistory: [] };

  const parsedRequestHistory: {}[] = [];
  for (const request of mongoData.requestHistory.reverse()) {
    parsedRequestHistory.push({ ...request, timestamp: Math.floor(decodeTime(request.ID || String(res.get("X-Request-ID"))) / 1000) });
  }

  redisData.keyHistory[redisData.keyHistory.length - 1].requests = redisData.requests - redisData.keyHistory.reduce((n, { requests }) => n + requests, 0);

  res.set("Cache-Control", "public, max-age=0");

  return res.json({
    success: true,
    owner: redisData.owner,
    type: redisData?.type || "DEFAULT",
    scopes: redisData?.scopes || [],
    totalRequests: redisData.requests,
    usageHistory: mongoData.usageHistory,
    IPHistory: redisData.IPHistory,
    keyHistory: redisData.keyHistory,
    requestHistory: parsedRequestHistory,
  });
});

router.get("/v1/key/usage", ratelimit(), async (req, res) => {
  const redisData: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];
  const mongoData: APIKeyMongo = (await APIKeyModel.findOne({ owner: redisData.owner }, ["usageHistory"]).lean()) || { owner: redisData.owner, usageHistory: {}, requestHistory: [] };

  res.set("Cache-Control", "public, max-age=0");

  return res.json({
    success: true,
    totalRequests: redisData.requests,
    usageHistory: mongoData.usageHistory,
  });
});

router.post("/v1/key", authorization({ type: "ADMIN" }), async (req, res) => {
  if (await redis.exists(`API:Users:${String(req.query.owner)}`)) return res.status(422).json({ success: false, cause: "This user already has an API-Key" });
  if (!req.query.owner) return res.status(422).json({ success: false, cause: "Invalid Owner" });

  const key = formatUUID(generateUUID());

  await redis.set(`API:Users:${String(req.query.owner)}`, key);
  await redis.call(
    "JSON.SET",
    `API:Keys:${key}`,
    "$",
    JSON.stringify({
      owner: String(req.query.owner),
      IPHistory: [],
      keyHistory: [
        {
          key: key,
          requests: 0,
          timestamp: Math.floor(Date.now() / 1000),
        },
      ],
    })
  );

  return res.status(201).json({ success: true, key: key });
});

router.patch("/v1/key", ratelimit(), async (req, res) => {
  if (await redis.exists(`API:Keys:Regen:${formatUUID(String(req.headers["x-api-key"]))}`)) return res.status(429).json({ success: false, cause: "Ratelimit exceeded" });

  const redisData: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];

  await redis.del(`API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`);

  const key = formatUUID(generateUUID());

  redisData.keyHistory = [...redisData.keyHistory, { key: key, requests: 0, timestamp: Math.floor(Date.now() / 1000) }].sort((a, b) => b.timestamp - a.timestamp);
  redisData.keyHistory[1].requests = redisData.requests - redisData.keyHistory.reduce((n, { requests }) => n + requests, 0);

  await redis.setex(`API:Keys:Regen:${key}`, 3600, "");
  await redis.call("JSON.SET", `API:Keys:${key}`, "$", JSON.stringify(redisData));
  await redis.set(`API:Users:${redisData.owner}`, key);

  return res.status(200).json({ success: true, key: key });
});

router.delete("/v1/key", ratelimit(), async (req, res) => {
  const redisData: APIKeyRedis = JSON.parse((await redis.call("JSON.GET", `API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`, "$")) as string)[0];

  await redis.del(`API:Keys:${formatUUID(String(req.headers["x-api-key"]))}`);
  await redis.del(`API:Users:${redisData.owner}`);
  await APIKeyModel.deleteOne({ owner: redisData.owner });

  return res.status(200).json({ success: true });
});

export default router;
