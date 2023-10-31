import express from "express";
import * as Sentry from "@sentry/node";
import { parseUUID } from "@pixelic/mojang";
import { formatTimeseries, formatUUID, validateSkyblockItemID, validateUUID, validateUsername } from "@pixelic/utils";
import { HypixelSkyblockAuctionModel, HypixelSkyblockAuctionhouseModel } from "@pixelic/mongo";
import { authorization, ratelimit } from "@pixelic/middlewares";
import { querySkyblockActiveAuctions } from "@pixelic/hypixel";

const router = express.Router();

router.get("/v1/hypixel/skyblock/auctionhouse/query", authorization({ role: ["STAFF", "ADMIN"], scope: "hypixel:queryAuctions" }), async (req, res) => {
  try {
    const { seller, sellerProfile, coop, category, bin, price, priceRange, name, lore, tier, itemID } = req.query as { [key: string]: string };

    const query: string[] = [];

    const sanitize = (str: string) => str.replace(/[&<>"'/]/g, "");

    if (validateUUID(seller) || validateUsername(seller)) query.push(`@seller:{${await parseUUID(seller)}}`);
    if (validateUUID(seller)) query.push(`@sellerProfile:{${formatUUID(seller)}}`);
    if (["true", "false"].includes(coop)) query.push(`@coop:{${coop}}`);
    if (["WEAPON", "ARMOR", "ACCESSORIES", "CONSUMABLES", "BLOCKS", "MISC"].includes(category)) query.push(`@category:{${category}}`);
    if (["true", "false"].includes(bin)) query.push(`@bin:{${bin}}`);
    if (!isNaN(Number(price))) query.push(`@price:[${price},${price}]`);
    if (/^\[\-?(\d+|inf),\-?(\d+|inf)\]$/.test(priceRange)) query.push(`@price:${priceRange}`);
    if (name) query.push(`@itemName:${sanitize(decodeURI(name))}`);
    if (lore) query.push(`@itemLore:${sanitize(decodeURI(lore))}`);
    if (["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE", "SPECIAL", "VERY_SPECIAL"].includes(tier)) query.push(`@itemTier:{${tier}}`);
    if (validateUUID(itemID)) query.push(`@itemID:{${formatUUID(itemID)}}`);

    return res.json({
      success: true,
      filter: {
        seller,
        sellerProfile,
        coop: coop ? Boolean(coop) : undefined,
        category,
        bin: bin ? Boolean(bin) : undefined,
        price: price ? Number(price) : undefined,
        priceRange: priceRange
          ? {
              min: priceRange.slice(1, priceRange.indexOf(",")).includes("inf") ? priceRange.slice(1, priceRange.indexOf(",")) : Number(priceRange.slice(1, priceRange.indexOf(","))),
              max: priceRange.slice(priceRange.indexOf(",") + 1, -1).includes("inf") ? priceRange.slice(priceRange.indexOf(",") + 1, -1) : Number(priceRange.slice(priceRange.indexOf(",") + 1, -1)),
            }
          : undefined,
        name,
        lore,
        tier,
        itemID,
      },
      ...(await querySkyblockActiveAuctions(query.join(" "))),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/player/:player/recent", ratelimit(), async (req, res) => {
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
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/player/:player", ratelimit(), async (req, res) => {
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
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/item/:item", ratelimit(), async (req, res) => {
  try {
    if (!validateUUID(formatUUID(req.params.item))) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item UUID" });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      data: formatTimeseries(await HypixelSkyblockAuctionModel.find({ "data.item.attributes.UUID": formatUUID(req.params.item) }, ["-_id", "-__v"]).lean(), { meta: "seller" }),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/price/:id", ratelimit(), async (req, res) => {
  try {
    if (!validateSkyblockItemID(req.params.id)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      success: true,
      ...formatTimeseries(await HypixelSkyblockAuctionhouseModel.find({ meta: req.params.id }, ["-meta", "-_id", "-__v"]).sort({ timestamp: -1 }).limit(1).lean())[0],
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/price/:id/history", ratelimit(), async (req, res) => {
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
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/auctionhouse/price/:id/history/:timeframe", ratelimit(), async (req, res) => {
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
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
