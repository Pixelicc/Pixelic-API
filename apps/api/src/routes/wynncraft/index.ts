import express from "express";
import servers from "./servers.js";
import player from "./player.js";

const router = express.Router();

router.use(servers, player);

export default router;
