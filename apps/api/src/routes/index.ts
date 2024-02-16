import express from "express";

import minecraft from "./minecraft/index.js";
import hypixel from "./hypixel/index.js";
import wynncraft from "./wynncraft/index.js";

import stats from "./stats.js";

import user from "./user.js";

import docs from "./docs.js";
import OAuth2 from "./OAuth2.js";

import PixelicOverlay from "./pixelic-overlay/index.js";

const router = express.Router();

router.use(minecraft, hypixel, wynncraft, user, stats, docs, OAuth2, PixelicOverlay);

export default router;
