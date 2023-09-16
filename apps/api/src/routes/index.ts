import express from "express";
import APIKey from "./API-Key.js";
import stats from "./stats.js";

const router = express.Router();

router.use(APIKey, stats);

export default router;
