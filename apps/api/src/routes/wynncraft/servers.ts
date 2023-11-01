import express from "express";
import * as Sentry from "@sentry/node";
import { getServerList } from "@pixelic/wynncraft";

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

export default router;
