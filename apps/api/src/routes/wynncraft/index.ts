import express from "express";
import servers from "./servers.js";
import player from "./player.js";
import items from "./items.js";

const router = express.Router();

router.use(servers, player, items);

export default router;
