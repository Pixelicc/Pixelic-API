import express from "express";
import skyblock from "./skyblock/index.js";

const router = express.Router();

router.use(skyblock);

export default router;
