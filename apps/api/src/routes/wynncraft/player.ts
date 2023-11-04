import express from "express";
import * as Sentry from "@sentry/node";
import { parseUUID } from "@pixelic/mojang";
import { WynncraftHistoricalPlayerModel } from "@pixelic/mongo";

const router = express.Router();

router.get("/v1/wynncraft/player/:player/history", async (req, res) => {
  const UUID = await parseUUID(req.params.player);
  if (UUID === null) return res.status(422).json({ success: false, cause: "Invalid Player" });
  try {
    const data = await WynncraftHistoricalPlayerModel.find({ UUID }, ["-__v"]).lean();
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
