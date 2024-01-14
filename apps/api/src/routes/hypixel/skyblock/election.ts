import express from "express";
import * as Sentry from "@sentry/node";
import { getSkyblockElection } from "@pixelic/hypixel";
import { HypixelSkyblockElectionModel } from "@pixelic/mongo";
import { ratelimit } from "@pixelic/middlewares";

const router = express.Router();

router.get("/v1/hypixel/skyblock/election", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=3600");

    const election = await getSkyblockElection();
    if (election?.error) return res.status(500).json({ success: false });

    return res.json({ success: true, ...election.data });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/hypixel/skyblock/election/history", ratelimit(), async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=3600");

    const data = await HypixelSkyblockElectionModel.find({}, ["-__v"]).lean();
    const formattedData = [];
    for (const election of data) {
      formattedData.push({ year: election._id, candidates: election.candidates, timestamp: election.timestamp });
    }

    return res.json({ success: true, history: formattedData });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
