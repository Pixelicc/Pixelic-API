import express from "express";
import servers from "./servers.js";
import UUIDList from "./UUIDList.js";

const router = express.Router();

router.use(servers, UUIDList);

export default router;
