import express from "express";
import { parseUUID } from "@pixelic/mojang";
import { formatTimeseries, formatUUID, validateSkyblockItemID, validateUUID } from "@pixelic/utils";
import { HypixelSkyblockAuctionModel, HypixelSkyblockAuctionhouseModel } from "@pixelic/mongo";

const router = express.Router();

router.get("/v1/hypixel/skyblock/auctionhouse/player/:player/recent", async (req, res) => {
  try {
    const UUID = await parseUUID(req.params.player);
    if (UUID === null) return res.status(422).json({ success: false, cause: "Invalid Player" });
    if (!req?.query?.data && !["sell", "buy"].includes(String(req.query.data))) return res.status(422).json({ success: false, cause: "Invalid Data Type" });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      data: formatTimeseries(
        await HypixelSkyblockAuctionModel.find(req.query.data === "sell" ? { meta: UUID } : { "data.buyer": UUID }, ["-_id", "-__v"])
          .sort({ timestamp: -1 })
          .limit(100)
          .lean(),
        { meta: "seller" }
      ),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/player/:player", async (req, res) => {
  try {
    const UUID = await parseUUID(req.params.player);
    if (UUID === null) return res.status(422).json({ success: false, cause: "Invalid Player" });
    if (!req?.query?.data && !["sell", "buy"].includes(String(req.query.data))) return res.status(422).json({ success: false, cause: "Invalid Data Type" });
    if (req?.query?.page && isNaN(Number(req.query.page))) return res.status(422).json({ success: false, cause: "Invalid Page" });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      data: formatTimeseries(
        await HypixelSkyblockAuctionModel.find(req.query.data === "sell" ? { meta: UUID } : { "data.buyer": UUID }, ["-_id", "-__v"])
          .skip(req?.query?.page ? Number(req.query.page) * 100 : 0)
          .limit(100)
          .lean(),
        { meta: "seller" }
      ),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/item/:item", async (req, res) => {
  try {
    if (!validateUUID(formatUUID(req.params.item))) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item UUID" });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      data: formatTimeseries(await HypixelSkyblockAuctionModel.find({ "data.item.attributes.UUID": formatUUID(req.params.item) }, ["-_id", "-__v"]).lean(), { meta: "seller" }),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/price/:id", async (req, res) => {
  try {
    if (!validateSkyblockItemID(req.params.id)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      ...formatTimeseries(await HypixelSkyblockAuctionhouseModel.find({ meta: req.params.id }, ["-meta", "-_id", "-__v"]).sort({ timestamp: -1 }).limit(1).lean())[0],
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/price/:id/history", async (req, res) => {
  try {
    if (!validateSkyblockItemID(req.params.id)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    res.set("Cache-Control", "public");
    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 0, 0);
    res.set("Expires", date.toUTCString());

    return res.json({
      success: true,
      data: formatTimeseries(await HypixelSkyblockAuctionhouseModel.find({ meta: req.params.id }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/price/:id/history/:timeframe", async (req, res) => {
  try {
    if (!["day", "week", "month", "year"].includes(req.params.timeframe)) return res.status(422).json({ success: false, cause: "Invalid Timeframe" });
    if (!validateSkyblockItemID(req.params.id)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    res.set("Cache-Control", "public");
    const date = new Date();
    date.setHours(new Date().getHours() + 1, 0, 30, 0);
    res.set("Expires", date.toUTCString());

    var startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "week") startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "month") startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (req.params.timeframe === "year") startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    return res.json({
      success: true,
      data: formatTimeseries(await HypixelSkyblockAuctionhouseModel.find({ timestamp: { $gte: startDate, $lt: new Date() }, meta: req.params.id }, ["-meta", "-_id", "-__v"]).lean()),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

export default router;
