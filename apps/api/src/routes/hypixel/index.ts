import express from "express";
import skyblockAuctions from "./skyblockAuctions.js";

const router = express.Router();

router.use(skyblockAuctions);

export default router;
