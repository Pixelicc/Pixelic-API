import express from "express";
import * as Sentry from "@sentry/node";
import redis from "@pixelic/redis";
import { formatNumber, formatTimeseries } from "@pixelic/utils";
import { MinecraftServerPlayercountModel } from "@pixelic/mongo";
import { MinecraftServerList as servers } from "@pixelic/constants";

const router = express.Router();

router.get("/v1/minecraft/server/list", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      servers,
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/minecraft/server/:server", async (req, res) => {
  try {
    if (!servers.some((s) => req.params.server === s.ID)) return res.status(422).json({ success: false, cause: "Invalid Server ID" });

    res.set("Cache-Control", "public, max-age=60");
    const SLPData = JSON.parse((await redis.get(`Minecraft:Servers:${req.params.server}`)) as string);

    return res.json({
      success: true,
      server: {
        latency: SLPData.latency,
        latencyFormatted: `${SLPData.latency}ms`,
        maxPlayercount: SLPData.players.max,
        maxPlayercountFormatted: formatNumber(SLPData.players.max, 2),
        playercount: SLPData.players.online,
        playercountFormatted: formatNumber(SLPData.players.online, 2),
        MOTD: SLPData.description,
        icon: SLPData.favicon,
      },
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/minecraft/server/:server/history", async (req, res) => {
  try {
    if (!servers.some((s) => req.params.server === s.ID)) return res.status(422).json({ success: false, cause: "Invalid Server ID" });

    res.set("Cache-Control", "public");
    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 30, 0);
    res.set("Expires", date.toUTCString());

    return res.json({
      success: true,
      history: formatTimeseries(await MinecraftServerPlayercountModel.longTerm.find({ meta: req.params.server }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/minecraft/server/:server/history/:timeframe", async (req, res) => {
  try {
    if (!["hour", "day", "week", "month", "year"].includes(req.params.timeframe)) return res.status(422).json({ success: false, cause: "Invalid Timeframe" });
    if (!servers.some((s) => req.params.server === s.ID)) return res.status(422).json({ success: false, cause: "Invalid Server ID" });

    res.set("Cache-Control", "public");
    if (req.params.timeframe === "hour") {
      const date = new Date();
      date.setMinutes(new Date().getMinutes() + 1, 30, 0);
      res.set("Expires", date.toUTCString());
      return res.json({
        success: true,
        history: formatTimeseries(await MinecraftServerPlayercountModel.shortTerm.find({ timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000), $lt: new Date() }, meta: req.params.server }, ["-meta", "-_id", "-__v"]).lean()),
      });
    }

    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 30, 0);
    res.set("Expires", date.toUTCString());
    var startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (req.params.timeframe === "week") startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "month") startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "year") startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    return res.json({
      success: true,
      history: formatTimeseries(await MinecraftServerPlayercountModel.longTerm.find({ timestamp: { $gte: startDate, $lt: new Date() }, meta: req.params.server }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
