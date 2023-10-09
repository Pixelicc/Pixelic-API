import express from "express";
import redis from "@pixelic/redis";
import { formatTimeseries, formatUUID, validateUUID } from "@pixelic/utils";
import { MinecraftServerPlayercountModel } from "@pixelic/mongo";

const router = express.Router();

router.get("/v1/minecraft/server/list", async (req, res) => {
  try {
    if (!(await redis.exists("Minecraft:serverList"))) return res.status(500).json({ success: false });
    const serverList: { UUID: string; name: string; host: string; port: string }[] = JSON.parse((await redis.call("JSON.GET", "Minecraft:serverList", "$")) as string)[0];

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      servers: serverList,
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/minecraft/server/:server", async (req, res) => {
  try {
    const serverList: { UUID: string; name: string; host: string; port: string }[] = JSON.parse((await redis.call("JSON.GET", "Minecraft:serverList", "$")) as string)[0];
    if (!validateUUID(formatUUID(req.params.server)) || !serverList.some((s) => formatUUID(req.params.server) === s.UUID)) return res.status(422).json({ success: false, cause: "Invalid Server UUID" });

    res.set("Cache-Control", "public, max-age=60");
    const SLPData = JSON.parse((await redis.get(`Minecraft:Servers:${formatUUID(req.params.server)}`)) as string);

    return res.json({
      success: true,
      latency: SLPData.latency,
      maxPlayers: SLPData.players.max,
      onlinePlayers: SLPData.players.online,
      MOTD: SLPData.description,
      icon: SLPData.favicon,
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/minecraft/server/:server/history", async (req, res) => {
  try {
    const serverList: { UUID: string; name: string; host: string; port: string }[] = JSON.parse((await redis.call("JSON.GET", "Minecraft:serverList", "$")) as string)[0];
    if (!validateUUID(formatUUID(req.params.server)) || !serverList.some((s) => formatUUID(req.params.server) === s.UUID)) return res.status(422).json({ success: false, cause: "Invalid Server UUID" });

    res.set("Cache-Control", "public");
    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 30, 0);
    res.set("Expires", date.toUTCString());

    return res.json({
      success: true,
      data: formatTimeseries(await MinecraftServerPlayercountModel.longTerm.find({ meta: formatUUID(req.params.server) }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/minecraft/server/:server/history/:timeframe", async (req, res) => {
  try {
    if (!["hour", "day", "week", "month", "year"].includes(req.params.timeframe)) return res.status(422).json({ success: false, cause: "Invalid Timeframe" });
    const serverList: { UUID: string; name: string; host: string; port: string }[] = JSON.parse((await redis.call("JSON.GET", "Minecraft:serverList", "$")) as string)[0];
    if (!validateUUID(formatUUID(req.params.server)) || !serverList.some((s) => formatUUID(req.params.server) === s.UUID)) return res.status(422).json({ success: false, cause: "Invalid Server UUID" });

    res.set("Cache-Control", "public");
    if (req.params.timeframe === "hour") {
      const date = new Date();
      date.setMinutes(new Date().getMinutes() + 1, 30, 0);
      res.set("Expires", date.toUTCString());
      return res.json({
        success: true,
        data: formatTimeseries(await MinecraftServerPlayercountModel.shortTerm.find({ timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000), $lt: new Date() }, meta: formatUUID(req.params.server) }, ["-meta", "-_id", "-__v"]).lean()),
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
      data: formatTimeseries(await MinecraftServerPlayercountModel.longTerm.find({ timestamp: { $gte: startDate, $lt: new Date() }, meta: formatUUID(req.params.server) }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

export default router;
