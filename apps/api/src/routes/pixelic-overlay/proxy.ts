import express from "express";
import * as Sentry from "@sentry/node";
import { ratelimit } from "@pixelic/middlewares";
import { getPlayer } from "@pixelic/hypixel";
import { validateUUID } from "@pixelic/utils";

const router = express.Router();

router.get("/v2/pixelic-overlay/proxy/hypixel/player/:player", ratelimit("pixelicOverlayHypixelPlayerProxy", "5m", 200), async (req, res) => {
  try {
    if (!validateUUID(req.params.player)) return res.status(422).json({ success: false });

    const player = await getPlayer(req.params.player);
    if (player === "This player never played on Hypixel") return res.status(404).json({ success: false });
    if (player === null || player === "Invalid UUID or Username") return res.status(422).json({ success: false });

    return res.json({ success: true, player });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
