import express from "express";
import minecraft from "./minecraft/index.js";
import hypixel from "./hypixel/index.js";
import user from "./user.js";
import stats from "./stats.js";

const router = express.Router();

router.use(minecraft, hypixel, user, stats);

export default router;
