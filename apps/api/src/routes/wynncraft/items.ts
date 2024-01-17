import express from "express";
import * as Sentry from "@sentry/node";
import { getItems } from "@pixelic/wynncraft";

const router = express.Router();

router.get("/v1/wynncraft/items", async (req, res) => {
  try {
    const items = await getItems();
    if (items?.error) res.status(500).json({ success: false });
    res.set("Cache-Control", "public, max-age=3600");

    return res.json({ success: true, items: items.data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/wynncraft/items/:item", async (req, res) => {
  try {
    const items = await getItems();
    if (items?.error) return res.status(500).json({ success: false });
    if (!items.data[req.params.item]) return res.status(422).json({ success: false, cause: "Invalid Wynncraft Item ID" });
    res.set("Cache-Control", "public, max-age=3600");

    return res.json({ success: true, item: items.data[req.params.item] });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
