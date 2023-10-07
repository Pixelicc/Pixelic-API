import express from "express";
import skyblockAuctions from "./skyblockAuctions.js";
import skyblockBazaar from "./skyblockBazaar.js";

const router = express.Router();

router.use(skyblockAuctions, skyblockBazaar);

export default router;
