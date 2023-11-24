import express from "express";
import * as Sentry from "@sentry/node";
import { parseUUID } from "@pixelic/mojang";
import { HypixelHistoricalPlayerModel, HypixelPlayerModel } from "@pixelic/mongo";
import { authorization, ratelimit } from "@pixelic/middlewares";
import { getPlayer } from "@pixelic/hypixel";

const router = express.Router();

/**
 * Exposes the internal libary for other self-developed projects
 *
 * MAKING PROXY ENDPOINTS PUBLICLY ACCESSABLE IS NOT ALLOWED
 * https://developer.hypixel.net/policies
 */
router.get("/v1/hypixel/proxy/player/:player", authorization({ role: "ADMIN", scope: "hypixel:proxy" }), async (req, res) => {
  try {
    const player = await getPlayer(req.params.player);
    if (player === null) return res.status(422).json({ success: false });

    return res.json({ success: true, player });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/player/:player", ratelimit(), async (req, res) => {
  const UUID = await parseUUID(req.params.player);
  if (UUID === null) return res.status(422).json({ success: false, cause: "Invalid Player" });
  try {
    const data = await HypixelPlayerModel.findOne({ _id: UUID }, ["-_id", "-__v"]).lean();
    if (Object.keys(data as object).length === 0) return res.status(404).json({ success: false, cause: "No Data Available" });

    return res.json({ success: true, UUID, ...data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/player/:player/history", ratelimit(), async (req, res) => {
  const UUID = await parseUUID(req.params.player);
  if (UUID === null) return res.status(422).json({ success: false, cause: "Invalid Player" });
  try {
    const data = await HypixelHistoricalPlayerModel.find({ UUID }, ["-UUID", "-__v"]).lean();
    data.pop();
    if (data.length === 0) {
      res.set("Cache-Control", "public, max-age=300");
      return res.status(404).json({ success: false, cause: "No Data Available" });
    }

    const formattedData = [];
    for (const day of data) {
      const currentDay = { ...day, timestamp: Math.floor(day._id.getTimestamp().valueOf() / 1000) };
      // @ts-ignore
      delete currentDay._id;
      formattedData.push(currentDay);
    }

    res.set("Cache-Control", "public, max-age=3600");
    return res.json({ success: true, data: formattedData });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
