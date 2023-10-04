import express from "express";
import servers from "./servers.js";

const router = express.Router();

router.use(servers);

export default router;
