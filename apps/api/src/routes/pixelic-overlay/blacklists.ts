import express from "express";
import * as Sentry from "@sentry/node";
import { formatUUID, generateHexID, hashSHA512, validateHexID, validateUUID, validateUsername } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { PixelicOverlayBlacklistModel } from "@pixelic/mongo";
import { APIKeyRedis, APIUser } from "@pixelic/types";
import { ratelimit } from "@pixelic/middlewares";

const router = express.Router();

router.get("/v2/pixelic-overlay/blacklist/:ID", ratelimit(), async (req, res) => {
  try {
    if (!validateHexID(req.params.ID, 10)) return res.status(422).json({ success: false, cause: "Invalid ID" });

    const blacklist = await PixelicOverlayBlacklistModel.findById(req.params.ID, ["-entries.timestamp"]);
    if (blacklist === null) return res.status(422).json({ success: false, cause: "Invalid ID" });

    return res.json({
      success: true,
      ID: blacklist._id,
      entries: blacklist?.entries || [],
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v2/pixelic-overlay/blacklist/personal", ratelimit(), async (req, res) => {
  try {
    const key = (await redis.hgetall(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`)) as APIKeyRedis;
    const user = (await redis.hgetall(`API:Users:${key.owner}`)) as APIUser;

    if (!user.pixelicOverlayPersonalBlacklistID) {
      await PixelicOverlayBlacklistModel.create({ _id: generateHexID(10), owner: key.owner, timestamp: Math.floor(Date.now() / 1000) });
    }

    const blacklist = await PixelicOverlayBlacklistModel.findById(user.pixelicOverlayPersonalBlacklistID, ["-entries.timestamp"]);

    return res.json({
      success: true,
      ID: blacklist?._id || null,
      entries: blacklist?.entries || [],
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.post("/v2/pixelic-overlay/blacklist/personal", ratelimit(), async (req, res) => {
  try {
    const key = (await redis.hgetall(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`)) as APIKeyRedis;
    const user = (await redis.hgetall(`API:Users:${key.owner}`)) as APIUser;

    if (!user.pixelicOverlayPersonalBlacklistID) {
      await PixelicOverlayBlacklistModel.create({ _id: generateHexID(10), owner: key.owner, timestamp: Math.floor(Date.now() / 1000) });
    }

    const { UUID, reason } = req.body;
    if (!validateUUID(UUID) || !["CHEATING", "SNIPING"].includes(reason)) return res.status(422).json({ success: false, cause: "Invalid Body" });

    return await PixelicOverlayBlacklistModel.updateOne(
      { _id: user.pixelicOverlayPersonalBlacklistID },
      {
        $push: {
          entries: {
            _id: UUID,
            reason,
            timestamp: Math.floor(Date.now() / 1000),
          },
        },
        $set: { lastUpdated: Math.floor(Date.now() / 1000) },
        $inc: { updates: 1 },
      }
    )
      .then(() => {
        return res.json({ success: true });
      })
      .catch(() => {
        return res.status(500).json({ success: false });
      });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
