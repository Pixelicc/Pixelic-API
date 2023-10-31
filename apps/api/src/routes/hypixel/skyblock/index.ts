import express from "express";
import auctionhouse from "./auctionhouse.js";
import bazaar from "./bazaar.js";
import items from "./items.js";
import election from "./election.js";

const router = express.Router();

router.use(auctionhouse, bazaar, items, election);

export default router;
