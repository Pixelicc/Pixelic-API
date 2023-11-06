import express from "express";
import skyblock from "./skyblock/index.js";
import player from "./player.js";

const router = express.Router();

router.use(skyblock, player);

export default router;
