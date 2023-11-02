import express from "express";
import * as Sentry from "@sentry/node";
import { getServerList } from "@pixelic/wynncraft";
import { ratelimit } from "@pixelic/middlewares";
import { WynncraftServerPlayercountModel } from "@pixelic/mongo";
import { formatTimeseries } from "@pixelic/utils";

const router = express.Router();

router.get("/v1/wynncraft/server/list", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60");

    const data = await getServerList({ UUIDs: true });
    if (!data) return res.status(500).json({ success: false });

    res.json({ success: true, ...data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/wynncraft/server/:server", async (req, res) => {
  try {
    if (!/^[A-Z0-9]+$/.test(req.params.server)) return res.status(422).json({ success: false, cause: "Invalid Server" });

    const data = await getServerList({ UUIDs: true });
    if (!data) return res.status(500).json({ success: false });
    if (!data.servers[req.params.server]) return res.status(422).json({ success: false, cause: "Invalid Server" });
    res.set("Cache-Control", "public, max-age=60");

    res.json({ success: true, ...data.servers[req.params.server] });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/wynncraft/server/:server/history", async (req, res) => {
  try {
    if (!/^[A-Z0-9]+$/.test(req.params.server)) return res.status(422).json({ success: false, cause: "Invalid Server" });

    res.set("Cache-Control", "public");
    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 0, 0);
    res.set("Expires", date.toUTCString());

    return res.json({
      success: true,
      data: formatTimeseries(await WynncraftServerPlayercountModel.longTerm.find({ meta: req.params.server }, ["-meta", "-_id", "-__v"]).lean(), { data: "playercount" }),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/wynncraft/server/:server/history/:timeframe", async (req, res) => {
  try {
    if (!["hour", "day", "week", "month", "year"].includes(req.params.timeframe)) return res.status(422).json({ success: false, cause: "Invalid Timeframe" });
    if (!/^[A-Z0-9]+$/.test(req.params.server)) return res.status(422).json({ success: false, cause: "Invalid Server" });

    res.set("Cache-Control", "public");
    if (req.params.timeframe === "hour") {
      const date = new Date();
      date.setMinutes(new Date().getMinutes() + 1, 30, 0);
      res.set("Expires", date.toUTCString());
      return res.json({
        success: true,
        data: formatTimeseries(await WynncraftServerPlayercountModel.shortTerm.find({ timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000), $lt: new Date() }, meta: req.params.server }, ["-meta", "-_id", "-__v"]).lean(), { data: "playercount" }),
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
      data: formatTimeseries(await WynncraftServerPlayercountModel.longTerm.find({ timestamp: { $gte: startDate, $lt: new Date() }, meta: req.params.server }, ["-meta", "-_id", "-__v"]).lean(), { data: "playercount" }),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});
export default router;
