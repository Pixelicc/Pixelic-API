import express from "express";
import * as Sentry from "@sentry/node";
import { formatTimeseries, validateSkyblockItemID } from "@pixelic/utils";
import { HypixelSkyblockBazaarModel } from "@pixelic/mongo";
import { ratelimit } from "@pixelic/middlewares";
import { getSkyblockBazaar } from "@pixelic/hypixel";

const router = express.Router();

router.get("/v1/hypixel/skyblock/bazaar", async (req, res) => {
  try {
    const bazaar = await getSkyblockBazaar({ itemInfo: true });
    if (bazaar?.error) return res.status(500).json({ success: false });

    res.set("Cache-Control", "public, max-age=60");
    return res.json({ success: true, products: bazaar.data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/bazaar/:product", async (req, res) => {
  try {
    if (!validateSkyblockItemID(req.params.product)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    const bazaar = await getSkyblockBazaar({ itemInfo: true });
    if (bazaar?.error) return res.status(500).json({ success: false });
    if (!bazaar.data[req.params.product]) return res.status(422).json({ success: false, cause: "Invalid Bazaar Product" });

    res.set("Cache-Control", "public, max-age=60");
    return res.json({ success: true, product: bazaar.data[req.params.product] });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/bazaar/:id/history", ratelimit(), async (req, res) => {
  try {
    if (!validateSkyblockItemID(req.params.id)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    res.set("Cache-Control", "public");
    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 0, 0);
    res.set("Expires", date.toUTCString());
    return res.json({
      success: true,
      history: formatTimeseries(await HypixelSkyblockBazaarModel.longTerm.find({ meta: req.params.id }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/bazaar/:id/history/:timeframe", ratelimit(), async (req, res) => {
  try {
    if (!["hour", "day", "week", "month", "year"].includes(req.params.timeframe)) return res.status(422).json({ success: false, cause: "Invalid Timeframe" });
    if (!validateSkyblockItemID(req.params.id)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    res.set("Cache-Control", "public");
    if (req.params.timeframe === "hour") {
      const date = new Date();
      date.setMinutes(new Date().getMinutes() + 1, 30, 0);
      res.set("Expires", date.toUTCString());
      return res.json({
        success: true,
        history: formatTimeseries(await HypixelSkyblockBazaarModel.shortTerm.find({ timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000), $lt: new Date() }, meta: req.params.id }, ["-meta", "-_id", "-__v"]).lean()),
      });
    }

    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 30, 0);
    res.set("Expires", date.toUTCString());
    var startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    var startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "week") startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "month") startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "year") startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    return res.json({
      success: true,
      history: formatTimeseries(await HypixelSkyblockBazaarModel.longTerm.find({ timestamp: { $gte: startDate, $lt: new Date() }, meta: req.params.id }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
