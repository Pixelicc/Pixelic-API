import express from "express";
import redis from "@pixelic/redis";

const router = express.Router();

router.get("/v1/minecraft/uuids", async (req, res) => {
  try {
    res.set("Cache-Control", `public, max-age=31536000, stale-while-revalidate=60`);

    var page = 0;
    const totalUUIDs = await redis.zcard("Mojang:UUIDList");
    const totalPages = Math.ceil(totalUUIDs / 100000);

    if (isNaN(Number(req.query.page)) && req.query.page !== undefined) return res.status(422).json({ success: false, cause: "Invalid Page" });
    if (Number(req.query.page) < 0 && req.query.page !== undefined) return res.status(422).json({ success: false, cause: "Invalid Page" });
    if (req.query.page !== undefined) page = Number(req.query.page);
    if (page > totalPages) return res.status(422).json({ success: false, cause: "Invalid Page" });
    if (page === totalPages) res.set("Cache-Control", `public, max-age=900, stale-while-revalidate=60`);

    return res.json({
      success: true,
      totalPages: totalPages,
      currentPage: page,
      totalUUIDs: totalUUIDs,
      UUIDs: await redis.zrange("Mojang:UUIDList", page * 100000, page * 100000 + 100000),
    });
  } catch {
    return res.status(500).json({ sucess: false });
  }
});

export default router;
