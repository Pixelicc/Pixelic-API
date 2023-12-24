import express from "express";
import * as Sentry from "@sentry/node";
import redis from "@pixelic/redis";
import { formatUUID, validateUUID } from "@pixelic/utils";
import { authorization } from "@pixelic/middlewares";

const router = express.Router();

type Tag = {
  text?: string;
  tooltip?: string;
  color?: string;
  appendIcon?: string;
  prependIcon?: string;
};

type UserTags = {
  [key: string]: [Tag];
};

router.get("/v2/pixelic-overlay/tags", async (req, res) => {
  try {
    const tags: UserTags = (JSON.parse((await redis.call("JSON.GET", "Pixelic-Overlay:Tags", "$")) as string) || [{}])[0];

    return res.json({ success: true, tags });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.post("/v2/pixelic-overlay/tags", authorization({ role: "ADMIN", scope: "pixelic-overlay:createTag" }), async (req, res) => {
  try {
    const { UUID, tag }: { UUID: string; tag: Tag } = req.body;

    if (validateUUID(UUID) && tag !== null && tag.constructor.name === "Object") {
      if (!(await redis.exists("Pixelic-Overlay:Tags"))) {
        await redis.call("JSON.SET", "Pixelic-Overlay:Tags", "$", JSON.stringify({}));
      }
      if (((await redis.call("JSON.TYPE", "Pixelic-Overlay:Tags", `$.${formatUUID(UUID)}`)) as []).length === 0) {
        await redis.call("JSON.SET", "Pixelic-Overlay:Tags", `$.${formatUUID(UUID)}`, JSON.stringify([]));
      }
      await redis.call("JSON.ARRAPPEND", "Pixelic-Overlay:Tags", `$.${formatUUID(UUID)}`, JSON.stringify(tag));
      return res.json({ success: true });
    } else {
      return res.status(422).json({ success: false, cause: "Invalid Tag Data" });
    }
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
