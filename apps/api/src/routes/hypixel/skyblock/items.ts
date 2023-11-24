import express from "express";
import * as Sentry from "@sentry/node";
import { getSkyblockItems } from "@pixelic/hypixel";
import { validateSkyblockItemID } from "@pixelic/utils";

const router = express.Router();

router.get("/v1/hypixel/skyblock/items", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=3600");

    const data = await getSkyblockItems();
    if (!data) return res.status(500).json({ success: false });

    return res.json({ success: true, items: data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/items/:item", async (req, res) => {
  try {
    if (!validateSkyblockItemID(req.params.item)) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });

    const data = await getSkyblockItems();
    if (!data) return res.status(500).json({ success: false });
    if (!data[req.params.item]) return res.status(422).json({ success: false, cause: "Invalid Skyblock Item ID" });
    res.set("Cache-Control", "public, max-age=3600");

    return res.json({ success: true, item: data[req.params.item] });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
