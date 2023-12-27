import express from "express";
import * as Sentry from "@sentry/node";
import { formatUUID, generateHexID, hashSHA512, validateArray, validateHexID, validateUUID } from "@pixelic/utils";
import redis from "@pixelic/redis";
import { PixelicOverlayBlacklistModel } from "@pixelic/mongo";
import { APIKeyRedis, APIUser } from "@pixelic/types";
import { ratelimit } from "@pixelic/middlewares";

const router = express.Router();

router.get("/v2/pixelic-overlay/blacklist/personal", ratelimit(), async (req, res) => {
  try {
    const key = (await redis.hgetall(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`)) as APIKeyRedis;
    const user = (await redis.hgetall(`API:Users:${key.owner}`)) as APIUser;

    if (!user.pixelicOverlayPersonalBlacklistID) {
      user.pixelicOverlayPersonalBlacklistID = generateHexID(10);
      await PixelicOverlayBlacklistModel.create({ _id: user.pixelicOverlayPersonalBlacklistID, owner: key.owner, timestamp: Math.floor(Date.now() / 1000), lastUpdated: Math.floor(Date.now() / 1000) });
      await redis.hset(`API:Users:${key.owner}`, { pixelicOverlayPersonalBlacklistID: user.pixelicOverlayPersonalBlacklistID });
    }

    const blacklist = await PixelicOverlayBlacklistModel.findById(user.pixelicOverlayPersonalBlacklistID);

    return res.json({
      success: true,
      ID: blacklist?._id || null,
      entries: blacklist?.entries.reduce((acc, { UUID, reason, timestamp }) => ({ ...acc, [UUID]: { reason, timestamp } }), {}) || {},
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v2/pixelic-overlay/blacklist/:ID", ratelimit(), async (req, res) => {
  try {
    if (!validateHexID(req.params.ID, 10)) return res.status(422).json({ success: false, cause: "Invalid ID" });

    const blacklist = await PixelicOverlayBlacklistModel.findById(req.params.ID);
    if (blacklist === null) return res.status(422).json({ success: false, cause: "Invalid ID" });

    return res.json({
      success: true,
      ID: blacklist._id,
      entries: blacklist?.entries.reduce((acc, { UUID, reason, timestamp }) => ({ ...acc, [UUID]: { reason, timestamp } }), {}) || {},
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
      user.pixelicOverlayPersonalBlacklistID = generateHexID(10);
      await PixelicOverlayBlacklistModel.create({ _id: user.pixelicOverlayPersonalBlacklistID, owner: key.owner, timestamp: Math.floor(Date.now() / 1000), lastUpdated: Math.floor(Date.now() / 1000) });
      await redis.hset(`API:Users:${key.owner}`, { pixelicOverlayPersonalBlacklistID: user.pixelicOverlayPersonalBlacklistID });
    }

    const { UUID, reason } = req.body;
    if (!validateUUID(UUID) || !["CHEATING", "SNIPING"].includes(reason)) return res.status(422).json({ success: false, cause: "Invalid Body" });

    const blacklist = await PixelicOverlayBlacklistModel.findById(user.pixelicOverlayPersonalBlacklistID);

    if (!blacklist?.entries.some((entry) => entry.UUID === formatUUID(UUID))) {
      return await PixelicOverlayBlacklistModel.updateOne(
        { _id: user.pixelicOverlayPersonalBlacklistID },
        {
          $push: {
            entries: {
              UUID: formatUUID(UUID),
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
    }

    return res.status(409).json({ success: false });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.delete("/v2/pixelic-overlay/blacklist/personal", ratelimit(), async (req, res) => {
  try {
    const key = (await redis.hgetall(`API:Users:Keys:${hashSHA512(formatUUID(String(req.headers["x-api-key"])))}`)) as APIKeyRedis;
    const user = (await redis.hgetall(`API:Users:${key.owner}`)) as APIUser;

    if (!user.pixelicOverlayPersonalBlacklistID) return res.status(404).json({ success: false });

    if (!validateArray(req.body, validateUUID)) {
      return res.status(422).json({ success: false, cause: "Invalid Body" });
    }

    return await PixelicOverlayBlacklistModel.updateOne(
      { _id: user.pixelicOverlayPersonalBlacklistID },
      {
        $pull: {
          entries: {
            UUID: {
              $in: req.body,
            },
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
