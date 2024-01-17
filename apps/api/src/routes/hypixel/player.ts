import express from "express";
import * as Sentry from "@sentry/node";
import { parseUUID } from "@pixelic/mojang";
import { HypixelHistoricalPlayerModel, HypixelPlayerModel } from "@pixelic/mongo";
import { ratelimit } from "@pixelic/middlewares";

const router = express.Router();

router.get("/v1/hypixel/player/:player", ratelimit(), async (req, res) => {
  const getUUID = await parseUUID(req.params.player);
  if (getUUID?.error) return res.status(getUUID?.error === "Unkown" ? 500 : 422).json({ success: false, cause: getUUID.error });
  const UUID = getUUID.data;
  try {
    const data = await HypixelPlayerModel.findOne({ _id: UUID }, ["-_id", "-__v"]).lean();
    if (data === null) return res.status(404).json({ success: false, cause: "No Data Available" });

    return res.json({ success: true, player: { UUID, ...data } });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/player/:player/history", ratelimit(), async (req, res) => {
  const getUUID = await parseUUID(req.params.player);
  if (getUUID?.error) return res.status(getUUID?.error === "Unkown" ? 500 : 422).json({ success: false, cause: getUUID.error });
  const UUID = getUUID.data;
  try {
    const data = await HypixelHistoricalPlayerModel.find({ UUID }, ["-UUID", "-__v"]).sort({ _id: 1 }).lean();
    data.pop();
    if (data.length === 0) {
      res.set("Cache-Control", "public, max-age=300");
      return res.status(404).json({ success: false, cause: "No Data Available" });
    }

    const formattedData = [];
    for (const day of data) {
      const currentDay = { ...day.data, timestamp: Math.floor(day._id.getTimestamp().valueOf() / 1000) };
      // @ts-ignore
      delete currentDay._id;
      formattedData.push(currentDay);
    }

    res.set("Cache-Control", "public, max-age=3600");
    return res.json({ success: true, history: formattedData });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
