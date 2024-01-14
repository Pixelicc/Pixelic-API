import express from "express";
import * as Sentry from "@sentry/node";
import { ratelimit } from "@pixelic/middlewares";
import { getPlayer } from "@pixelic/hypixel";
import { validateUUID } from "@pixelic/utils";

const router = express.Router();

/**
 * THIS ENDPOINT IS PURELY MEANT FOR COMMUNICATING WITH THE PIXELIC-OVERLAY
 * USING THIS ENDPOINT FOR ANY OTHER PURPOSE IS PROHIBITED AND ABUSE WILL GET
 * YOUR API-KEY AND USER BANNED FROM THE PIXELIC-API
 */
router.get("/v2/pixelic-overlay/proxy/hypixel/player/:player", ratelimit("pixelicOverlayHypixelPlayerProxy", "5m", 200), async (req, res) => {
  try {
    if (!validateUUID(req.params.player)) return res.status(422).json({ success: false });

    const player = await getPlayer(req.params.player);
    if (player?.error === "Invalid Hypixel Player") return res.status(404).json({ success: false });
    if (player?.error === "Invalid UUID" || player?.error === "Invalid Username" || player?.error === "Invalid Player") return res.status(422).json({ success: false });
    if (player?.error === "Unkown") return res.status(500).json({ success: false });

    return res.json({ success: true, player: player.data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
