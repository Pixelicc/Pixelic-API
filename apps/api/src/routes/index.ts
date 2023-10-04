import express from "express";
import minecraft from "./minecraft/index.js";
import APIKey from "./API-Key.js";
import stats from "./stats.js";

const router = express.Router();

router.use(minecraft, APIKey, stats);

export default router;
