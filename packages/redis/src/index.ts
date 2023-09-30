import { Redis } from "ioredis";
import { config } from "@pixelic/utils";

const connection = new Redis(config.database.redis);

connection
  .call("FT.CREATE", "Hypixel.Skyblock.Auction", "ON", "JSON", "PREFIX", "1", "Hypixel:Auctions:", "SCHEMA", "$.seller", "AS", "seller", "TAG", "$.sellerProfile", "AS", "sellerProfile", "TAG", "$.coop", "AS", "coop", "TAG", "$.category", "AS", "category", "TAG", "$.bin", "AS", "bin", "TAG", "$.highestBid", "AS", "price", "NUMERIC", "$.item.name", "AS", "itemName", "TEXT", "$.item.tier", "AS", "itemTier", "TAG", "$.item.lore", "AS", "itemLore", "TEXT", "$.item.attributes.ID", "AS", "itemID", "TAG")
  .catch(() => {});

export default connection;
