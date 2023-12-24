import express from "express";
import proxy from "./proxy.js";
import blacklists from "./blacklists.js";
import tags from "./tags.js";

const router = express.Router();

router.use(proxy, blacklists, tags);

export default router;
